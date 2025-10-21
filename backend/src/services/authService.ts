import prisma from '../config/database';
import { hashPassword, comparePassword, generateToken, validatePasswordStrength } from '../utils/auth';
import { TipoUsuario } from '@prisma/client';

interface LoginInput {
  cpf: string;
  senha: string;
}

interface RegisterClienteInput {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  telefone: string;
  senha: string;
  endereco: {
    cep: string;
    local: string;
    numeroCasa: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento?: string;
  };
}

interface RegisterFuncionarioInput extends RegisterClienteInput {
  cargo: 'ESTAGIARIO' | 'ATENDENTE' | 'GERENTE' | 'ADMINISTRADOR';
  idAgencia: number;
  idSupervisor?: number;
}

export class AuthService {
  /**
   * Login - Autenticação de usuário
   */
  async login(data: LoginInput) {
    const { cpf, senha } = data;

    // Buscar usuário pelo CPF
    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: {
        funcionario: {
          include: {
            agencia: {
              include: {
                endereco: true, 
              },
            },
          },
        },
        cliente: true,
      },
    });

    if (!usuario) {
      throw new Error('CPF ou senha incorretos');
    }

    // Verificar senha
    const senhaValida = await comparePassword(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('CPF ou senha incorretos');
    }

    // Gerar token JWT
    const token = generateToken({
      id: usuario.idUsuario, 
      cpf: usuario.cpf,
      tipoUsuario: usuario.tipoUsuario,
      cargo: usuario.funcionario?.cargo,
    });

    // Retornar dados do usuário (sem senha)
    return {
      token,
      usuario: {
        id: usuario.idUsuario, 
        nome: usuario.nome,
        cpf: usuario.cpf,
        tipoUsuario: usuario.tipoUsuario,
        funcionario: usuario.funcionario ? {
          id: usuario.funcionario.idFuncionario, 
          codigoFuncionario: usuario.funcionario.codigoFuncionario,
          cargo: usuario.funcionario.cargo,
          agencia: usuario.funcionario.agencia,
        } : undefined,
        cliente: usuario.cliente ? {
          id: usuario.cliente.idCliente, 
          scoreCredito: usuario.cliente.scoreCredito,
        } : undefined,
      },
    };
  }

  /**
   * Registrar Cliente
   */
  async registrarCliente(data: RegisterClienteInput) {
    const { nome, cpf, dataNascimento, telefone, senha, endereco } = data;

    // Validar força da senha
    if (!validatePasswordStrength(senha)) {
      throw new Error(
        'Senha fraca. Deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
      );
    }

    // Verificar se CPF já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf },
    });

    if (usuarioExistente) {
      throw new Error('CPF já cadastrado');
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário, cliente e endereço em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          nome,
          cpf,
          dataNascimento: new Date(dataNascimento),
          telefone,
          tipoUsuario: TipoUsuario.CLIENTE,
          senhaHash,
        },
      });

      // Criar cliente
      const cliente = await tx.cliente.create({
        data: {
          idUsuario: usuario.idUsuario, 
        },
      });

      // Criar endereço
      await tx.enderecoUsuario.create({ 
        data: {
          idUsuario: usuario.idUsuario, 
          cep: endereco.cep,
          local: endereco.local,
          numeroCasa: parseInt(endereco.numeroCasa), 
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          complemento: endereco.complemento,
        },
      });

      return { usuario, cliente };
    });

    // Gerar token
    const token = generateToken({
      id: result.usuario.idUsuario, 
      cpf: result.usuario.cpf,
      tipoUsuario: result.usuario.tipoUsuario,
    });

    return {
      token,
      usuario: {
        id: result.usuario.idUsuario, 
        nome: result.usuario.nome,
        cpf: result.usuario.cpf,
        tipoUsuario: result.usuario.tipoUsuario,
      },
    };
  }

  /**
   * Registrar Funcionário (apenas GERENTE ou ADMINISTRADOR pode fazer)
   */
  async registrarFuncionario(data: RegisterFuncionarioInput) {
    const { nome, cpf, dataNascimento, telefone, senha, endereco, cargo, idAgencia, idSupervisor } = data;

    // Validar força da senha
    if (!validatePasswordStrength(senha)) {
      throw new Error(
        'Senha fraca. Deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
      );
    }

    // Verificar se CPF já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf },
    });

    if (usuarioExistente) {
      throw new Error('CPF já cadastrado');
    }

    // Verificar limite de funcionários na agência (máximo 20)
    const totalFuncionariosAgencia = await prisma.funcionario.count({
      where: { idAgencia },
    });

    if (totalFuncionariosAgencia >= 20) {
      throw new Error('Agência atingiu o limite máximo de 20 funcionários');
    }

    // Verificar se agência existe
    const agencia = await prisma.agencia.findUnique({
      where: { id: idAgencia },
    });

    if (!agencia) {
      throw new Error('Agência não encontrada');
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Gerar código de funcionário único
    const codigoFuncionario = `FUNC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Criar usuário, funcionário e endereço em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          nome,
          cpf,
          dataNascimento: new Date(dataNascimento),
          telefone,
          tipoUsuario: TipoUsuario.FUNCIONARIO,
          senhaHash,
        },
      });

      // Criar funcionário
      const funcionario = await tx.funcionario.create({
        data: {
          idUsuario: usuario.id,
          codigoFuncionario,
          cargo,
          idAgencia,
          idSupervisor,
        },
        include: {
          agencia: true,
        },
      });

      // Criar endereço
      await tx.endereco.create({
        data: {
          idUsuario: usuario.id,
          ...endereco,
        },
      });

      return { usuario, funcionario };
    });

    return {
      usuario: {
        id: result.usuario.id,
        nome: result.usuario.nome,
        cpf: result.usuario.cpf,
        tipoUsuario: result.usuario.tipoUsuario,
      },
      funcionario: {
        id: result.funcionario.id,
        codigoFuncionario: result.funcionario.codigoFuncionario,
        cargo: result.funcionario.cargo,
        agencia: result.funcionario.agencia,
      },
    };
  }

  /**
   * Obter perfil do usuário autenticado
   */
  async obterPerfil(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: usuarioId }, // ✅ CORRIGIDO
      include: {
        funcionario: {
          include: {
            agencia: {
              include: {
                endereco: true, // ✅ CORRIGIDO
              },
            },
            supervisor: {
              include: {
                usuario: {
                  select: {
                    nome: true,
                  },
                },
              },
            },
          },
        },
        cliente: {
          include: {
            contas: {
              include: {
                agencia: true,
              },
            },
          },
        },
        enderecos: true,
      },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Remover senha do retorno
    const { senhaHash, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  }

  /**
   * Alterar senha
   */
  async alterarSenha(usuarioId: number, senhaAtual: string, novaSenha: string) {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: usuarioId }, // ✅ CORRIGIDO
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const senhaValida = await comparePassword(senhaAtual, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    // Validar força da nova senha
    if (!validatePasswordStrength(novaSenha)) {
      throw new Error(
        'Senha fraca. Deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
      );
    }

    // Hash da nova senha
    const novaSenhaHash = await hashPassword(novaSenha);

    // Atualizar senha
    await prisma.usuario.update({
      where: { idUsuario: usuarioId }, 
      data: { senhaHash: novaSenhaHash },
    });

    return { mensagem: 'Senha alterada com sucesso' };
  }
}

export default new AuthService();