import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Listar todas as contas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");

    const where = cpf
      ? {
          cliente: {
            usuario: { cpf },
          },
        }
      : {};

    const contas = await prisma.conta.findMany({
      where,
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
      orderBy: { numero_conta: "desc" },
    });

    return NextResponse.json(contas);
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    return NextResponse.json(
      { error: "Erro ao listar contas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova conta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numero_conta,
      cpf,
      id_agencia,
      tipo_conta,
      limite,
      taxa_manutencao,
      data_vencimento,
    } = body;

    // Validações
    if (!numero_conta || !cpf || !id_agencia || !tipo_conta) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: numero_conta, cpf, id_agencia, tipo_conta",
        },
        { status: 400 }
      );
    }

    // Verificar se conta já existe
    const contaExistente = await prisma.conta.findUnique({
      where: { numero_conta },
    });

    if (contaExistente) {
      return NextResponse.json(
        { error: "Número de conta já existe" },
        { status: 409 }
      );
    }

    // Buscar cliente pelo CPF do usuário
    const cliente = await prisma.cliente.findFirst({
      where: { usuario: { cpf } },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se agência existe
    const agencia = await prisma.agencia.findUnique({
      where: { id_agencia },
    });

    if (!agencia) {
      return NextResponse.json(
        { error: "Agência não encontrada" },
        { status: 404 }
      );
    }

    // Criar conta
    const novaConta = await prisma.conta.create({
      data: {
        numero_conta,
        id_cliente: cliente.id_cliente,
        id_agencia,
        tipo_conta,
        saldo: 0,
        status: "ATIVA",
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

    // Se for conta corrente, criar registro específico
    if (tipo_conta === "CORRENTE" && limite !== undefined) {
      await prisma.conta_corrente.create({
        data: {
          id_conta: novaConta.id_conta,
          limite: limite || 0,
          taxa_manutencao: taxa_manutencao || 0,
          data_vencimento:
            data_vencimento ||
            new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toISOString(),
        },
      });
    }

    return NextResponse.json(novaConta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}