import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validarSenhaForte } from "@/lib/validations";
import { hashSenha, verificarSenha } from "@/lib/auth";
import { z } from "zod";

const alterarSenhaSchema = z.object({
  id_usuario: z.number().int(),
  senha_atual: z.string().min(1, "Senha atual é obrigatória"),
  senha_nova: z.string().min(1, "Nova senha é obrigatória"),
});

/**
 * PUT /api/usuario/senha
 * Altera a senha de um usuário (requer senha atual)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = alterarSenhaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { id_usuario, senha_atual, senha_nova } = validation.data;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { senha_hash: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const senhaAtualValida = await verificarSenha(senha_atual, usuario.senha_hash);
    if (!senhaAtualValida) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 401 }
      );
    }

    // Validar força da nova senha
    const senhaValidacao = validarSenhaForte(senha_nova);
    if (!senhaValidacao.valida) {
      return NextResponse.json(
        { error: senhaValidacao.mensagem },
        { status: 400 }
      );
    }

    // Gerar hash da nova senha
    const novaSenhaHash = await hashSenha(senha_nova);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id_usuario },
      data: { senha_hash: novaSenhaHash },
    });

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    });

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro ao alterar senha" },
      { status: 500 }
    );
  }
}