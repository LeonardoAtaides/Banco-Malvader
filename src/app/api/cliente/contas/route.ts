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

    // Busca o cliente vinculado ao usuário
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

    // 🔵 Conta Poupança
    const contaPoupanca = await prisma.conta.findFirst({
      where: { 
        id_cliente: cliente.id_cliente, 
        tipo_conta: "POUPANCA"
      },
      select: {
        numero_conta: true,
        saldo: true,
        status: true,
        data_abertura: true,
        conta_poupanca: {
          select: {
            taxa_rendimento: true,      // OK
            ultimo_rendimento: true,    // OK
          },
        },
      },
    });

    // 🟢 Conta Investimento
    const contaInvestimento = await prisma.conta.findFirst({
      where: { 
        id_cliente: cliente.id_cliente, 
        tipo_conta: "INVESTIMENTO"
      },
      select: {
        numero_conta: true,
        saldo: true,
        status: true,
        data_abertura:true,
        conta_investimento: {
          select: {
            perfil_risco: true,
            valor_minimo: true,
            taxa_rendimento_base: true,   // 🔥 Nome correto!
          },
        },
      },
    });

    return NextResponse.json({
      poupanca: contaPoupanca || null,
      investimento: contaInvestimento || null,
    });

  } catch (error) {
    console.error("Erro ao buscar contas vinculadas:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar contas" },
      { status: 500 }
    );
  }
}
