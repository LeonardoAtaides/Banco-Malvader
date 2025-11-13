import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema de validação para depósito
 */
const depositoSchema = z.object({
  numero_conta: z.string().min(1, "Número da conta é obrigatório"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  descricao: z.string().optional(),
});

/**
 * POST /api/transacao/deposito
 * Realiza um depósito em uma conta
 */
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Validar autenticação
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

    // 2️⃣ Validar dados de entrada
    const body = await request.json();
    const validation = depositoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          detalhes: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { numero_conta, valor, descricao } = validation.data;

    // 3️⃣ Executar depósito em uma transação do Prisma
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar conta
      const conta = await tx.conta.findUnique({
        where: { numero_conta },
        select: {
          id_conta: true,
          numero_conta: true,
          saldo: true,
          status: true,
          tipo_conta: true,
        },
      });

      // Validar se conta existe
      if (!conta) {
        throw new Error(`Conta ${numero_conta} não encontrada`);
      }

      // Validar se conta está ativa
      if (conta.status !== "ATIVA") {
        throw new Error(`Conta ${numero_conta} está ${conta.status.toLowerCase()}. Não é possível realizar depósitos.`);
      }

      // Atualizar saldo da conta
      const novoSaldo = Number(conta.saldo) + valor;
      const contaAtualizada = await tx.conta.update({
        where: { id_conta: conta.id_conta },
        data: { saldo: novoSaldo },
      });

      // Registrar transação
      const transacao = await tx.transacao.create({
        data: {
          id_conta_destino: conta.id_conta,
          tipo_transacao: "DEPOSITO",
          valor,
          descricao: descricao || `Depósito na conta ${numero_conta}`,
        },
      });

      return {
        conta: contaAtualizada,
        transacao,
      };
    });

    // 4️⃣ Retornar sucesso
    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Depósito realizado com sucesso",
        dados: {
          numero_conta: resultado.conta.numero_conta,
          saldo_anterior: Number(resultado.conta.saldo) - valor,
          valor_depositado: valor,
          saldo_atual: Number(resultado.conta.saldo),
          id_transacao: resultado.transacao.id_transacao,
          data_hora: resultado.transacao.data_hora,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao processar depósito:", error);

    // Erros de validação de negócio
    if (error.message?.includes("não encontrada") || error.message?.includes("está")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: "Erro ao processar depósito. Tente novamente." },
      { status: 500 }
    );
  }
}