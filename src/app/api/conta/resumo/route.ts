import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Pega cliente pelo id_usuario
    const cliente = await prisma.cliente.findFirst({
      where: { id_usuario: payload.id_usuario },
      select: { id_cliente: true },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Pega contas POUPANÇA e INVESTIMENTO
    const contas = await prisma.conta.findMany({
      where: { id_cliente: cliente.id_cliente },
      select: {
        tipo_conta: true,
        saldo: true,
        conta_poupanca: { select: { taxa_rendimento: true } },
        conta_investimento: { select: { taxa_rendimento_base: true } },
      },
    });

    let saldoTotal = 0;
    let rendimentoTotal = 0;

    contas.forEach((c) => {
      const saldo = Number(c.saldo || 0);

      // Poupança
      if (c.tipo_conta === "POUPANCA") {
        const taxa = Number(c.conta_poupanca?.taxa_rendimento || 0);
        saldoTotal += saldo;
        rendimentoTotal += (saldo * taxa) / 100;
      }

      // Investimento
      if (c.tipo_conta === "INVESTIMENTO") {
        const taxa = Number(c.conta_investimento?.taxa_rendimento_base || 0);
        saldoTotal += saldo;
        rendimentoTotal += (saldo * taxa) / 100;
      }
    });

    return NextResponse.json({
      saldoTotal,
      rendimentoTotal,
    });
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
