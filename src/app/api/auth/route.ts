import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createHash } from "crypto";

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
    
    // Gerar hash MD5 da senha
    const senhaHash = createHash("md5").update(senha).digest("hex");

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

    if (!usuario || usuario.senha_hash !== senhaHash) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Remover senha do retorno
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return NextResponse.json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha,
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}