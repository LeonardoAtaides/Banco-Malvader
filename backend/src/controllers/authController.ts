import { Response } from 'express';
import authService from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { loginSchema, usuarioSchema, enderecoSchema } from '../utils/validators';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: AuthRequest, res: Response) {
    try {
      // Validar dados de entrada
      const validatedData = loginSchema.parse(req.body);

      const result = await authService.login(validatedData);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Erro ao fazer login',
      });
    }
  }

  /**
   * POST /api/auth/registrar-cliente
   */
  async registrarCliente(req: AuthRequest, res: Response) {
    try {
      const { endereco, ...usuarioData } = req.body;

      // Validar dados
      usuarioSchema.parse({ ...usuarioData, tipoUsuario: 'CLIENTE' });
      enderecoSchema.parse(endereco);

      const result = await authService.registrarCliente({
        ...usuarioData,
        endereco,
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Cliente registrado com sucesso',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao registrar cliente',
      });
    }
  }

  /**
   * POST /api/auth/registrar-funcionario
   * Requer: GERENTE ou ADMINISTRADOR
   */
  async registrarFuncionario(req: AuthRequest, res: Response) {
    try {
      const { endereco, cargo, idAgencia, idSupervisor, ...usuarioData } = req.body;

      // Validar dados
      usuarioSchema.parse({ ...usuarioData, tipoUsuario: 'FUNCIONARIO' });
      enderecoSchema.parse(endereco);

      const result = await authService.registrarFuncionario({
        ...usuarioData,
        endereco,
        cargo,
        idAgencia,
        idSupervisor,
      });

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Funcionário registrado com sucesso',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao registrar funcionário',
      });
    }
  }

  /**
   * GET /api/auth/perfil
   * Requer: autenticação
   */
  async obterPerfil(req: AuthRequest, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const perfil = await authService.obterPerfil(req.usuario.id);

      return res.status(200).json({
        success: true,
        data: perfil,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao obter perfil',
      });
    }
  }

  /**
   * PUT /api/auth/alterar-senha
   * Requer: autenticação
   */
  async alterarSenha(req: AuthRequest, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          success: false,
          error: 'Senha atual e nova senha são obrigatórias',
        });
      }

      const result = await authService.alterarSenha(
        req.usuario.id,
        senhaAtual,
        novaSenha
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao alterar senha',
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: AuthRequest, res: Response) {
    // Com JWT stateless, o logout é feito no cliente removendo o token
    // Aqui podemos registrar o logout em log se necessário
    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  }
}

export default new AuthController();