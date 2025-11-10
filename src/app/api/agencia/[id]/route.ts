import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar agência por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agencia = await prisma.agencia.findUnique({
      where: {
        numero_agencia: params.id
      },
      include: {
        Conta: {
          select: {
            id_conta: true,
            numero_conta: true,
            tipo_conta: true,
            saldo: true,
            Cliente: {
              select: {
                Usuario: {
                  select: {
                    nome: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!agencia) {
      return NextResponse.json(
        { error: 'Agência não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(agencia);
  } catch (error) {
    console.error('Erro ao buscar agência:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar agência' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar agência
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome_agencia, endereco, telefone } = body;

    // Verificar se a agência existe
    const agenciaExistente = await prisma.agencia.findUnique({
      where: { numero_agencia: params.id }
    });

    if (!agenciaExistente) {
      return NextResponse.json(
        { error: 'Agência não encontrada' },
        { status: 404 }
      );
    }

    const agenciaAtualizada = await prisma.agencia.update({
      where: {
        numero_agencia: params.id
      },
      data: {
        ...(nome_agencia && { nome_agencia }),
        ...(endereco && { endereco }),
        ...(telefone && { telefone })
      }
    });

    return NextResponse.json(agenciaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar agência:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar agência' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar agência
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se existem contas associadas
    const contasAssociadas = await prisma.conta.count({
      where: { numero_agencia: params.id }
    });

    if (contasAssociadas > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar agência com contas associadas' },
        { status: 400 }
      );
    }

    await prisma.agencia.delete({
      where: {
        numero_agencia: params.id
      }
    });

    return NextResponse.json(
      { message: 'Agência deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar agência:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar agência' },
      { status: 500 }
    );
  }
}