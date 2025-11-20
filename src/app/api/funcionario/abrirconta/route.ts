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

    // 📥 Obter dados do request
    const body = await request.json();
    console.log('📨 Dados recebidos:', body);
    
    const { 
      nome,
      data_nascimento, 
      cpf, 
      telefone, 
      endereco,
      tipoConta,
      vencimento,
      taxa,
      limite,
      taxaRendimento,
      valorMinimo,
      perfilRisco
    } = body;

    // ✅ Validações básicas
    if (!nome || !cpf || !data_nascimento || !telefone || !tipoConta) {
      return NextResponse.json({ 
        error: "Todos os campos obrigatórios devem ser preenchidos" 
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
      try {
        const tipoContaMap: { [key: string]: "CORRENTE" | "POUPANCA" | "INVESTIMENTO" } = {
          "Conta Corrente (CC)": "CORRENTE",
          "Conta Poupança (CP)": "POUPANCA", 
          "Conta Investimento (CI)": "INVESTIMENTO"
        };
        
        const tipoContaBanco = tipoContaMap[tipoConta] || "CORRENTE";
        console.log('🎯 Tipo de conta mapeado:', tipoContaBanco);

        const agencia = await tx.agencia.findFirst({
          where: { id_agencia: funcionarioAutenticado.id_agencia }
        });
        
        if (!agencia) {
          throw new Error("Agência não encontrada");
        }
        console.log('🏦 Agência encontrada:', agencia.id_agencia);


        const gerarNumeroConta = () => {
          const timestamp = Date.now().toString();
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return `${timestamp}${random}`.slice(-15); 
        };

        const numeroConta = gerarNumeroConta();
        console.log('🔢 Número da conta gerado:', numeroConta);

        const novoUsuario = await tx.usuario.create({
          data: {
            nome: nome.trim(),
            cpf: cpfLimpo,
            data_nascimento: new Date(data_nascimento),
            telefone: telefoneLimpo,
            tipo_usuario: "CLIENTE",
            senha_hash: await bcrypt.hash("123456", 10) 
          }
        });
        console.log('👤 Usuário criado:', novoUsuario.id_usuario);


        const novoCliente = await tx.cliente.create({
          data: {
            id_usuario: novoUsuario.id_usuario,
            score_credito: 0.00
          }
        });
        console.log('👥 Cliente criado:', novoCliente.id_cliente);

        const novaConta = await tx.conta.create({
          data: {
            numero_conta: numeroConta,
            id_agencia: agencia.id_agencia,
            id_cliente: novoCliente.id_cliente,
            tipo_conta: tipoContaBanco,
            saldo: 0.00,
            status: "ATIVA"
          }
        });
        console.log('💳 Conta criada:', novaConta.id_conta, 'Número:', novaConta.numero_conta);

        if (tipoContaBanco === "CORRENTE") {
          const converterParaDecimal = (valor: string): number => {
            if (!valor || typeof valor !== 'string') return 0;
            try {
              const valorLimpo = valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
              return parseFloat(valorLimpo) || 0;
            } catch {
              return 0;
            }
          };

          const taxaLimpa = converterParaDecimal(taxa || "R$ 25,00");
          const limiteLimpo = converterParaDecimal(limite || "R$ 1000,00");

          const diaVencimento = vencimento ? parseInt(vencimento.replace("Dia ", "")) || 5 : 5;

          const hoje = new Date();
          let dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaVencimento);
          
          if (hoje.getDate() > diaVencimento) {
            dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 2, diaVencimento);
          }

          await tx.conta_corrente.create({
            data: {
              id_conta: novaConta.id_conta,
              limite: limiteLimpo,
              data_vencimento: dataVencimento,
              taxa_manutencao: taxaLimpa
            }
          });
          console.log('💰 Conta corrente criada');
        } 
        else if (tipoContaBanco === "POUPANCA") {
          const taxaRendimentoLimpa = parseFloat(taxaRendimento) || 0.05;
          
          await tx.conta_poupanca.create({
            data: {
              id_conta: novaConta.id_conta,
              taxa_rendimento: taxaRendimentoLimpa,
              ultimo_rendimento: null
            }
          });
          console.log('🐷 Conta poupança criada');
        }
        else if (tipoContaBanco === "INVESTIMENTO") {
          // Converter valores monetários
          const converterParaDecimal = (valor: string): number => {
            if (!valor || typeof valor !== 'string') return 0;
            try {
              const valorLimpo = valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
              return parseFloat(valorLimpo) || 0;
            } catch {
              return 0;
            }
          };

          const valorMinimoLimpo = converterParaDecimal(valorMinimo || "R$ 100,00");
          const taxaRendimentoLimpa = parseFloat(taxaRendimento) || 0.08;
          
          await tx.conta_investimento.create({
            data: {
              id_conta: novaConta.id_conta,
              perfil_risco: (perfilRisco || "MEDIO") as "BAIXO" | "MEDIO" | "ALTO",
              valor_minimo: valorMinimoLimpo,
              taxa_rendimento_base: taxaRendimentoLimpa
            }
          });
          console.log('📈 Conta investimento criada');
        }

        if (endereco && endereco.trim() !== "") {
          await tx.endereco_usuario.create({
            data: {
              id_usuario: novoUsuario.id_usuario,
              cep: "00000000",
              local: endereco,
              numero_casa: 0, 
              bairro: "", 
              cidade: "", 
              estado: "" 
            }
          });
          console.log('🏠 Endereço criado');
        }

        await tx.auditoria_abertura_conta.create({
          data: {
            id_conta: novaConta.id_conta,
            id_funcionario: funcionarioAutenticado.id_funcionario,
            observacao: `Conta ${tipoContaBanco.toLowerCase()} aberta para ${nome}`
          }
        });
        console.log('📋 Auditoria registrada');

        return { 
          usuario: novoUsuario, 
          cliente: novoCliente,
          conta: novaConta,
          agencia: agencia
        };

      } catch (transactionError: any) {
        console.error('❌ Erro na transaction:', transactionError);
        console.error('📋 Detalhes do erro:', {
          code: transactionError.code,
          message: transactionError.message,
          meta: transactionError.meta
        });
        throw transactionError;
      }
    });

    console.log('✅ Transação concluída com sucesso');

    return NextResponse.json({
      success: true,
      message: "Conta aberta com sucesso",
      dados: {
        nome: resultado.usuario.nome,
        numero_conta: resultado.conta.numero_conta,
        tipo_conta: resultado.conta.tipo_conta,
        data_abertura: resultado.conta.data_abertura,
        agencia: resultado.agencia.nome
      }
    });

  } catch (error: any) {
    console.error("💥 Erro detalhado ao abrir conta:", error);
    console.error("📋 Stack trace:", error.stack);
    console.error("🔍 Código do erro:", error.code);
    console.error("📝 Meta do erro:", error.meta);

    if (error.code === "P2002") {
      if (error.meta?.target?.includes("cpf")) {
        return NextResponse.json({ 
          error: "CPF já cadastrado no sistema" 
        }, { status: 409 });
      }
      if (error.meta?.target?.includes("numero_conta")) {
        return NextResponse.json({ 
          error: "Erro ao gerar número da conta. Tente novamente." 
        }, { status: 500 });
      }
    }

    if (error.code === "P2003") {
      return NextResponse.json({ 
        error: "Erro de referência no banco de dados. Verifique as relações." 
      }, { status: 500 });
    }

    if (error.code === "P2011") {
      return NextResponse.json({ 
        error: "Campo obrigatório não preenchido." 
      }, { status: 400 });
    }

    return NextResponse.json(
      { 
        error: "Erro interno ao abrir conta",
        details: process.env.NODE_ENV === "development" ? error.message : "Entre em contato com o suporte",
        code: error.code
      },
      { status: 500 }
    );
  }
}