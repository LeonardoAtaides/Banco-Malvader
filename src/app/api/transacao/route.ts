// file: /app/api/cliente/transacoes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Pegar token do header
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

    // Buscar cliente pelo id_usuario do token
    const cliente = await prisma.cliente.findFirst({
      where: { id_usuario: payload.id_usuario },
      select: { id_cliente: true },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Buscar transações da conta do cliente
    const transacoes = await prisma.transacao.findMany({
      where: {
        OR: [
          { id_conta_origem: { in: (await prisma.conta.findMany({
            where: { id_cliente: cliente.id_cliente },
            select: { id_conta: true },
          })).map(c => c.id_conta) } },
          { id_conta_destino: { in: (await prisma.conta.findMany({
            where: { id_cliente: cliente.id_cliente },
            select: { id_conta: true },
          })).map(c => c.id_conta) } },
        ],
      },
      orderBy: { data_hora: "desc" },
      select: {
        id_transacao: true,
        tipo_transacao: true,
        valor: true,
        data_hora: true,
        descricao: true,
        id_conta_origem: true,
        id_conta_destino: true,
      },
    });

    return NextResponse.json(transacoes);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json({ error: "Erro interno ao buscar transações" }, { status: 500 });
  }
}
