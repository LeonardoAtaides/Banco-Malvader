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

    // 1️⃣ Validar entrada com Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { cpf, senha } = validation.data;

    //  Buscar usuário + possíveis vínculos
    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      select: {
        id_usuario: true,
        nome: true,
        tipo_usuario: true,
        senha_hash: true,
        cliente: { select: { id_cliente: true } },
        funcionario: { select: { id_funcionario: true } },
        chat_sessions: true,
      },
    });

    //  Caso não exista, erro genérico
    if (!usuario) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    //  Validar senha
    const senhaValida = await verificarSenha(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    //  Montar payload JWT
    const payload = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario,
      id_cliente: usuario.cliente?.[0]?.id_cliente ?? null,
      id_funcionario: usuario.funcionario?.[0]?.id_funcionario ?? null,
    };

    //  Gerar token
    const token = gerarToken(payload);

    //  Montar resposta limpa (sem senha)
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return NextResponse.json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha,
      token,
    });
  } catch (error: unknown) {
    console.error("Erro no login:", error);

    //  Resposta segura, sem vazar stack trace
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
