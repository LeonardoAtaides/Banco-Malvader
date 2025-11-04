import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { usuarioSchema, validarSenhaForte } from "@/lib/validations";
import { hashSenha } from "@/lib/auth";

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

/**
 * POST /api/usuario
 * Cadastra um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

   // Validar entrada
       const validation = usuarioSchema.safeParse(body);
       if (!validation.success) {
         return NextResponse.json(
           { error: "Dados inválidos", details: validation.error.issues },
           { status: 400 }
         );
       }

    const { nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash: senha } = validation.data;

    // Validar força da senha
    const senhaValidacao = validarSenhaForte(senha);
    if (!senhaValidacao.valida) {
      return NextResponse.json(
        { error: senhaValidacao.mensagem },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha usando bcrypt
    const senhaHash = await hashSenha(senha);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        cpf,
        data_nascimento: new Date(data_nascimento),
        telefone,
        tipo_usuario,
        senha_hash: senhaHash,
      },
      select: {
        id_usuario: true,
        nome: true,
        cpf: true,
        data_nascimento: true,
        telefone: true,
        tipo_usuario: true,
        // NÃO retornar senha_hash
      },
    });

    return NextResponse.json(novoUsuario, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
