import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enderecoSchema, enderecoUpdateSchema } from "@/lib/validations";
import { ZodError } from "zod";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET() {
  const enderecos = await prisma.endereco_usuario.findMany({
    include: { usuario: true },
    orderBy: { id_endereco: "asc" },
  });
  return NextResponse.json(enderecos);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = enderecoSchema.parse(json); // validação com Zod ✅

    const novo = await prisma.endereco_usuario.create({ data: body });
    return NextResponse.json(novo, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const body = enderecoUpdateSchema.parse(json); // validação com Zod ✅

    const atualizado = await prisma.endereco_usuario.update({
      where: { id_endereco: body.id_endereco },
      data: {
        ...(body.cep && { cep: body.cep }),
        ...(body.local && { local: body.local }),
        ...(body.numero_casa && { numero_casa: body.numero_casa }),
        ...(body.bairro && { bairro: body.bairro }),
        ...(body.cidade && { cidade: body.cidade }),
        ...(body.estado && { estado: body.estado }),
        ...(body.complemento && { complemento: body.complemento }),
      },
    });

    return NextResponse.json(atualizado);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id_endereco } = await request.json();

    if (!id_endereco) {
      return NextResponse.json(
        { error: "id_endereco é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.endereco_usuario.delete({ where: { id_endereco } });
    return NextResponse.json({ message: "Endereço deletado" });
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
