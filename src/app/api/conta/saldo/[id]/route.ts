import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conta = await prisma.conta.findUnique({
      where: { numero_conta: params.id },
      select: { 
        saldo: true, 
        numero_conta: true,
        tipo_conta: true,
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
      { error: "Erro ao buscar saldo" },
      { status: 500 }
    );
  }
}