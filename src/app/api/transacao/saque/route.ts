import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";

const saqueSchema = z.object({
  valor: z.number().positive("Valor deve ser maior que zero"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(request: NextRequest) {
  try {

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const validation = saqueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validation.error.issues },
        { status: 400 }
      );
    }

    const { valor, senha } = validation.data;

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: payload.id_usuario },
      select: {
        senha_hash: true,
        cliente: {
          select: {
            conta: true,
          },
        },
      },
    });

    if (!usuario)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida)
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

    const cliente = usuario.cliente?.[0];
    if (!cliente)
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    const conta = cliente.conta.find((c) => c.status === "ATIVA");
    if (!conta)
      return NextResponse.json({ error: "Conta ativa não encontrada" }, { status: 404 });

    const valorDecimal = new Decimal(valor);
    const TAXA_SAQUE = new Decimal(5);

    const valorComTaxa =
      valorDecimal.gt(1000) ? valorDecimal.plus(TAXA_SAQUE) : valorDecimal;

    const saldoAtual = new Decimal(conta.saldo);

    if (valorComTaxa.gt(saldoAtual))
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

    const novoSaldo = saldoAtual.minus(valorComTaxa);

    // Transação
    const resultado = await prisma.$transaction(async (tx) => {
      const contaAtualizada = await tx.conta.update({
        where: { id_conta: conta.id_conta },
        data: { saldo: novoSaldo },
      });

      const transacao = await tx.transacao.create({
        data: {
          id_conta_origem: conta.id_conta,
          tipo_transacao: "SAQUE",
          valor: valorDecimal,
          descricao: `Saque realizado${valorDecimal.gt(1000) ? " + taxa R$ 5,00" : ""}`,
        },
      });

      return { contaAtualizada, transacao };
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Saque realizado com sucesso",
      dados: {
        saldo_anterior: saldoAtual.toNumber(),
        valor_sacado: valorDecimal.toNumber(),
        taxa_aplicada: valorDecimal.gt(1000) ? TAXA_SAQUE.toNumber() : 0,
        saldo_atual: novoSaldo.toNumber(),
        id_transacao: resultado.transacao.id_transacao,
        data_hora: resultado.transacao.data_hora,
      },
    });
  } catch (error) {
    console.error("Erro ao processar saque:", error);
    return NextResponse.json(
      { error: "Erro ao processar saque. Tente novamente." },
      { status: 500 }
    );
  }
}
