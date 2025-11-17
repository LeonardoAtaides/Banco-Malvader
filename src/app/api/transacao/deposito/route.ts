// file: /app/api/deposito/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";

const depositoSchema = z.object({
  valor: z.number().positive("Valor deve ser maior que zero"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export async function POST(request: NextRequest) {
  try {
    // Verifica token
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

    // Valida body
    const body = await request.json();
    const validation = depositoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validation.error.issues },
        { status: 400 }
      );
    }

    const { valor, senha } = validation.data;

    // Busca usuário + cliente + contas
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

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

    // Pega cliente e conta ativa
    const cliente = usuario.cliente?.[0];
    if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    const conta = cliente.conta.find(c => c.status === "ATIVA");
    if (!conta) return NextResponse.json({ error: "Conta ativa não encontrada" }, { status: 404 });

    // ✅ CORREÇÃO: Usa Decimal.js mantendo precisão
    const saldoAnterior = new Decimal(conta.saldo.toString());
    const valorDeposito = new Decimal(valor);
    const novoSaldo = saldoAnterior.plus(valorDeposito);

    const resultado = await prisma.$transaction(async (tx) => {
      // ✅ CORREÇÃO: Mantém como Decimal, não converte para number
      const contaAtualizada = await tx.conta.update({
        where: { id_conta: conta.id_conta },
        data: { 
          saldo: novoSaldo // ← Mantém como Decimal
        },
      });

      const transacao = await tx.transacao.create({
        data: {
          id_conta_destino: conta.id_conta,
          tipo_transacao: "DEPOSITO",
          valor: valorDeposito, // ← Mantém como Decimal
          descricao: `Depósito na conta do usuário`,
        },
      });

      return { contaAtualizada, transacao };
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Depósito realizado com sucesso",
      dados: {
        numero_conta: resultado.contaAtualizada.numero_conta,
        saldo_anterior: saldoAnterior.toNumber(), // Apenas para exibição
        valor_depositado: valorDeposito.toNumber(), // Apenas para exibição
        saldo_atual: novoSaldo.toNumber(), // Apenas para exibição
        id_transacao: resultado.transacao.id_transacao,
        data_hora: resultado.transacao.data_hora,
      },
    });

  } catch (error) {
    console.error("Erro ao processar depósito:", error);
    return NextResponse.json(
      { error: "Erro ao processar depósito. Tente novamente." },
      { status: 500 }
    );
  }
}