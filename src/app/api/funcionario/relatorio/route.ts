import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipoRelatorio, clienteId, dataInicio, dataFim, tipoTransacao } = body;

    if (tipoRelatorio === "resumo_contas") {
      const where: any = {};
      if (clienteId) where.id_cliente = Number(clienteId);
      
      const contas = await prisma.conta.findMany({
        where,
        include: {
          cliente: { include: { usuario: true } },
        },
      });

      const totalContas = contas.length;
      const totalPorTipo: Record<string, number> = {};
      let saldoTotal = 0;

      contas.forEach((conta) => {
        saldoTotal += Number(conta.saldo);
        if (conta.tipo_conta) {
          totalPorTipo[conta.tipo_conta] = (totalPorTipo[conta.tipo_conta] || 0) + 1;
        }
      });

      const saldoMedio = totalContas > 0 ? saldoTotal / totalContas : 0;

      return NextResponse.json({
        sucesso: true,
        data: {
          totalContas,
          totalPorTipo,
          saldoTotal,
          saldoMedio,
        },
      });
    }

    if (tipoRelatorio === "movimentacoes") {
      const where: any = {};

      if (clienteId) where.id_conta_origem = Number(clienteId);

      const tipoMap: Record<string, string> = {
        "Depósito": "deposito",
        "Saque": "saque",
        "Transferência": "transferencia",
      };

      if (tipoTransacao && tipoTransacao !== "Todas") {
        where.tipo_transacao = tipoMap[tipoTransacao];
      }

      if (dataInicio || dataFim) {
        where.data_hora = {};
        if (dataInicio) where.data_hora.gte = new Date(dataInicio);
        if (dataFim) where.data_hora.lte = new Date(dataFim);
      }

      const movimentacoes = await prisma.transacao.findMany({
        where,
        include: {
          conta_transacao_id_conta_origemToconta: {
            include: { cliente: { include: { usuario: true } } },
          },
          conta_transacao_id_conta_destinoToconta: true,
        },
        orderBy: { data_hora: "desc" },
      });

      const resultado = movimentacoes.map((t) => ({
        id_transacao: t.id_transacao,
        tipo_transacao: t.tipo_transacao,
        valor: Number(t.valor),
        data_hora: t.data_hora,
        conta_origem: t.conta_transacao_id_conta_origemToconta?.numero_conta || null,
        conta_destino: t.conta_transacao_id_conta_destinoToconta?.numero_conta || null,
        cliente_origem: t.conta_transacao_id_conta_origemToconta?.cliente.usuario.nome || null,
      }));

      return NextResponse.json({ sucesso: true, data: resultado });
    }

    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: "Erro interno ao gerar relatório" }, { status: 500 });
  }
}
