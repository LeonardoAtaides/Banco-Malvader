import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: { endereco_usuario: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const endereco = usuario.endereco_usuario[0] || null;

    return NextResponse.json({
      nome: usuario.nome,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      data_nascimento: usuario.data_nascimento,
      tipo_usuario: usuario.tipo_usuario,
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
    });
  } catch (error) {
    console.error("Erro ao consultar dados:", error);
    return NextResponse.json(
      { error: "Erro interno ao consultar dados" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { cpf, nome, telefone, data_nascimento, endereco } = body;

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: cpfLimpo },
      select: {
        id_usuario: true,
        nome: true,
        tipo_usuario: true,
        endereco_usuario: {
          select: {
            id_endereco: true
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (!usuario.id_usuario) {
      return NextResponse.json(
        { error: "ID do usuário não encontrado" },
        { status: 400 }
      );
    }

    await prisma.usuario.update({
      where: { cpf: cpfLimpo },
      data: {
        nome,
        telefone,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
      },
    });


    if (endereco) {
      const existeEndereco = usuario.endereco_usuario?.length > 0;

      const dadosEndereco = {
        cep: endereco.cep?.replace(/\D/g, "") || "",
        local: endereco.rua || "",
        numero_casa: endereco.numero || "",
        bairro: endereco.bairro || "",
        cidade: endereco.cidade || "",
        estado: endereco.estado || "",
        complemento: endereco.complemento || "",
      };

      try {
        if (existeEndereco) {
          await prisma.endereco_usuario.update({
            where: {
              id_endereco: usuario.endereco_usuario[0].id_endereco,
            },
            data: dadosEndereco,
          });
        } else {
          await prisma.endereco_usuario.create({
            data: {
              id_usuario: usuario.id_usuario, 
              ...dadosEndereco
            },
          });
        }
      } catch (error) {
        console.error("Erro ao processar endereço:", error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Dados atualizados com sucesso" 
    });

  } catch (error) {
    console.error("Erro detalhado ao atualizar dados:", error);
    
    let errorMessage = "Erro interno ao atualizar dados";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}