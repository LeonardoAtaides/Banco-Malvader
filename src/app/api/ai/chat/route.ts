import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import {
  OllamaClient,
  redactPII,
  containsSensitiveData,
  type AIChatMessage,
} from "@/lib/ai/client";
import { z } from "zod";
import { randomUUID } from "crypto";

/**
 * Schema de validação da requisição
 */
const chatRequestSchema = z.object({
  sessionId: z.string().uuid().nullish(),
  message: z.string().min(1).max(2000),
  allowSensitiveData: z.boolean().optional().default(false),
});

/**
 * System prompt do banco
 */
const SYSTEM_PROMPT = `Você é o Assistente Virtual do Banco Malvader. Suas responsabilidades:
- Responder perguntas sobre serviços bancários (contas, transferências, investimentos)
- Ser educado, claro e objetivo
- NUNCA pedir ou processar dados sensíveis (senhas, CPF completo, números de conta)
- Para operações financeiras, orientar o usuário a usar o sistema ou contatar atendente
- Se não souber algo, admita e ofereça contato com atendente humano

Mantenha respostas curtas e diretas (máximo 3-4 frases).`;

/**
 * POST /api/ai/chat
 * Processa mensagem do chat com IA
 */
export async function POST(request: NextRequest) {
  try {
    //  Validar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // BYPASS TEMPORÁRIO PARA TESTE (remover em produção)
    let payload;
    if (token === "fake-token-for-testing") {
      console.warn("⚠️ Usando autenticação fake para teste!");
      payload = {
        id_usuario: 1, // ID de teste
        nome: "Usuário Teste",
        tipo_usuario: "CLIENTE",
      };
    } else {
      payload = verificarToken(token);
    }

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    //  Validar entrada
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, message, allowSensitiveData } = validation.data;

    //  Verificar dados sensíveis
    if (!allowSensitiveData && containsSensitiveData(message)) {
      return NextResponse.json(
        {
          error:
            "Sua mensagem parece conter dados sensíveis. Por segurança, não envie CPF, senhas ou números de conta. Prefere falar com um atendente?",
          requiresConsent: true,
        },
        { status: 400 }
      );
    }

    //  Criar ou buscar sessão
    let session;
    let previousMessages: any[] = [];
    
    if (sessionId) {
      session = await prisma.chat_session.findUnique({
        where: { uuid: sessionId },
        include: { mensagens: { orderBy: { criado_em: "asc" } } },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Sessão não encontrada" },
          { status: 404 }
        );
      }
      
      previousMessages = session.mensagens || [];
    } else {
      // Criar nova sessão
      session = await prisma.chat_session.create({
        data: {
          uuid: randomUUID(),
          id_usuario: payload.id_usuario,
          titulo: message.substring(0, 50), // Primeiras palavras como título
        },
      });
    }

    //  Salvar mensagem do usuário
    await prisma.chat_message.create({
      data: {
        uuid: randomUUID(),
        session_uuid: session.uuid,
        role: "user",
        conteudo: message,
      },
    });

    //  Preparar contexto (últimas mensagens)
    const conversationHistory: AIChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Adicionar mensagens anteriores (últimas 3 apenas para economizar memória)
    for (const msg of previousMessages.slice(-3)) {
      conversationHistory.push({
        role: msg.role === "USER" ? "user" : "assistant",
        content: msg.conteudo,
      });
    }

    // Adicionar mensagem atual
    conversationHistory.push({ role: "user", content: message });

    // Chamar Ollama
    const aiClient = new OllamaClient();

    // Verificar se Ollama está rodando
    const isHealthy = await aiClient.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        {
          error: "Serviço de IA temporariamente indisponível",
          fallback:
            "Desculpe, estou com dificuldades técnicas. Gostaria de falar com um atendente?",
        },
        { status: 503 }
      );
    }

    // Aplicar redação antes de enviar (camada extra de segurança)
    const safeHistory = conversationHistory.map((msg) => ({
      ...msg,
      content: msg.role === "user" ? redactPII(msg.content) : msg.content,
    }));

    const aiResponse = await aiClient.chat(safeHistory);

    //  Salvar resposta da IA
    const assistantMessage = await prisma.chat_message.create({
      data: {
        uuid: randomUUID(),
        session_uuid: session.uuid,
        role: "assistant",
        conteudo: aiResponse.text,
        metadados: {
          model: aiResponse.model,
          tokensUsed: aiResponse.tokensUsed,
          duration: aiResponse.duration,
        },
      },
    });

    //  Atualizar timestamp da sessão
    await prisma.chat_session.update({
      where: { uuid: session.uuid },
      data: { atualizado_em: new Date() },
    });

    //  Retornar resposta
    return NextResponse.json({
      sessionId: session.uuid,
      message: {
        id: assistantMessage.uuid,
        content: aiResponse.text,
        role: "assistant",
        timestamp: assistantMessage.criado_em,
      },
      meta: {
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        duration: aiResponse.duration,
      },
    });
  } catch (error) {
    console.error("❌ Erro no chat AI:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");
    console.error("Message:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        error: "Erro ao processar mensagem",
        details: error instanceof Error ? error.message : String(error),
        fallback:
          "Desculpe, estou com dificuldades técnicas. Gostaria de falar com um atendente?",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat?sessionId=xxx
 * Busca histórico de uma sessão
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // BYPASS TEMPORÁRIO PARA TESTE (remover em produção)
    let payload;
    if (token === "fake-token-for-testing") {
      payload = {
        id_usuario: 1,
        nome: "Usuário Teste",
        tipo_usuario: "CLIENTE",
      };
    } else {
      payload = verificarToken(token);
    }

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      // Listar todas as sessões do usuário
      const sessions = await prisma.chat_session.findMany({
        where: { id_usuario: payload.id_usuario },
        orderBy: { atualizado_em: "desc" },
        take: 20,
        select: {
          uuid: true,
          titulo: true,
          status: true,
          criado_em: true,
          atualizado_em: true,
          _count: { select: { mensagens: true } },
        },
      });

      return NextResponse.json({ sessions });
    }

    // Buscar sessão específica com mensagens
    const session = await prisma.chat_session.findUnique({
      where: { uuid: sessionId },
      include: {
        mensagens: {
          orderBy: { criado_em: "asc" },
          select: {
            uuid: true,
            role: true,
            conteudo: true,
            criado_em: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
