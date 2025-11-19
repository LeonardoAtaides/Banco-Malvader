// DELETE - excluir conta
// file: /app/api/funcionario/excluirconta/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function DELETE(request: NextRequest) {
  try {
    // TOKEN
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

    // FUNCIONÁRIO
    const funcionario = await prisma.funcionario.findFirst({
      where: { id_usuario: payload.id_usuario },
      include: { usuario: true },
    });
    if (!funcionario) return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    if (funcionario.cargo !== "GERENTE") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    // BODY
    const body = await request.json();
    const { numeroConta, senha } = body;
    if (!numeroConta) return NextResponse.json({ error: "Número da conta é obrigatório" }, { status: 400 });
    if (!senha) return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 });

    const senhaValida = await bcrypt.compare(senha, funcionario.usuario.senha_hash);
    if (!senhaValida) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });

    // BUSCA CONTA
    const conta = await prisma.conta.findFirst({
      where: { numero_conta: numeroConta },
      include: {
        cliente: { select: { usuario: { select: { nome: true } } } },
        conta_corrente: true,
        conta_poupanca: true,
        conta_investimento: true,
        historico_encerramento: true,
        auditoria_abertura_conta: true,
        transacao_transacao_id_conta_origemToconta: true,
        transacao_transacao_id_conta_destinoToconta: true,
      },
    });
    if (!conta) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    if (conta.status !== "ATIVA") return NextResponse.json({ error: "Conta não está ativa ou já foi encerrada" }, { status: 400 });

    // SALDO
    if (Number(conta.saldo) > 0) return NextResponse.json({ error: "Conta possui saldo. Não é possível encerra-la." }, { status: 400 });

    // DELETE RELACIONADOS
    if (conta.conta_corrente) await prisma.conta_corrente.delete({ where: { id_conta_corrente: conta.conta_corrente.id_conta_corrente } });
    if (conta.conta_poupanca) await prisma.conta_poupanca.delete({ where: { id_conta_poupanca: conta.conta_poupanca.id_conta_poupanca } });
    if (conta.conta_investimento) await prisma.conta_investimento.delete({ where: { id_conta_investimento: conta.conta_investimento.id_conta_investimento } });

    if (conta.historico_encerramento.length > 0) await prisma.historico_encerramento.deleteMany({ where: { id_conta: conta.id_conta } });
    if (conta.auditoria_abertura_conta.length > 0) await prisma.auditoria_abertura_conta.deleteMany({ where: { id_conta: conta.id_conta } });
    if (conta.transacao_transacao_id_conta_origemToconta.length > 0) await prisma.transacao.deleteMany({ where: { id_conta_origem: conta.id_conta } });
    if (conta.transacao_transacao_id_conta_destinoToconta.length > 0) await prisma.transacao.deleteMany({ where: { id_conta_destino: conta.id_conta } });

    // DELETE CONTA
    await prisma.conta.delete({ where: { id_conta: conta.id_conta } });

    return NextResponse.json({ sucesso: true, mensagem: "Conta excluída com sucesso", nome_cliente: conta.cliente.usuario.nome });

  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json({ error: "Erro interno ao excluir a conta" }, { status: 500 });
  }
}
