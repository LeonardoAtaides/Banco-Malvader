import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashSenha } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema de validação de criação de usuário
 */
const usuarioCreateSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11).max(11),
  data_nascimento: z.string().transform((d) => new Date(d)), // formato: "2000-01-01"
  telefone: z.string().min(8),
  tipo_usuario: z.enum(["CLIENTE", "FUNCIONARIO"]),
  senha: z.string().min(6),
});

/**
 * POST /api/usuario
 * Cria um novo usuário (para testes ou cadastro real)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados de entrada
    const parsed = usuarioCreateSchema.parse(body);

    // Gerar hash seguro da senha
    const senha_hash = await hashSenha(parsed.senha);

    // Inserir no banco
    const usuario = await prisma.usuario.create({
      data: {
        nome: parsed.nome,
        cpf: parsed.cpf,
        data_nascimento: parsed.data_nascimento,
        telefone: parsed.telefone,
        tipo_usuario: parsed.tipo_usuario,
        senha_hash,
      },
      select: {
        id_usuario: true,
        nome: true,
        cpf: true,
        tipo_usuario: true,
      },
    });

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      usuario,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
