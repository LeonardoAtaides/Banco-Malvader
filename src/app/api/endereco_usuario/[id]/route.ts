import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { enderecoUpdateSchema } from "@/lib/validations";
import { ZodError } from "zod";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

// utilitário para extrair id da URL
function getIdFromUrl(request: NextRequest) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/"); // ['/api','endereco_usuario','1']
  return Number(parts[parts.length - 1]);
}

// GET endereço específico
export async function GET(request: NextRequest) {
  const id_endereco = getIdFromUrl(request);

  const endereco = await prisma.endereco_usuario.findUnique({
    where: { id_endereco },
    include: { usuario: true },
  });

  if (!endereco) {
    return NextResponse.json(
      { error: "Endereço não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(endereco);
}

// PUT endereço específico
export async function PUT(request: NextRequest) {
  try {
    const id_endereco = getIdFromUrl(request);
    const json = await request.json();
    const body = enderecoUpdateSchema.parse(json);

    const atualizado = await prisma.endereco_usuario.update({
      where: { id_endereco },
      data: {
        ...(body.cep && { cep: body.cep }),
        ...(body.local && { local: body.local }),
        ...(body.numero_casa && { numero_casa: body.numero_casa }),
        ...(body.bairro && { bairro: body.bairro }),
        ...(body.cidade && { cidade: body.cidade }),
        ...(body.estado && { estado: body.estado }),
        ...(body.complemento !== undefined && {
          complemento: body.complemento,
        }),
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

// DELETE endereço específico
export async function DELETE(request: NextRequest) {
  try {
    const id_endereco = getIdFromUrl(request);

    const endereco = await prisma.endereco_usuario.findUnique({
      where: { id_endereco },
    });
    if (!endereco) {
      return NextResponse.json(
        { error: "Endereço não encontrado" },
        { status: 404 }
      );
    }

    await prisma.endereco_usuario.delete({ where: { id_endereco } });
    return NextResponse.json({ message: "Endereço deletado" });
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
