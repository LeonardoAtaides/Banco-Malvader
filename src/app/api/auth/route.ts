import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { verificarSenha, gerarToken } from "@/lib/auth";

/**
 * POST /api/auth
 * Autentica um usuário (funcionário ou cliente)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { cpf, senha } = validation.data;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      select: {
        id_usuario: true,
        nome: true,
        cpf: true,
        tipo_usuario: true,
        senha_hash: true,
      },
    });

    if (!usuario) {
      // Retornar erro genérico por segurança
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Verificar senha usando bcrypt
    const senhaValida = await verificarSenha(senha, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Remover senha do retorno
    const { senha_hash, ...usuarioSemSenha } = usuario;

    // Gerar token (em produção, use JWT)
    const token = gerarToken({
      id_usuario: usuario.id_usuario,
      tipo_usuario: usuario.tipo_usuario,
    });

    return NextResponse.json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha,
      token, // Enviar token para o frontend armazenar
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}