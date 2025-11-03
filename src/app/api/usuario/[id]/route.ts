import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { usuarioUpdateSchema } from "@/lib/validations";
import { ZodError } from "zod";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Função utilitária para extrair o ID da URL
function getIdFromUrl(request: NextRequest) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/"); // ['/api','usuario','1']
  const id = parts[parts.length - 1]; // '1'
  return Number(id);
}

// GET usuário específico
export async function GET(request: NextRequest) {
  const id_usuario = getIdFromUrl(request);

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    include: { endereco_usuario: true },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(usuario);
}

// PUT usuário específico
export async function PUT(request: NextRequest) {
  try {
    const id_usuario = getIdFromUrl(request);
    const json = await request.json();
    const body = usuarioUpdateSchema.parse(json);

    const atualizado = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        ...(body.nome && { nome: body.nome }),
        ...(body.telefone && { telefone: body.telefone }),
        ...(body.tipo_usuario && { tipo_usuario: body.tipo_usuario }),
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

// DELETE usuário específico
export async function DELETE(request: NextRequest) {
  try {
    const id_usuario = getIdFromUrl(request);

    const usuario = await prisma.usuario.findUnique({ where: { id_usuario } });
    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    await prisma.usuario.delete({ where: { id_usuario } });
    return NextResponse.json({ message: "Usuário deletado" });
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
