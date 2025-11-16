import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enderecoAgenciaSchema } from "@/lib/validations";

// GET - Listar todos os endereços
export async function GET() {
  try {
    const enderecos = await prisma.endereco_agencia.findMany({
      orderBy: { id_endereco_agencia: "asc" },
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

    return NextResponse.json(enderecos);
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar endereços" },
      { status: 500 }
    );
  }
}

// POST - Criar novo endereço
export async function POST(request: Request) {
  try {
    const json = await request.json();

    const parsed = enderecoAgenciaSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const novo = await prisma.endereco_agencia.create({
      data,
    });

    return NextResponse.json(novo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    return NextResponse.json(
      { error: "Erro ao criar endereço" },
      { status: 500 }
    );
  }
}
