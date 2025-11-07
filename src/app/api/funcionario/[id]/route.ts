import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/funcionario/[id]
 * Busca um funcionário específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    let funcionario = await prisma.funcionario.findUnique({
      where: { id_funcionario: id },
      include: {
        usuario: true,
        agencia: true,
      },
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Carrega supervisor separadamente se houver id_supervisor (evita usar include inválido)
    if (funcionario.id_supervisor) {
      const supervisor = await prisma.funcionario.findUnique({
        where: { id_funcionario: funcionario.id_supervisor },
        include: {
          usuario: {
            select: {
              nome: true,
            },
          },
        },
      });

      // Não modificamos o objeto 'funcionario' gerado pelo Prisma (tipo fixo);
      // criamos um objeto de resposta que inclui 'supervisor' e usamos uma
      // asserção de tipo para indicar a forma esperada no JSON de saída.
      const funcionarioResponse = { ...funcionario, supervisor } as unknown as typeof funcionario & {
        supervisor?: {
          usuario: {
            nome: string;
          };
        };
      };

      return NextResponse.json(funcionarioResponse);
    }

    return NextResponse.json(funcionario);

  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar funcionário" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/funcionario/[id]
 * Atualiza dados de um funcionário
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const { cargo, id_supervisor, id_agencia } = body;

    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id_funcionario: id },
      data: {
        ...(cargo && { cargo }),
        ...(id_supervisor !== undefined && { id_supervisor }),
        ...(id_agencia && { id_agencia }),
      },
      include: {
        usuario: true,
      },
    });

    return NextResponse.json(funcionarioAtualizado);

  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar funcionário" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/funcionario/[id]
 * Remove um funcionário
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.funcionario.delete({
      where: { id_funcionario: id },
    });

    return NextResponse.json({ message: "Funcionário removido com sucesso" });

  } catch (error) {
    console.error("Erro ao remover funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao remover funcionário" },
      { status: 500 }
    );
  }
}