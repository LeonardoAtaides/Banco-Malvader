import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema de validação para extrato (query params)
 */
const extratoQuerySchema = z.object({
  numero_conta: z.string().min(1, "Número da conta é obrigatório"),
  limite: z.coerce.number().int().positive().max(100).optional().default(50),
  pagina: z.coerce.number().int().positive().optional().default(1),
  tipo_transacao: z.enum(["DEPOSITO", "SAQUE", "TRANSFERENCIA", "TAXA", "RENDIMENTO"]).optional(),
});

/**
 * GET /api/transacao/extrato?numero_conta=XXX&limite=50&pagina=1&tipo_transacao=DEPOSITO
 * Retorna o extrato de transações de uma conta
 */
export async function GET(request: NextRequest) {
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
    const payload = verificarToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    //  Validar parâmetros da URL
    const { searchParams } = new URL(request.url);
    const queryParams = {
      numero_conta: searchParams.get("numero_conta"),
      limite: searchParams.get("limite"),
      pagina: searchParams.get("pagina"),
      tipo_transacao: searchParams.get("tipo_transacao"),
    };

    const validation = extratoQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Parâmetros inválidos",
          detalhes: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { numero_conta, limite, pagina, tipo_transacao } = validation.data;

    //  Buscar conta
    const conta = await prisma.conta.findUnique({
      where: { numero_conta },
      select: {
        id_conta: true,
        numero_conta: true,
        saldo: true,
        tipo_conta: true,
        status: true,
      },
    });

    if (!conta) {
      return NextResponse.json(
        { error: `Conta ${numero_conta} não encontrada` },
        { status: 404 }
      );
    }

    //  Buscar transações da conta
    const skip = (pagina - 1) * limite;

    // Filtro base: transações onde a conta é origem OU destino
    const whereClause: any = {
      OR: [
        { id_conta_origem: conta.id_conta },
        { id_conta_destino: conta.id_conta },
      ],
    };

    // Adicionar filtro por tipo de transação se fornecido
    if (tipo_transacao) {
      whereClause.tipo_transacao = tipo_transacao;
    }

    // Buscar transações com paginação
    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where: whereClause,
        select: {
          id_transacao: true,
          tipo_transacao: true,
          valor: true,
          data_hora: true,
          descricao: true,
          id_conta_origem: true,
          id_conta_destino: true,
          conta_transacao_id_conta_origemToconta: {
            select: {
              numero_conta: true,
            },
          },
          conta_transacao_id_conta_destinoToconta: {
            select: {
              numero_conta: true,
            },
          },
        },
        orderBy: {
          data_hora: "desc",
        },
        skip,
        take: limite,
      }),
      prisma.transacao.count({ where: whereClause }),
    ]);

    //  Formatar transações para exibição
    const transacoesFormatadas = transacoes.map((t) => {
      const isDebito = t.id_conta_origem === conta.id_conta;
      const isCredito = t.id_conta_destino === conta.id_conta;

      return {
        id: t.id_transacao,
        tipo: t.tipo_transacao,
        data_hora: t.data_hora,
        valor: Number(t.valor),
        descricao: t.descricao,
        operacao: isDebito ? "DÉBITO" : "CRÉDITO",
        conta_origem: t.conta_transacao_id_conta_origemToconta?.numero_conta || null,
        conta_destino: t.conta_transacao_id_conta_destinoToconta?.numero_conta || null,
      };
    });

    //  Retornar extrato
    return NextResponse.json(
      {
        sucesso: true,
        conta: {
          numero_conta: conta.numero_conta,
          tipo_conta: conta.tipo_conta,
          saldo_atual: Number(conta.saldo),
          status: conta.status,
        },
        extrato: transacoesFormatadas,
        paginacao: {
          pagina_atual: pagina,
          limite_por_pagina: limite,
          total_transacoes: total,
          total_paginas: Math.ceil(total / limite),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao buscar extrato:", error);

    return NextResponse.json(
      { error: "Erro ao buscar extrato. Tente novamente." },
      { status: 500 }
    );
  }
}