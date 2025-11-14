import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema de validação para saque
 */
const saqueSchema = z.object({
  numero_conta: z.string().min(1, "Número da conta é obrigatório"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  descricao: z.string().optional(),
});

/**
 * POST /api/transacao/saque
 * Realiza um saque de uma conta
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
    const payload = verificarToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    //  Validar dados de entrada
    const body = await request.json();
    const validation = saqueSchema.safeParse(body);

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

    //  Executar saque em uma transação do Prisma
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar conta com informações do tipo (para verificar limite)
      const conta = await tx.conta.findUnique({
        where: { numero_conta },
        select: {
          id_conta: true,
          numero_conta: true,
          saldo: true,
          status: true,
          tipo_conta: true,
          conta_corrente: {
            select: {
              limite: true,
            },
          },
        },
      });

      // Validar se conta existe
      if (!conta) {
        throw new Error(`Conta ${numero_conta} não encontrada`);
      }

      // Validar se conta está ativa
      if (conta.status !== "ATIVA") {
        throw new Error(`Conta ${numero_conta} está ${conta.status.toLowerCase()}. Não é possível realizar saques.`);
      }

      // Calcular saldo disponível (saldo + limite se for conta corrente)
      const saldoAtual = Number(conta.saldo);
      const limiteDisponivel = conta.tipo_conta === "CORRENTE" && conta.conta_corrente
        ? Number(conta.conta_corrente.limite)
        : 0;
      const saldoDisponivel = saldoAtual + limiteDisponivel;

      // Validar se tem saldo suficiente
      if (valor > saldoDisponivel) {
        throw new Error(
          `Saldo insuficiente. Disponível: R$ ${saldoDisponivel.toFixed(2)} (Saldo: R$ ${saldoAtual.toFixed(2)}${limiteDisponivel > 0 ? ` + Limite: R$ ${limiteDisponivel.toFixed(2)}` : ""})`
        );
      }

      // Atualizar saldo da conta
      const novoSaldo = saldoAtual - valor;
      const contaAtualizada = await tx.conta.update({
        where: { id_conta: conta.id_conta },
        data: { saldo: novoSaldo },
      });

      // Registrar transação
      const transacao = await tx.transacao.create({
        data: {
          id_conta_origem: conta.id_conta,
          tipo_transacao: "SAQUE",
          valor,
          descricao: descricao || `Saque da conta ${numero_conta}`,
        },
      });

      return {
        conta: contaAtualizada,
        transacao,
        saldo_anterior: saldoAtual,
      };
    });

    //  Retornar sucesso
    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Saque realizado com sucesso",
        dados: {
          numero_conta: resultado.conta.numero_conta,
          saldo_anterior: resultado.saldo_anterior,
          valor_sacado: valor,
          saldo_atual: Number(resultado.conta.saldo),
          id_transacao: resultado.transacao.id_transacao,
          data_hora: resultado.transacao.data_hora,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao processar saque:", error);

    // Erros de validação de negócio
    if (error.message?.includes("não encontrada") || 
        error.message?.includes("está") || 
        error.message?.includes("insuficiente")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: "Erro ao processar saque. Tente novamente." },
      { status: 500 }
    );
  }
}