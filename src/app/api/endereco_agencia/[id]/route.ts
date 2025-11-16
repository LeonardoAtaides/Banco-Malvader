import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { enderecoAgenciaSchema } from "@/lib/validations";

// GET - Buscar endereço por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const endereco = await prisma.endereco_agencia.findUnique({
      where: { id_endereco_agencia: id },
      include: {
        agencia: {
          select: {
            id_agencia: true,
            nome: true,
            codigo_agencia: true,
          },
        },
      },
    });

    if (!endereco) {
      return NextResponse.json(
        { error: "Endereço não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(endereco);
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar endereço" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar endereço
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const json = await request.json();

    // Validação parcial (atualização)
    const partialSchema = enderecoAgenciaSchema.partial();
    const parsed = partialSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const endereco = await prisma.endereco_agencia.findUnique({
      where: { id_endereco_agencia: id },
    });

    if (!endereco) {
      return NextResponse.json(
        { error: "Endereço não encontrado" },
        { status: 404 }
      );
    }

    const atualizado = await prisma.endereco_agencia.update({
      where: { id_endereco_agencia: id },
      data,
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar endereço" },
      { status: 500 }
    );
  }
}

// DELETE - Remover endereço
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Verifica se há agência(s) vinculada(s)
    const vinculadas = await prisma.agencia.count({
      where: { endereco_id: id },
    });

    if (vinculadas > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir: existe agência vinculada a este endereço",
        },
        { status: 400 }
      );
    }

    await prisma.endereco_agencia.delete({
      where: { id_endereco_agencia: id },
    });

    return NextResponse.json({ message: "Endereço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar endereço:", error);
    return NextResponse.json(
      { error: "Erro ao deletar endereço" },
      { status: 500 }
    );
  }
}
