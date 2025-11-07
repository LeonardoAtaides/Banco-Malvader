import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";

/**
 * GET /api/cliente
 * Lista todos os clientes
 */
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            cpf: true,
            telefone: true,
            data_nascimento: true,
          },
        },
        conta: {
          select: {
            numero_conta: true,
            tipo_conta: true,
            saldo: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cliente
 * Cadastra um novo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = clienteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { id_usuario, score_credito } = validation.data;

    // Verificar se usuário existe e é do tipo CLIENTE
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
    });

    if (!usuario || usuario.tipo_usuario !== "CLIENTE") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou não é do tipo CLIENTE" },
        { status: 400 }
      );
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        id_usuario,
        score_credito: score_credito || 0,
      },
      include: {
        usuario: {
          select: {
            nome: true,
            cpf: true,
          },
        },
      },
    });

    return NextResponse.json(novoCliente, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}