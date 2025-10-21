import prisma from '../config/database';
import { TipoConta, StatusConta, PerfilRisco } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface AbrirContaPoupancaInput {
  idCliente: number;
  idAgencia: number;
  senha: string;
  taxaRendimento: number;
}

interface AbrirContaCorrenteInput {
  idCliente: number;
  idAgencia: number;
  senha: string;
  limite: number;
  dataVencimento: Date;
  taxaManutencao?: number;
}

interface AbrirContaInvestimentoInput {
  idCliente: number;
  idAgencia: number;
  senha: string;
  perfilRisco: PerfilRisco;
  valorMinimo: number;
  taxaRendimentoBase: number;
}

interface AlterarContaInput {
  limite?: number;
  dataVencimento?: Date;
  taxaRendimento?: number;
  taxaManutencao?: number;
}

export class ContaService {
  /**
   * Gera número de conta com dígito verificador (Algoritmo de Luhn)
   */
  private gerarNumeroConta(): string {
    const numero = Math.floor(10000000 + Math.random() * 90000000).toString();
    const digito = this.calcularDigitoVerificador(numero);
    return `${numero}-${digito}`;
  }

  /**
   * Calcula dígito verificador usando algoritmo de Luhn
   */
  private calcularDigitoVerificador(numero: string): number {
    let soma = 0;
    let alternar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
      let n = parseInt(numero.charAt(i), 10);

      if (alternar) {
        n *= 2;
        if (n > 9) n -= 9;
      }

      soma += n;
      alternar = !alternar;
    }

