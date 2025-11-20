import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: {
        usuario: {
          include: {
            endereco_usuario: true, 
          },
        },
        conta: true, 
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const endereco = cliente.usuario.endereco_usuario[0] || null;

    const perfil = {
      nome: cliente.usuario.nome,
      cpf: cliente.usuario.cpf,
      telefone: cliente.usuario.telefone,
      data_nascimento: cliente.usuario.data_nascimento,
      endereco: endereco
        ? {
            cep: endereco.cep,
            rua: endereco.local,
            numero: endereco.numero_casa,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            complemento: endereco.complemento,
          }
        : null,
      numero_conta: cliente.conta[0]?.numero_conta || null,
    };

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Erro ao buscar perfil do cliente:", error);
    return NextResponse.json({ error: "Erro interno ao buscar perfil" }, { status: 500 });
  }
}
