import { Router, Request, Response } from 'express';
import { executeQuery } from '@/lib/database';
import { LoginSchema } from '@/lib/schemas';
import { hashPasswordMD5, generateToken } from '@/lib/auth';
import { LoginRequest, LoginResponse } from '@/types/banco';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as LoginRequest;
    
    // Validação dos dados de entrada
    const validatedData = LoginSchema.parse(body);
    const { cpf, senha } = validatedData;

    // Busca o usuário pelo CPF
    const query = `
      SELECT u.id_usuario, u.nome, u.cpf, u.tipo_usuario, u.senha_hash,
             c.id_cliente, f.id_funcionario, f.cargo, f.id_agencia
      FROM usuario u
      LEFT JOIN cliente c ON u.id_usuario = c.id_usuario
      LEFT JOIN funcionario f ON u.id_usuario = f.id_usuario
      WHERE u.cpf = ?
    `;
    
    const results = await executeQuery(query, [cpf]) as any[];
    
    if (results.length === 0) {
      res.status(401).json({
        error: 'Usuário não encontrado'
      });
      return;
    }

    const usuario = results[0];
    
    // Verifica a senha (usando MD5 como no banco)
    const senhaHash = hashPasswordMD5(senha);
    
    if (senhaHash !== usuario.senha_hash) {
      res.status(401).json({
        error: 'Senha incorreta'
      });
      return;
    }

    // Gera o token JWT
    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      cpf: usuario.cpf,
      tipo_usuario: usuario.tipo_usuario,
      id_cliente: usuario.id_cliente,
      id_funcionario: usuario.id_funcionario,
      cargo: usuario.cargo,
      id_agencia: usuario.id_agencia
    };

    const token = generateToken(tokenPayload);

    const response: LoginResponse = {
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        cpf: usuario.cpf,
        tipo_usuario: usuario.tipo_usuario,
        id_cliente: usuario.id_cliente,
        id_funcionario: usuario.id_funcionario,
        cargo: usuario.cargo,
        id_agencia: usuario.id_agencia
      }
    };

    res.json(response);

  } catch (error: any) {
    console.error('Erro no login:', error);
    
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors
      });
      return;
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    
    const { usuario, endereco, senha } = body;

    // Gera hash MD5 da senha
    const senhaHash = hashPasswordMD5(senha);

    // Verifica se o CPF já existe
    const existingUser = await executeQuery(
      'SELECT id_usuario FROM usuario WHERE cpf = ?',
      [usuario.cpf]
    ) as any[];

    if (existingUser.length > 0) {
      res.status(400).json({
        error: 'CPF já cadastrado'
      });
      return;
    }

    // Insere o usuário
    const userResult = await executeQuery(
      `INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario.nome, usuario.cpf, usuario.data_nascimento, usuario.telefone, usuario.tipo_usuario, senhaHash]
    ) as any;

    const userId = userResult.insertId;

    // Insere o endereço
    await executeQuery(
      `INSERT INTO endereco_usuario (id_usuario, cep, local, numero_casa, bairro, cidade, estado, complemento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, endereco.cep, endereco.local, endereco.numero_casa, endereco.bairro, endereco.cidade, endereco.estado, endereco.complemento]
    );

    // Se for cliente, cria registro na tabela cliente
    if (usuario.tipo_usuario === 'CLIENTE') {
      await executeQuery(
        'INSERT INTO cliente (id_usuario, score_credito) VALUES (?, 0.00)',
        [userId]
      );
    }

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      id_usuario: userId
    });

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/auth/alterar-senha
router.put('/alterar-senha', async (req: Request, res: Response): Promise<void> => {
  try {
    // Esta rota necessitaria do middleware de autenticação
    // Implementação simplificada para exemplo
    res.status(501).json({
      error: 'Funcionalidade não implementada neste exemplo'
    });
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
