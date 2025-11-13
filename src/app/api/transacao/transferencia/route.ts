import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema de validação para transferência
 */
const transferenciaSchema = z.object({
  numero_conta_origem: z.string().min(1, "Número da conta origem é obrigatório"),
  numero_conta_destino: z.string().min(1, "Número da conta destino é obrigatório"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  descricao: z.string().optional(),
}).refine((data) => data.numero_conta_origem !== data.numero_conta_destino, {
  message: "Conta de origem e destino não podem ser iguais",
  path: ["numero_conta_destino"],
});

/**
 * POST /api/transacao/transferencia
 * Realiza uma transferência entre contas
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
    const validation = transferenciaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          detalhes: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { numero_conta_origem, numero_conta_destino, valor, descricao } = validation.data;

    // 3️⃣ Executar transferência em uma transação do Prisma (garante atomicidade)
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar conta de origem
      const contaOrigem = await tx.conta.findUnique({
        where: { numero_conta: numero_conta_origem },
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

      // Validar se conta origem existe
      if (!contaOrigem) {
        throw new Error(`Conta de origem ${numero_conta_origem} não encontrada`);
      }

      // Validar se conta origem está ativa
      if (contaOrigem.status !== "ATIVA") {
        throw new Error(`Conta de origem ${numero_conta_origem} está ${contaOrigem.status.toLowerCase()}. Não é possível realizar transferências.`);
      }

      // Buscar conta de destino
      const contaDestino = await tx.conta.findUnique({
        where: { numero_conta: numero_conta_destino },
        select: {
          id_conta: true,
          numero_conta: true,
          saldo: true,
          status: true,
          tipo_conta: true,
        },
      });

      // Validar se conta destino existe
      if (!contaDestino) {
        throw new Error(`Conta de destino ${numero_conta_destino} não encontrada`);
      }

      // Validar se conta destino está ativa
      if (contaDestino.status !== "ATIVA") {
        throw new Error(`Conta de destino ${numero_conta_destino} está ${contaDestino.status.toLowerCase()}. Não é possível receber transferências.`);
      }

      // Calcular saldo disponível da conta origem
      const saldoOrigemAtual = Number(contaOrigem.saldo);
      const limiteDisponivel = contaOrigem.tipo_conta === "CORRENTE" && contaOrigem.conta_corrente
        ? Number(contaOrigem.conta_corrente.limite)
        : 0;
      const saldoDisponivel = saldoOrigemAtual + limiteDisponivel;

      // Validar se tem saldo suficiente
      if (valor > saldoDisponivel) {
        throw new Error(
          `Saldo insuficiente na conta de origem. Disponível: R$ ${saldoDisponivel.toFixed(2)} (Saldo: R$ ${saldoOrigemAtual.toFixed(2)}${limiteDisponivel > 0 ? ` + Limite: R$ ${limiteDisponivel.toFixed(2)}` : ""})`
        );
      }

      // Atualizar saldo da conta origem (debitar)
      const novoSaldoOrigem = saldoOrigemAtual - valor;
      const contaOrigemAtualizada = await tx.conta.update({
        where: { id_conta: contaOrigem.id_conta },
        data: { saldo: novoSaldoOrigem },
      });

      // Atualizar saldo da conta destino (creditar)
      const saldoDestinoAtual = Number(contaDestino.saldo);
      const novoSaldoDestino = saldoDestinoAtual + valor;
      const contaDestinoAtualizada = await tx.conta.update({
        where: { id_conta: contaDestino.id_conta },
        data: { saldo: novoSaldoDestino },
      });

      // Registrar transação
      const transacao = await tx.transacao.create({
        data: {
          id_conta_origem: contaOrigem.id_conta,
          id_conta_destino: contaDestino.id_conta,
          tipo_transacao: "TRANSFERENCIA",
          valor,
          descricao: descricao || `Transferência de ${numero_conta_origem} para ${numero_conta_destino}`,
        },
      });

      return {
        contaOrigem: contaOrigemAtualizada,
        contaDestino: contaDestinoAtualizada,
        transacao,
        saldo_origem_anterior: saldoOrigemAtual,
        saldo_destino_anterior: saldoDestinoAtual,
      };
    });

    // 4️⃣ Retornar sucesso
    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Transferência realizada com sucesso",
        dados: {
          origem: {
            numero_conta: resultado.contaOrigem.numero_conta,
            saldo_anterior: resultado.saldo_origem_anterior,
            saldo_atual: Number(resultado.contaOrigem.saldo),
          },
          destino: {
            numero_conta: resultado.contaDestino.numero_conta,
            saldo_anterior: resultado.saldo_destino_anterior,
            saldo_atual: Number(resultado.contaDestino.saldo),
          },
          valor_transferido: valor,
          id_transacao: resultado.transacao.id_transacao,
          data_hora: resultado.transacao.data_hora,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao processar transferência:", error);

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
      { error: "Erro ao processar transferência. Tente novamente." },
      { status: 500 }
    );
  }
}