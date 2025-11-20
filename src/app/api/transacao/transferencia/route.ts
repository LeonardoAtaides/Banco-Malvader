import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";
import Decimal from "decimal.js";
import bcrypt from "bcryptjs";

const transferenciaSchema = z.object({
  numero_conta_destino: z.string().min(1, "Número da conta é obrigatório"),
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

    // Validação do body
    const body = await request.json();
    const validation = transferenciaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validation.error.issues },
        { status: 400 }
      );
    }

    const { numero_conta_destino, valor, senha } = validation.data;

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

    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk)
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

    const cliente = usuario.cliente?.[0];
    if (!cliente)
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    const contaOrigem = cliente.conta.find((c) => c.status === "ATIVA");
    if (!contaOrigem)
      return NextResponse.json({ error: "Nenhuma conta ativa encontrada" }, { status: 404 });

    // Buscar conta destino
    const contaDestino = await prisma.conta.findUnique({
      where: { numero_conta: numero_conta_destino },
    });

    if (!contaDestino)
      return NextResponse.json(
        { error: "Conta destino não encontrada" },
        { status: 404 }
      );

    if (contaDestino.id_conta === contaOrigem.id_conta) {
      return NextResponse.json(
        { error: "Não é permitido transferir para a própria conta" },
        { status: 400 }
      );
    }

    const valorDecimal = new Decimal(valor);
    const taxa = valorDecimal.gt(5000) ? new Decimal(10) : new Decimal(0);

    const totalDebito = valorDecimal.plus(taxa);

    const saldoOrigem = new Decimal(contaOrigem.saldo);

    if (totalDebito.gt(saldoOrigem)) {
      return NextResponse.json(
        { error: "Saldo insuficiente para cobrir o valor e a taxa" },
        { status: 400 }
      );
    }

    const novoSaldoOrigem = saldoOrigem.minus(totalDebito);
    const novoSaldoDestino = new Decimal(contaDestino.saldo).plus(valorDecimal);
  

    const resultado = await prisma.$transaction(async (tx) => {

      await tx.conta.update({
        where: { id_conta: contaOrigem.id_conta },
        data: { saldo: novoSaldoOrigem },
      });

      await tx.conta.update({
        where: { id_conta: contaDestino.id_conta },
        data: { saldo: novoSaldoDestino },
      });

      const envio = await tx.transacao.create({
        data: {
          id_conta_origem: contaOrigem.id_conta,
          id_conta_destino: contaDestino.id_conta,
          tipo_transacao: "TRANSFERENCIA",
          valor: valorDecimal,
          descricao: `Transferência enviada para conta ${contaDestino.numero_conta}`,
        },
      });

      const recebimento = await tx.transacao.create({
        data: {
          id_conta_origem: contaOrigem.id_conta,
          id_conta_destino: contaDestino.id_conta,
          tipo_transacao: "TRANSFERENCIA",
          valor: valorDecimal,
          descricao: `Transferência recebida da conta ${contaOrigem.numero_conta}`,
        },
      });

      let taxaRegistro = null;
      if (taxa.gt(0)) {
        taxaRegistro = await tx.transacao.create({
          data: {
            id_conta_origem: contaOrigem.id_conta,
            id_conta_destino: contaOrigem.id_conta,
            tipo_transacao: "TAXA",
            valor: taxa,
            descricao: "Taxa de transferência (valor acima de R$ 5000)",
          },
        });
      }

      return { envio, recebimento, taxaRegistro };
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Transferência realizada com sucesso",
      dados: {
        conta_origem: contaOrigem.numero_conta,
        conta_destino: numero_conta_destino,
        valor: valorDecimal.toNumber(),
        taxa: taxa.toNumber(),
        total_debitado: totalDebito.toNumber(),
        saldo_atual: novoSaldoOrigem.toNumber(),
        id_transacao_envio: resultado.envio.id_transacao,
        id_transacao_recebimento: resultado.recebimento.id_transacao,
        id_transacao_taxa: resultado.taxaRegistro?.id_transacao ?? null,
        data: resultado.envio.data_hora,
      },
    });
  } catch (error) {
    console.error("Erro ao processar transferência:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar transferência." },
      { status: 500 }
    );
  }
}
