import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Buscar uma agência pelo ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const agencia = await prisma.agencia.findUnique({
      where: { id_agencia: Number(params.id) },
      include: { endereco_agencia: true },
    });

    if (!agencia) {
      return NextResponse.json(
        { error: "Agência não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(agencia);
  } catch (error) {
    console.error("Erro ao buscar agência:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agência" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar agência
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome, codigo_agencia, endereco_id } = body;

    const agenciaAtualizada = await prisma.agencia.update({
      where: { id_agencia: Number(params.id) },
      data: { nome, codigo_agencia, endereco_id },
    });

    return NextResponse.json(agenciaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar agência:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agência" },
      { status: 500 }
    );
  }
}

// DELETE - Remover agência
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.agencia.delete({
      where: { id_agencia: Number(params.id) },
    });

    return NextResponse.json({ message: "Agência removida com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar agência:", error);
    return NextResponse.json(
      { error: "Erro ao deletar agência" },
      { status: 500 }
    );
  }
}
