import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enderecoSchema } from "@/lib/validations";
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
