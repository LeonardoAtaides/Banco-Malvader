import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { funcionarioSchema } from "@/lib/validations";

/**
 * GET /api/funcionario
 * Lista todos os funcionários com informações do usuário
 */
export async function GET() {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            cpf: true,
            telefone: true,
            data_nascimento: true,
          },
        },
        agencia: {
          select: {
            nome: true,
            codigo_agencia: true,
          },
        },
      },
    });

    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar funcionários" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/funcionario
 * Cadastra um novo funcionário
 * Requer permissão de GERENTE (implementar middleware posteriormente)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar entrada
    const validation = funcionarioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { id_usuario, id_agencia, codigo_funcionario, cargo, id_supervisor } = validation.data;

    // Verificar se o usuário existe e é do tipo FUNCIONARIO
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
    });

    if (!usuario || usuario.tipo_usuario !== "FUNCIONARIO") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou não é do tipo FUNCIONARIO" },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    const existente = await prisma.funcionario.findUnique({
      where: { codigo_funcionario },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Código de funcionário já cadastrado" },
        { status: 400 }
      );
    }

    // Verificar limite de funcionários por agência (máximo 20)
    const countFuncionarios = await prisma.funcionario.count({
      where: { id_agencia },
    });

    if (countFuncionarios >= 20) {
      return NextResponse.json(
        { error: "Limite de funcionários por agência atingido (máximo 20)" },
        { status: 400 }
      );
    }

    // Criar funcionário
    const novoFuncionario = await prisma.funcionario.create({
      data: {
        id_usuario,
        id_agencia,
        codigo_funcionario,
        cargo,
        id_supervisor,
      },
      include: {
        usuario: {
          select: {
            nome: true,
            cpf: true,
          },
        },
      },
    });

    return NextResponse.json(novoFuncionario, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao criar funcionário" },
      { status: 500 }
    );
  }
}