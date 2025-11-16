import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Listar todas as agências
export async function GET() {
  try {
    const agencias = await prisma.agencia.findMany({
      orderBy: { id_agencia: "asc" },
      include: { endereco_agencia: true },
    });

    return NextResponse.json(agencias);
  } catch (error) {
    console.error("Erro ao buscar agências:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agências" },
      { status: 500 }
    );
  }
}

// POST - Criar nova agência
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, codigo_agencia, endereco_id } = body;

    // Validação
    if (!nome || !codigo_agencia || !endereco_id) {
      return NextResponse.json(
        { error: "nome, codigo_agencia e endereco_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar duplicidade
    const existe = await prisma.agencia.findUnique({
      where: { codigo_agencia },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Já existe uma agência com este código" },
        { status: 409 }
      );
    }

    const novaAgencia = await prisma.agencia.create({
      data: {
        nome,
        codigo_agencia,
        endereco_id,
      },
    });

    return NextResponse.json(novaAgencia, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agência:", error);
    return NextResponse.json(
      { error: "Erro ao criar agência" },
      { status: 500 }
    );
  }
}
