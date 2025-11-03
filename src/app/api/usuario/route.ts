import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { usuarioSchema } from "@/lib/validations";
import { ZodError } from "zod";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

// GET todos usuários
export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    include: { endereco_usuario: true },
    orderBy: { id_usuario: "asc" },
  });
  return NextResponse.json(usuarios);
}

// POST cria usuário
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = usuarioSchema.parse(json);

    const novo = await prisma.usuario.create({
      data: {
        nome: body.nome,
        cpf: body.cpf,
        data_nascimento: new Date(body.data_nascimento),
        telefone: body.telefone,
        tipo_usuario: body.tipo_usuario,
        senha_hash: body.senha_hash,
      },
    });

    return NextResponse.json(novo, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const msg = getErrorMessage(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
