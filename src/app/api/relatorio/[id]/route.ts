import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Buscar relatório específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relatorio = await prisma.relatorio.findUnique({
      where: { id_relatorio: Number(params.id) },
      include: {
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
              },
            },
            agencia: {
              select: {
                nome: true,
                codigo_agencia: true,
              },
            },
          },
        },
      },
    });

    if (!relatorio) {
      return NextResponse.json(
        { error: "Relatório não encontrado" },
        { status: 404 }
      );
    }

    // Parse do conteúdo JSON
    const relatorioComConteudo = {
      ...relatorio,
      conteudo: typeof relatorio.conteudo === 'string' 
        ? JSON.parse(relatorio.conteudo) 
        : relatorio.conteudo,
    };

    return NextResponse.json(relatorioComConteudo);
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatório" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir relatório
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se relatório existe
    const relatorio = await prisma.relatorio.findUnique({
      where: { id_relatorio: Number(params.id) },
    });

    if (!relatorio) {
      return NextResponse.json(
        { error: "Relatório não encontrado" },
        { status: 404 }
      );
    }

    // Excluir relatório
    await prisma.relatorio.delete({
      where: { id_relatorio: Number(params.id) },
    });

    return NextResponse.json({
      message: "Relatório excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir relatório:", error);
    return NextResponse.json(
      { error: "Erro ao excluir relatório" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar observações do relatório (opcional)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { observacao } = body;

    // Verificar se relatório existe
    const relatorio = await prisma.relatorio.findUnique({
      where: { id_relatorio: Number(params.id) },
    });

    if (!relatorio) {
      return NextResponse.json(
        { error: "Relatório não encontrado" },
        { status: 404 }
      );
    }

    // Parse do conteúdo existente
    const conteudoAtual = typeof relatorio.conteudo === 'string'
      ? JSON.parse(relatorio.conteudo)
      : relatorio.conteudo;

    // Adicionar observação ao conteúdo
    const conteudoAtualizado = {
      ...conteudoAtual,
      observacao: observacao || conteudoAtual.observacao,
      ultima_atualizacao: new Date().toISOString(),
    };

    // Atualizar relatório
    const relatorioAtualizado = await prisma.relatorio.update({
      where: { id_relatorio: Number(params.id) },
      data: {
        conteudo: JSON.stringify(conteudoAtualizado),
      },
      include: {
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ...relatorioAtualizado,
      conteudo: conteudoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar relatório" },
      { status: 500 }
    );
  }
}