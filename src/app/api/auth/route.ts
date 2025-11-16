// /app/api/auth/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Função para verificar senha MD5
function verificarSenha(senhaClara: string, hashBanco: string) {
  const hash = crypto.createHash("md5").update(senhaClara).digest("hex");
  return hash === hashBanco;
}

// Função para gerar JWT
function gerarToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecret", {
    expiresIn: "8h",
  });
}

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

    // 2️⃣ Buscar usuário pelo CPF
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

    if (!usuario) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // 3️⃣ Verificar senha
    const senhaValida = verificarSenha(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // 4️⃣ Montar payload JWT
    const payload = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario,
      id_cliente: usuario.cliente?.id_cliente ?? null,
      id_funcionario: usuario.funcionario?.id_funcionario ?? null,
    };

    const token = gerarToken(payload);

    // 5️⃣ Retornar usuário sem a senha
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return NextResponse.json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
