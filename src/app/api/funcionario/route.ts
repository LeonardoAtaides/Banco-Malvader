// /api/funcionario/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // =============================================
    // 🔍 BUSCAR FUNCIONÁRIO + USUÁRIO
    // =============================================
    const funcionario = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: {
        usuario: {
          include: {
            endereco_usuario: true,
          },
        },
      },
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // =============================================
    // 📊 CARDS
    // =============================================
    const totalContasAbertas = await prisma.conta.count();
    const totalMovimentacoes = await prisma.transacao.count();
    const totalFuncionarios = await prisma.funcionario.count();

    // =============================================
    // 🆕 ÚLTIMAS CONTAS ABERTAS (tipoconta + numero)
    // =============================================
    const ultimasContas = await prisma.conta.findMany({
      orderBy: { data_abertura: "desc" },
      take: 5,
      select: {
        numero_conta: true,
        tipo_conta: true,
        data_abertura: true,
        cliente: {
          select: {
            usuario: { select: { nome: true } }
          }
        },
      },
    });

    // =============================================
    // 📝 ATIVIDADES RECENTES
    // =============================================
    const atividadesRecentes = await prisma.transacao.findMany({
      orderBy: { data_hora: "desc" },
      take: 5,
      select: {
        id_transacao: true,
        tipo_transacao: true,
        valor: true,
        data_hora: true,
        descricao: true,
        conta_transacao_id_conta_origemToconta: {
          select: { numero_conta: true },
        },
        conta_transacao_id_conta_destinoToconta: {
          select: { numero_conta: true },
        },
      },
    });

    // =============================================
    // 📦 RETORNO FINAL
    // =============================================
    const perfil = {
      nome: funcionario.usuario.nome,
      cargo: funcionario.cargo,

      cards: {
        totalContasAbertas,
        totalMovimentacoes,
        totalFuncionarios,
      },

      ultimasContas: ultimasContas.map((c) => ({
        cliente: c.cliente?.usuario?.nome || "Desconhecido",
        tipo_conta: c.tipo_conta,
        numero_conta: c.numero_conta,
        data_abertura: c.data_abertura,
      })),

      atividadesRecentes: atividadesRecentes.map((t) => ({
        id: t.id_transacao,
        tipo: t.tipo_transacao,
        valor: Number(t.valor),
        data_hora: t.data_hora,
        descricao: t.descricao,
        conta_origem:
          t.conta_transacao_id_conta_origemToconta?.numero_conta || null,
        conta_destino:
          t.conta_transacao_id_conta_destinoToconta?.numero_conta || null,
      })),
    };

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar perfil" },
      { status: 500 }
    );
  }
}
