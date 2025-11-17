import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";
import { z } from "zod";
import Decimal from "decimal.js";

const saqueSchema = z.object({
  numero_conta: z.string().min(1, "Número da conta é obrigatório"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  descricao: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validar token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticação não fornecido" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verificarToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });

    // Validar dados de entrada
    const body = await request.json();
    const validation = saqueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", detalhes: validation.error.issues }, { status: 400 });
    }

    const { numero_conta, valor, descricao } = validation.data;
    let valorDecimal = new Decimal(valor);

    // Taxa de saque acima de 1000
    const TAXA_SAQUE = new Decimal(5);
    if (valorDecimal.gt(1000)) {
      valorDecimal = valorDecimal.plus(TAXA_SAQUE);
    }

    // Executar saque dentro de transação
    const resultado = await prisma.$transaction(async (tx) => {
      const conta = await tx.conta.findUnique({
        where: { numero_conta },
        select: {
          id_conta: true,
          numero_conta: true,
          saldo: true,
          status: true,
          tipo_conta: true,
          conta_corrente: { select: { limite: true } },
        },
      });

      if (!conta) throw new Error(`Conta ${numero_conta} não encontrada`);
      if (conta.status !== "ATIVA") throw new Error(`Conta ${numero_conta} está ${conta.status.toLowerCase()}. Não é possível realizar saques.`);

      const saldoAtual = new Decimal(conta.saldo);
      const limiteDisponivel = conta.tipo_conta === "CORRENTE" && conta.conta_corrente
        ? new Decimal(conta.conta_corrente.limite)
        : new Decimal(0);

      const saldoDisponivel = saldoAtual.plus(limiteDisponivel);
      if (valorDecimal.gt(saldoDisponivel)) {
        throw new Error(
          `Saldo insuficiente. Disponível: R$ ${saldoDisponivel.toFixed(2)} (Saldo: R$ ${saldoAtual.toFixed(2)}${limiteDisponivel.gt(0) ? ` + Limite: R$ ${limiteDisponivel.toFixed(2)}` : ""})`
        );
      }

      // Atualizar saldo
      const novoSaldo = saldoAtual.minus(valorDecimal);
      const contaAtualizada = await tx.conta.update({
        where: { id_conta: conta.id_conta },
        data: { saldo: novoSaldo },
      });

      // Registrar transação (valor sem taxa extra para histórico)
      const valorTransacao = valorDecimal.gt(1000) ? new Decimal(valorDecimal.minus(TAXA_SAQUE)) : valorDecimal;
      const transacao = await tx.transacao.create({
        data: {
          id_conta_origem: conta.id_conta,
          tipo_transacao: "SAQUE",
          valor: valorTransacao,
          descricao: descricao || `Saque da conta ${numero_conta}${valorDecimal.gt(1000) ? " + taxa de R$ 5,00" : ""}`,
        },
      });

      return { contaAtualizada, transacao, saldo_anterior: saldoAtual, taxa: valorDecimal.gt(1000) ? TAXA_SAQUE : new Decimal(0) };
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Saque realizado com sucesso",
      dados: {
        numero_conta: resultado.contaAtualizada.numero_conta,
        saldo_anterior: resultado.saldo_anterior.toNumber(),
        valor_sacado: parseFloat(valorDecimal.toFixed(2)),
        taxa_aplicada: resultado.taxa.toNumber(),
        saldo_atual: new Decimal(resultado.contaAtualizada.saldo).toNumber(),
        id_transacao: resultado.transacao.id_transacao,
        data_hora: resultado.transacao.data_hora,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao processar saque:", error);
    if (error.message?.includes("não encontrada") || error.message?.includes("está") || error.message?.includes("insuficiente")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao processar saque. Tente novamente." }, { status: 500 });
  }
}
