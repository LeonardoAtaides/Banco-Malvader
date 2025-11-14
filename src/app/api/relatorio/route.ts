import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Listar relatórios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_funcionario = searchParams.get("id_funcionario");
    const tipo_relatorio = searchParams.get("tipo");

    const where: any = {};
    if (id_funcionario) where.id_funcionario = Number(id_funcionario);
    if (tipo_relatorio) where.tipo_relatorio = tipo_relatorio;

    const relatorios = await prisma.relatorio.findMany({
      where,
      include: {
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
      orderBy: { data_geracao: "desc" },
    });

    return NextResponse.json(relatorios);
  } catch (error) {
    console.error("Erro ao listar relatórios:", error);
    return NextResponse.json(
      { error: "Erro ao listar relatórios" },
      { status: 500 }
    );
  }
}

// POST - Gerar novo relatório
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_funcionario, tipo_relatorio, data_inicio, data_fim, id_agencia } = body;

    // Validações
    if (!id_funcionario || !tipo_relatorio) {
      return NextResponse.json(
        { error: "Campos obrigatórios: id_funcionario, tipo_relatorio" },
        { status: 400 }
      );
    }

    // Verificar se funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id_funcionario: Number(id_funcionario) },
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    let conteudo: any = {};

    // Gerar conteúdo baseado no tipo de relatório
    switch (tipo_relatorio) {
      case "MOVIMENTACOES":
        conteudo = await gerarRelatorioMovimentacoes(data_inicio, data_fim, id_agencia);
        break;
      
      case "INADIMPLENTES":
        conteudo = await gerarRelatorioInadimplentes(id_agencia);
        break;
      
      case "DESEMPENHO_FUNCIONARIOS":
        conteudo = await gerarRelatorioDesempenho(data_inicio, data_fim, id_agencia);
        break;
      
      case "CONTAS_ABERTAS":
        conteudo = await gerarRelatorioContasAbertas(data_inicio, data_fim, id_agencia);
        break;
      
      case "SALDOS_AGENCIA":
        conteudo = await gerarRelatorioSaldos(id_agencia);
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }

    // Salvar relatório
    const novoRelatorio = await prisma.relatorio.create({
      data: {
        id_funcionario: Number(id_funcionario),
        tipo_relatorio,
        conteudo: JSON.stringify(conteudo),
      },
      include: {
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(novoRelatorio, { status: 201 });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}

// ========== FUNÇÕES AUXILIARES PARA GERAR RELATÓRIOS ==========

// Relatório de Movimentações por Período
async function gerarRelatorioMovimentacoes(
  data_inicio?: string,
  data_fim?: string,
  id_agencia?: string
) {
  const where: any = {};

  if (data_inicio && data_fim) {
    where.data_hora = {
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    };
  }

  if (id_agencia) {
    where.OR = [
      { conta_transacao_id_conta_origemToconta: { id_agencia: Number(id_agencia) } },
      { conta_transacao_id_conta_destinoToconta: { id_agencia: Number(id_agencia) } },
    ];
  }

  const transacoes = await prisma.transacao.findMany({
    where,
    include: {
      conta_transacao_id_conta_origemToconta: {
        include: {
          cliente: {
            include: {
              usuario: {
                select: { nome: true, cpf: true },
              },
            },
          },
        },
      },
      conta_transacao_id_conta_destinoToconta: {
        include: {
          cliente: {
            include: {
              usuario: {
                select: { nome: true, cpf: true },
              },
            },
          },
        },
      },
    },
    orderBy: { data_hora: "desc" },
  });

  // Calcular totais por tipo
  const totaisPorTipo = transacoes.reduce((acc: any, t) => {
    const tipo = t.tipo_transacao;
    if (!acc[tipo]) acc[tipo] = { quantidade: 0, valor_total: 0 };
    acc[tipo].quantidade++;
    acc[tipo].valor_total += Number(t.valor);
    return acc;
  }, {});

  return {
    periodo: { inicio: data_inicio, fim: data_fim },
    total_transacoes: transacoes.length,
    valor_total_movimentado: transacoes.reduce((sum, t) => sum + Number(t.valor), 0),
    totais_por_tipo: totaisPorTipo,
    transacoes: transacoes.slice(0, 100), // Limitar a 100 para não sobrecarregar
  };
}

// Relatório de Clientes Inadimplentes
async function gerarRelatorioInadimplentes(id_agencia?: string) {
  const where: any = {
    OR: [
      { saldo: { lt: 0 } }, // Saldo negativo
    ],
  };

  if (id_agencia) {
    where.id_agencia = Number(id_agencia);
  }

  const contas = await prisma.conta.findMany({
    where,
    include: {
      cliente: {
        include: {
          usuario: {
            select: { nome: true, cpf: true, telefone: true },
          },
        },
      },
      conta_corrente: true,
    },
  });

  const inadimplentes = contas.map((conta) => ({
    numero_conta: conta.numero_conta,
    cliente: conta.cliente.usuario.nome,
    cpf: conta.cliente.usuario.cpf,
    telefone: conta.cliente.usuario.telefone,
    saldo: Number(conta.saldo),
    limite: conta.conta_corrente ? Number(conta.conta_corrente.limite) : 0,
    divida: Math.abs(Number(conta.saldo)),
  }));

  return {
    total_inadimplentes: inadimplentes.length,
    valor_total_dividas: inadimplentes.reduce((sum, c) => sum + c.divida, 0),
    clientes: inadimplentes,
  };
}

// Relatório de Desempenho de Funcionários
async function gerarRelatorioDesempenho(
  data_inicio?: string,
  data_fim?: string,
  id_agencia?: string
) {
  const where: any = {};

  if (id_agencia) {
    where.id_agencia = Number(id_agencia);
  }

  const funcionarios = await prisma.funcionario.findMany({
    where,
    include: {
      usuario: {
        select: { nome: true, cpf: true },
      },
      auditoria_abertura_conta: {
        where: data_inicio && data_fim ? {
          data_hora: {
            gte: new Date(data_inicio),
            lte: new Date(data_fim),
          },
        } : undefined,
      },
    },
  });

  const desempenho = funcionarios.map((func) => ({
    codigo: func.codigo_funcionario,
    nome: func.usuario.nome,
    cargo: func.cargo,
    contas_abertas: func.auditoria_abertura_conta.length,
  }));

  return {
    periodo: { inicio: data_inicio, fim: data_fim },
    total_funcionarios: desempenho.length,
    total_contas_abertas: desempenho.reduce((sum, f) => sum + f.contas_abertas, 0),
    funcionarios: desempenho.sort((a, b) => b.contas_abertas - a.contas_abertas),
  };
}

// Relatório de Contas Abertas
async function gerarRelatorioContasAbertas(
  data_inicio?: string,
  data_fim?: string,
  id_agencia?: string
) {
  const where: any = {};

  if (data_inicio && data_fim) {
    where.data_abertura = {
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    };
  }

  if (id_agencia) {
    where.id_agencia = Number(id_agencia);
  }

  const contas = await prisma.conta.findMany({
    where,
    include: {
      cliente: {
        include: {
          usuario: {
            select: { nome: true, cpf: true },
          },
        },
      },
      agencia: {
        select: { nome: true, codigo_agencia: true },
      },
    },
  });

  const porTipo = contas.reduce((acc: any, c) => {
    const tipo = c.tipo_conta;
    if (!acc[tipo]) acc[tipo] = 0;
    acc[tipo]++;
    return acc;
  }, {});

  return {
    periodo: { inicio: data_inicio, fim: data_fim },
    total_contas: contas.length,
    por_tipo: porTipo,
    contas: contas.map((c) => ({
      numero_conta: c.numero_conta,
      tipo: c.tipo_conta,
      cliente: c.cliente.usuario.nome,
      cpf: c.cliente.usuario.cpf,
      data_abertura: c.data_abertura,
      agencia: c.agencia.nome,
    })),
  };
}

// Relatório de Saldos por Agência
async function gerarRelatorioSaldos(id_agencia?: string) {
  const where: any = {
    status: "ATIVA",
  };

  if (id_agencia) {
    where.id_agencia = Number(id_agencia);
  }

  const contas = await prisma.conta.findMany({
    where,
    include: {
      agencia: {
        select: { nome: true, codigo_agencia: true },
      },
    },
  });

  const porAgencia = contas.reduce((acc: any, c) => {
    const agencia = c.agencia.nome;
    if (!acc[agencia]) {
      acc[agencia] = {
        codigo: c.agencia.codigo_agencia,
        total_contas: 0,
        saldo_total: 0,
      };
    }
    acc[agencia].total_contas++;
    acc[agencia].saldo_total += Number(c.saldo);
    return acc;
  }, {});

  return {
    total_agencias: Object.keys(porAgencia).length,
    saldo_total_sistema: contas.reduce((sum, c) => sum + Number(c.saldo), 0),
    por_agencia: porAgencia,
  };
}