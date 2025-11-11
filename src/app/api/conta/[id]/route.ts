import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { conta_status } from "@prisma/client";

// GET - Buscar conta por número
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conta = await prisma.conta.findUnique({
      where: { numero_conta: params.id },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
                telefone: true,
              },
            },
          },
        },
        agencia: {
          select: {
            nome: true,
            codigo_agencia: true,
          },
        },
        conta_corrente: true,
        conta_poupanca: true,
        conta_investimento: true,
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
    console.error("Erro ao buscar conta:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conta" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { tipo_conta, status } = body;

    // Verificar se conta existe
    const contaExistente = await prisma.conta.findUnique({
      where: { numero_conta: params.id },
    });

    if (!contaExistente) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    const contaAtualizada = await prisma.conta.update({
      where: { numero_conta: params.id },
      data: {
        ...(tipo_conta && { tipo_conta }),
        ...(status && { status }),
      },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
        agencia: {
          select: {
            nome: true,
            codigo_agencia: true,
          },
        },
      },
    });

    return NextResponse.json(contaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}

// DELETE - Encerrar conta (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conta = await prisma.conta.findUnique({
      where: { numero_conta: params.id },
    });

    if (!conta) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se há saldo
    if (conta.saldo.toNumber() !== 0) {
      return NextResponse.json(
        { error: "Não é possível encerrar conta com saldo diferente de zero" },
        { status: 400 }
      );
    }

    // Atualizar status para ENCERRADA usando o enum
    const contaEncerrada = await prisma.conta.update({
      where: { numero_conta: params.id },
      data: { status: conta_status.ENCERRADA },
    });

    return NextResponse.json({
      message: "Conta encerrada com sucesso",
      conta: contaEncerrada,
    });
  } catch (error) {
    console.error("Erro ao encerrar conta:", error);
    return NextResponse.json(
      { error: "Erro ao encerrar conta" },
      { status: 500 }
    );
  }
}