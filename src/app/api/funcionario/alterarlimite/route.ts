import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
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

    const funcionario = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: { usuario: true },
    });

    if (!funcionario) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    if (funcionario.cargo !== "GERENTE") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const numero_conta = searchParams.get("conta");

    if (!numero_conta) {
      return NextResponse.json({ error: "Número da conta é obrigatório" }, { status: 400 });
    }

    const conta = await prisma.conta.findFirst({
      where: { numero_conta, tipo_conta: "CORRENTE" },
      include: {
        cliente: {
          select: { usuario: { select: { nome: true } } },
        },
        conta_corrente: true, 
      },
    });

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    return NextResponse.json(conta);
  } catch (error) {
    console.error("Erro no GET limite gerente:", error);
    return NextResponse.json({ error: "Erro interno ao buscar limite" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const funcionario = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
    });

    if (!funcionario || funcionario.cargo !== "GERENTE") {
      return NextResponse.json({ error: "Apenas gerentes podem editar limites" }, { status: 403 });
    }

    const body = await request.json();
    const { numero_conta, novo_limite } = body;

    if (!numero_conta || novo_limite == null) {
      return NextResponse.json({ error: "Número da conta e novo limite são obrigatórios" }, { status: 400 });
    }

    const conta = await prisma.conta.findFirst({
      where: { numero_conta },
      select: { id_conta: true },
    });

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const contaCorrente = await prisma.conta_corrente.findFirst({
      where: { id_conta: conta.id_conta },
      select: { id_conta_corrente: true, limite: true },
    });

    if (!contaCorrente) {
      return NextResponse.json({ error: "Conta corrente não encontrada" }, { status: 404 });
    }

    const updated = await prisma.conta_corrente.update({
      where: { id_conta_corrente: contaCorrente.id_conta_corrente },
      data: { limite: novo_limite },
    });

    return NextResponse.json({
      message: "Limite atualizado com sucesso",
      limite: updated.limite,
    });
  } catch (error) {
    console.error("Erro ao atualizar limite:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar limite" }, { status: 500 });
  }
}
