import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { JWTPayload, AuthenticatedRequest } from '@/types/banco';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token) as JWTPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido ou não fornecido'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.tipo_usuario)) {
      res.status(403).json({
        error: 'Acesso negado'
      });
      return;
    }

    next();
  };
};

export const requireCargo = (cargos: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado'
      });
      return;
    }

    if (req.user.tipo_usuario !== 'FUNCIONARIO' || !req.user.cargo || !cargos.includes(req.user.cargo)) {
      res.status(403).json({
        error: 'Cargo insuficiente para esta operação'
      });
      return;
    }

    next();
  };
};
