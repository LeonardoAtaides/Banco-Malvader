import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/cliente/[id]
 * Busca um cliente específico com suas contas
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        usuario: true,
        conta: {
          include: {
            agencia: true,
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);

  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cliente/[id]
 * Atualiza score de crédito do cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const clienteAtualizado = await prisma.cliente.update({
      where: { id_cliente: id },
      data: {
        score_credito: body.score_credito,
      },
    });

    return NextResponse.json(clienteAtualizado);

  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}