// /api/funcionario/perfil
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const funcionario = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: {
        usuario: {
          include: {
            endereco_usuario: true,
          },
        },
      },
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }


    const perfil = {
      nome: funcionario.usuario.nome,
      cargo: funcionario.cargo,
      
    };

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Erro ao buscar perfil do funcionário:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar perfil" },
      { status: 500 }
    );
  }
}
