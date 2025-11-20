// /api/funcionario/novo/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let payload: any;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const funcionarioAutenticado = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: { usuario: true },
    });

    if (!funcionarioAutenticado) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    if (funcionarioAutenticado.cargo !== "GERENTE") {
      return NextResponse.json({ 
        error: "Apenas gerentes podem cadastrar novos funcionários" 
      }, { status: 403 });
    }

    const body = await request.json();
    const { 
      nome,
      data_nascimento, 
      cpf, 
      telefone, 
      endereco,
      cargo
    } = body;

    if (!nome || !cpf || !data_nascimento || !telefone || !cargo) {
      return NextResponse.json({ 
        error: "Todos os campos são obrigatórios" 
      }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf: cpfLimpo }
    });

    if (usuarioExistente) {
      return NextResponse.json({ 
        error: "CPF já cadastrado no sistema" 
      }, { status: 409 });
    }


    const resultado = await prisma.$transaction(async (tx) => {

      const cargoMap: { [key: string]: "GERENTE" | "ATENDENTE" | "ESTAGIARIO" } = {
        "Gerente": "GERENTE",
        "Funcionário": "ATENDENTE", 
        "Estagiário": "ESTAGIARIO"
      };
      
      const cargoBanco = cargoMap[cargo] || "ATENDENTE";

 
      const novoUsuario = await tx.usuario.create({
        data: {
          nome: nome.trim(),
          cpf: cpfLimpo,
          data_nascimento: new Date(data_nascimento),
          telefone: telefoneLimpo,
          tipo_usuario: "FUNCIONARIO",
          senha_hash: await bcrypt.hash("123456", 10) 
        }
      });


      const codigoFuncionario = `FUNC${Date.now().toString().slice(-6)}`;

      const novoFuncionario = await tx.funcionario.create({
        data: {
          id_usuario: novoUsuario.id_usuario,
          id_agencia: funcionarioAutenticado.id_agencia, 
          codigo_funcionario: codigoFuncionario,
          cargo: cargoBanco,
          id_supervisor: funcionarioAutenticado.id_funcionario
        }
      });

      if (endereco && endereco.trim() !== "") {
        await tx.endereco_usuario.create({
          data: {
            id_usuario: novoUsuario.id_usuario,
            cep: "", 
            local: endereco,
            numero_casa: 0,
            bairro: "", 
            cidade: "", 
            estado: "" 
          }
        });
      }

      return { usuario: novoUsuario, funcionario: novoFuncionario };
    });

    return NextResponse.json({
      success: true,
      message: "Funcionário cadastrado com sucesso",
      dados: {
        nome: resultado.usuario.nome,
        codigo_funcionario: resultado.funcionario.codigo_funcionario,
        cargo: resultado.funcionario.cargo,
        data_cadastro: new Date()
      }
    });

  } catch (error: any) {
    console.error("Erro detalhado ao cadastrar funcionário:", error);
    
    if (error.code === "P2002" && error.meta?.target?.includes("cpf")) {
      return NextResponse.json({ 
        error: "CPF já cadastrado no sistema" 
      }, { status: 409 });
    }

    return NextResponse.json(
      { 
        error: "Erro interno ao cadastrar funcionário",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}