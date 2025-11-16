"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import jwt from "jsonwebtoken";
import { verificarSenha } from "@/lib/auth"; // bcrypt correto

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { cpf, senha } = validation.data;

    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      select: {
        id_usuario: true,
        nome: true,
        tipo_usuario: true,
        senha_hash: true,
        cliente: { select: { id_cliente: true } },
        funcionario: { select: { id_funcionario: true } },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Usa bcrypt
    const senhaValida = await verificarSenha(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "CPF ou senha incorretos" },
        { status: 401 }
      );
    }

    // Payload seguro
    const payload = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario,
      id_cliente: usuario.cliente?.[0]?.id_cliente,
      id_funcionario: usuario.funcionario?.[0]?.id_funcionario,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "supersecret", {
      expiresIn: "8h",
    });

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
