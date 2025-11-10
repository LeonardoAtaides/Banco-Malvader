import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as agências
export async function GET() {
  try {
    const agencias = await prisma.agencia.findMany({
      orderBy: {
        numero_agencia: 'asc'
      }
    });

    return NextResponse.json(agencias);
  } catch (error) {
    console.error('Erro ao buscar agências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar agências' },
      { status: 500 }
    );
  }
}

// POST - Criar nova agência
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { numero_agencia, nome_agencia, endereco, telefone } = body;

    // Validações básicas
    if (!numero_agencia || !nome_agencia || !endereco) {
      return NextResponse.json(
        { error: 'Número da agência, nome e endereço são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a agência já existe
    const agenciaExistente = await prisma.agencia.findUnique({
      where: { numero_agencia }
    });

    if (agenciaExistente) {
      return NextResponse.json(
        { error: 'Agência com este número já existe' },
        { status: 409 }
      );
    }

    const novaAgencia = await prisma.agencia.create({
      data: {
        numero_agencia,
        nome_agencia,
        endereco,
        telefone
      }
    });

    return NextResponse.json(novaAgencia, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agência:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agência' },
      { status: 500 }
    );
  }
}