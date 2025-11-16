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
    include: {
      cliente: true,
      funcionario: true,
      endereco_usuario: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  // Retorno seguro
  const safeUser = {
    id_usuario: usuario.id_usuario, // opcional — pode remover
    nome: usuario.nome,
    tipo_usuario: usuario.tipo_usuario,
    id_cliente: usuario.cliente?.[0]?.id_cliente ?? null,
    id_funcionario: usuario.funcionario?.[0]?.id_funcionario ?? null,
    endereco: usuario.endereco_usuario?.map((e) => ({
      local: e.local,
      numero: e.numero_casa,
      bairro: e.bairro,
      cidade: e.cidade,
      estado: e.estado,
    })),
  };

  return NextResponse.json(safeUser);
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
