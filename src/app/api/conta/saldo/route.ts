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

    // Agora usando o nome certo da FK: id_cliente
    const conta = await prisma.conta.findFirst({
      where: { id_cliente: payload.id_usuario },
      select: {
        saldo: true,
        numero_conta: true
      },
    });

    if (!conta) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(conta);

  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar saldo" },
      { status: 500 }
    );
  }
}
