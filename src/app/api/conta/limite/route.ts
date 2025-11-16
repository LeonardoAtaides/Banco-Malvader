import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Primeiro busca o cliente relacionado ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id_usuario: payload.id_usuario },
      select: { id_cliente: true },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    //busca a conta corrente do cliente
    const contaCorrente = await prisma.conta.findFirst({
      where: { id_cliente: cliente.id_cliente, tipo_conta: "CORRENTE" },
      select: {
        numero_conta: true,
        saldo: true,
        status: true,
        conta_corrente: {
          select: {
            limite: true,
            taxa_manutencao: true,
            data_vencimento: true
          },
        },
      },
    });

    if (!contaCorrente) {
      return NextResponse.json(
        { error: "Conta corrente não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(contaCorrente);

  } catch (error) {
    console.error("Erro ao buscar limite:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar limite" },
      { status: 500 }
    );
  }
}
