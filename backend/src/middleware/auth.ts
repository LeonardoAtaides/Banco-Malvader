import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    cpf: string;
    tipoUsuario: 'FUNCIONARIO' | 'CLIENTE';
    cargo?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded = verifyToken(token);

    // Verificar se o usuário ainda existe
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: decoded.id }, 
      include: {
        funcionario: true,
        cliente: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.usuario = {
      id: usuario.idUsuario, 
      cpf: usuario.cpf,
      tipoUsuario: usuario.tipoUsuario,
      cargo: usuario.funcionario?.cargo,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Não autorizado' });
  }
};

// Middleware para verificar se é funcionário
export const requireFuncionario = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.usuario?.tipoUsuario !== 'FUNCIONARIO') {
    return res.status(403).json({ error: 'Acesso restrito a funcionários' });
  }
  next();
};

// Middleware para verificar cargo específico
export const requireCargo = (...cargos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.usuario?.cargo || !cargos.includes(req.usuario.cargo)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    next();
  };
};

// Middleware para verificar se é cliente
export const requireCliente = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.usuario?.tipoUsuario !== 'CLIENTE') {
    return res.status(403).json({ error: 'Acesso restrito a clientes' });
  }
  next();
};