    return (10 - (soma % 10)) % 10;
  }

  /**
   * Validar número de conta com dígito verificador
   */
  private validarNumeroConta(numeroConta: string): boolean {
    const [numero, digito] = numeroConta.split('-');
    if (!numero || !digito) return false;

    const digitoCalculado = this.calcularDigitoVerificador(numero);
    return digitoCalculado === parseInt(digito, 10);
  }

  /**
   * Calcular limite dinâmico baseado no score de crédito
   */
  private calcularLimiteDinamico(scoreCredito: number): number {
    if (scoreCredito >= 800) return 10000;
    if (scoreCredito >= 700) return 5000;
    if (scoreCredito >= 600) return 3000;
    if (scoreCredito >= 500) return 1500;
    return 500;
  }

  /**
   * Abrir Conta Poupança
   */
  async abrirContaPoupanca(data: AbrirContaPoupancaInput) {
    const { idCliente, idAgencia, senha, taxaRendimento } = data;

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { idCliente: idCliente }, 
      include: { usuario: true },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se agência existe
    const agencia = await prisma.agencia.findUnique({
      where: { idAgencia: idAgencia }, 
      include: { endereco: true }, 
    });

    if (!agencia) {
      throw new Error('Agência não encontrada');
    }

    // Gerar número de conta único
    let numeroConta = this.gerarNumeroConta();
    let tentativas = 0;

    while (tentativas < 10) {
      const contaExistente = await prisma.conta.findUnique({
        where: { numeroConta },
      });

      if (!contaExistente) break;

      numeroConta = this.gerarNumeroConta();
      tentativas++;
    }

    if (tentativas === 10) {
      throw new Error('Erro ao gerar número de conta único');
    }

    // Criar conta e conta poupança em transação
    const result = await prisma.$transaction(async (tx) => {
      const conta = await tx.conta.create({
        data: {
          numeroConta,
          idAgencia,
          idCliente,
          tipoConta: TipoConta.POUPANCA,
          status: StatusConta.ATIVA,
        },
        include: {
          agencia: {
            include: {
              endereco: true, 
            },
          },
          cliente: {
            include: { usuario: true },
          },
        },
      });

      const contaPoupanca = await tx.contaPoupanca.create({
        data: {
          idConta: conta.idConta, 
          taxaRendimento: new Decimal(taxaRendimento),
        },
      });

      return { conta, contaPoupanca };
    });

    return {
      id: result.conta.idConta, 
      numeroConta: result.conta.numeroConta,
      tipoConta: result.conta.tipoConta,
      saldo: result.conta.saldo,
      status: result.conta.status,
      dataAbertura: result.conta.dataAbertura,
      agencia: {
        nome: result.conta.agencia.nome,
        codigoAgencia: result.conta.agencia.codigoAgencia,
      },
      cliente: {
        nome: result.conta.cliente.usuario.nome,
        cpf: result.conta.cliente.usuario.cpf,
      },
      detalhes: {
        taxaRendimento: result.contaPoupanca.taxaRendimento,
      },
    };
  }

  /**
   * Abrir Conta Corrente
   */
  async abrirContaCorrente(data: AbrirContaCorrenteInput) {
    const { idCliente, idAgencia, senha, limite, dataVencimento, taxaManutencao = 15 } = data;

    // Verificar se cliente existe e obter score de crédito
    const cliente = await prisma.cliente.findUnique({
      where: { id: idCliente },
      include: { usuario: true },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se agência existe
    const agencia = await prisma.agencia.findUnique({
      where: { id: idAgencia },
    });

    if (!agencia) {
      throw new Error('Agência não encontrada');
    }

    // Calcular limite dinâmico baseado no score
    const limiteCalculado = limite || this.calcularLimiteDinamico(cliente.scoreCredito);

    // Gerar número de conta único
    let numeroConta = this.gerarNumeroConta();
    let tentativas = 0;

    while (tentativas < 10) {
      const contaExistente = await prisma.conta.findUnique({
        where: { numeroConta },
      });

      if (!contaExistente) break;

      numeroConta = this.gerarNumeroConta();
      tentativas++;
    }

    // Criar conta e conta corrente em transação
    const result = await prisma.$transaction(async (tx) => {
      const conta = await tx.conta.create({
        data: {
          numeroConta,
          idAgencia,
          idCliente,
          tipoConta: TipoConta.CORRENTE,
          status: StatusConta.ATIVA,
        },
        include: {
          agencia: true,
          cliente: {
            include: { usuario: true },
          },
        },
      });

      const contaCorrente = await tx.contaCorrente.create({
        data: {
          idConta: conta.id,
          limite: new Decimal(limiteCalculado),
          dataVencimento: new Date(dataVencimento),
          taxaManutencao: new Decimal(taxaManutencao),
        },
      });

      return { conta, contaCorrente };
    });

    return {
      id: result.conta.id,
      numeroConta: result.conta.numeroConta,
      tipoConta: result.conta.tipoConta,
      saldo: result.conta.saldo,
      status: result.conta.status,
      dataAbertura: result.conta.dataAbertura,
      agencia: {
        nome: result.conta.agencia.nome,
        codigoAgencia: result.conta.agencia.codigoAgencia,
      },
      cliente: {
        nome: result.conta.cliente.usuario.nome,
        cpf: result.conta.cliente.usuario.cpf,
      },
      detalhes: {
        limite: result.contaCorrente.limite,
        dataVencimento: result.contaCorrente.dataVencimento,
        taxaManutencao: result.contaCorrente.taxaManutencao,
      },
    };
  }

  /**
   * Abrir Conta Investimento
   */
  async abrirContaInvestimento(data: AbrirContaInvestimentoInput) {
    const { idCliente, idAgencia, senha, perfilRisco, valorMinimo, taxaRendimentoBase } = data;

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: idCliente },
      include: { usuario: true },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se agência existe
    const agencia = await prisma.agencia.findUnique({
      where: { id: idAgencia },
    });

    if (!agencia) {
      throw new Error('Agência não encontrada');
    }

    // Validar valor mínimo baseado no perfil de risco
    const valorMinimoRequerido = {
      [PerfilRisco.BAIXO]: 1000,
      [PerfilRisco.MEDIO]: 5000,
      [PerfilRisco.ALTO]: 10000,
    };

    if (valorMinimo < valorMinimoRequerido[perfilRisco]) {
      throw new Error(
        `Valor mínimo para perfil ${perfilRisco} é R$ ${valorMinimoRequerido[perfilRisco]}`
      );
    }

    // Gerar número de conta único
    let numeroConta = this.gerarNumeroConta();
    let tentativas = 0;

    while (tentativas < 10) {
      const contaExistente = await prisma.conta.findUnique({
        where: { numeroConta },
      });

      if (!contaExistente) break;

      numeroConta = this.gerarNumeroConta();
      tentativas++;
    }

    // Criar conta e conta investimento em transação
    const result = await prisma.$transaction(async (tx) => {
      const conta = await tx.conta.create({
        data: {
          numeroConta,
          idAgencia,
          idCliente,
          tipoConta: TipoConta.INVESTIMENTO,
          status: StatusConta.ATIVA,
        },
        include: {
          agencia: true,
          cliente: {
            include: { usuario: true },
          },
        },
      });

      const contaInvestimento = await tx.contaInvestimento.create({
        data: {
          idConta: conta.id,
          perfilRisco,
          valorMinimo: new Decimal(valorMinimo),
          taxaRendimentoBase: new Decimal(taxaRendimentoBase),
        },
      });

      return { conta, contaInvestimento };
    });

    return {
      id: result.conta.id,
      numeroConta: result.conta.numeroConta,
      tipoConta: result.conta.tipoConta,
      saldo: result.conta.saldo,
      status: result.conta.status,
      dataAbertura: result.conta.dataAbertura,
      agencia: {
        nome: result.conta.agencia.nome,
        codigoAgencia: result.conta.agencia.codigoAgencia,
      },
      cliente: {
        nome: result.conta.cliente.usuario.nome,
        cpf: result.conta.cliente.usuario.cpf,
      },
      detalhes: {
        perfilRisco: result.contaInvestimento.perfilRisco,
        valorMinimo: result.contaInvestimento.valorMinimo,
        taxaRendimentoBase: result.contaInvestimento.taxaRendimentoBase,
      },
    };
  }

  /**
   * Consultar conta por número
   */
  async consultarConta(numeroConta: string) {
    const conta = await prisma.conta.findUnique({
      where: { numeroConta },
      include: {
        agencia: {
          include: {
            endereco: true, 
          },
        },
        cliente: {
          include: { usuario: true },
        },
        contaPoupanca: true,
        contaCorrente: true,
        contaInvestimento: true,
      },
    });

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    return {
      id: conta.idConta, 
      numeroConta: conta.numeroConta,
      tipoConta: conta.tipoConta,
      saldo: conta.saldo,
      status: conta.status,
      dataAbertura: conta.dataAbertura,
      agencia: {
        nome: conta.agencia.nome,
        codigoAgencia: conta.agencia.codigoAgencia,
        endereco: conta.agencia.endereco
          ? `${conta.agencia.endereco.local}, ${conta.agencia.endereco.numero} - ${conta.agencia.endereco.bairro}, ${conta.agencia.endereco.cidade}/${conta.agencia.endereco.estado}`
          : 'Endereço não disponível', 
      },
      cliente: {
        nome: conta.cliente.usuario.nome,
        cpf: conta.cliente.usuario.cpf,
        telefone: conta.cliente.usuario.telefone,
        scoreCredito: conta.cliente.scoreCredito,
      },
      detalhes:
        conta.tipoConta === TipoConta.POUPANCA
          ? conta.contaPoupanca
          : conta.tipoConta === TipoConta.CORRENTE
          ? conta.contaCorrente
          : conta.contaInvestimento,
    };
  }

  /**
   * Listar contas de um cliente
   */
  async listarContasCliente(idCliente: number) {
    const contas = await prisma.conta.findMany({
      where: { idCliente },
      include: {
        agencia: true,
        contaPoupanca: true,
        contaCorrente: true,
        contaInvestimento: true,
      },
      orderBy: { dataAbertura: 'desc' },
    });

    return contas.map((conta) => ({
      id: conta.idConta, 
      numeroConta: conta.numeroConta,
      tipoConta: conta.tipoConta,
      saldo: conta.saldo,
      status: conta.status,
      dataAbertura: conta.dataAbertura,
      agencia: conta.agencia.nome,
      detalhes:
        conta.tipoConta === TipoConta.POUPANCA
          ? { taxaRendimento: conta.contaPoupanca?.taxaRendimento }
          : conta.tipoConta === TipoConta.CORRENTE
          ? { limite: conta.contaCorrente?.limite }
          : { perfilRisco: conta.contaInvestimento?.perfilRisco },
    }));
  }

  /**
   * Alterar dados da conta (requer senha de administrador)
   */
  async alterarConta(idConta: number, data: AlterarContaInput) {
    const conta = await prisma.conta.findUnique({
      where: { idConta: idConta }, 
      include: {
        contaCorrente: true,
        contaPoupanca: true,
      },
    });

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    const updates: any = {};

    // Atualizar conta corrente
    if (conta.tipoConta === TipoConta.CORRENTE && conta.contaCorrente) {
      if (data.limite !== undefined) {
        updates.limite = new Decimal(data.limite);
      }
      if (data.dataVencimento !== undefined) {
        updates.dataVencimento = new Date(data.dataVencimento);
      }
      if (data.taxaManutencao !== undefined) {
        updates.taxaManutencao = new Decimal(data.taxaManutencao);
      }

      await prisma.contaCorrente.update({
        where: { idConta }, 
        data: updates,
      });
    }

    // Atualizar conta poupança
    if (conta.tipoConta === TipoConta.POUPANCA && conta.contaPoupanca) {
      if (data.taxaRendimento !== undefined) {
        await prisma.contaPoupanca.update({
          where: { idConta }, 
          data: { taxaRendimento: new Decimal(data.taxaRendimento) },
        });
      }
    }

    return { mensagem: 'Conta atualizada com sucesso' };
  }

  /**
   * Encerrar conta (requer senha e saldo zero)
   */
  async encerrarConta(idConta: number, motivo: string) {
    const conta = await prisma.conta.findUnique({
      where: { idConta: idConta },
    });

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    if (conta.status === StatusConta.ENCERRADA) {
      throw new Error('Conta já está encerrada');
    }

    // Verificar se há saldo pendente
    if (parseFloat(conta.saldo.toString()) !== 0) {
      throw new Error('Não é possível encerrar conta com saldo pendente');
    }

    await prisma.conta.update({
      where: { idConta: idConta }, 
      data: { status: StatusConta.ENCERRADA },
    });

    return {
      mensagem: 'Conta encerrada com sucesso',
      numeroConta: conta.numeroConta,
      dataEncerramento: new Date(),
      motivo,
    };
  }

  /**
   * Consultar saldo
   */
  async consultarSaldo(numeroConta: string) {
    const conta = await prisma.conta.findUnique({
      where: { numeroConta },
      include: {
        contaCorrente: true,
        contaPoupanca: true,
        contaInvestimento: true,
      },
    });

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    const saldoDisponivel =
      conta.tipoConta === TipoConta.CORRENTE && conta.contaCorrente
        ? parseFloat(conta.saldo.toString()) + parseFloat(conta.contaCorrente.limite.toString())
        : parseFloat(conta.saldo.toString());

    // Projeção de rendimentos para CP e CI
    let projecaoRendimento = null;
    if (conta.tipoConta === TipoConta.POUPANCA && conta.contaPoupanca) {
      const taxa = parseFloat(conta.contaPoupanca.taxaRendimento.toString());
      projecaoRendimento = {
        mensal: parseFloat(conta.saldo.toString()) * taxa,
        anual: parseFloat(conta.saldo.toString()) * taxa * 12,
      };
    } else if (conta.tipoConta === TipoConta.INVESTIMENTO && conta.contaInvestimento) {
      const taxa = parseFloat(conta.contaInvestimento.taxaRendimentoBase.toString());
      projecaoRendimento = {
        mensal: parseFloat(conta.saldo.toString()) * taxa,
        anual: parseFloat(conta.saldo.toString()) * taxa * 12,
      };
    }

    return {
      numeroConta: conta.numeroConta,
      tipoConta: conta.tipoConta,
      saldo: conta.saldo,
      saldoDisponivel,
      limite: conta.contaCorrente?.limite || null,
      projecaoRendimento,
    };
  }
}

export default new ContaService();