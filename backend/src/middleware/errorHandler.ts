import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ErrorWithStatus extends Error {
  status?: number;
  sqlMessage?: string;
}

const errorHandler = (error: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  console.error(' Erro capturado:', error);

  // Erro de validação Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: error.errors.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message
      }))
    });
    return;
  }

  // Erro de SQL
  if (error.sqlMessage) {
    // Não expor detalhes do SQL em produção
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    } else {
      res.status(400).json({
        error: 'Erro no banco de dados',
        details: error.sqlMessage
      });
    }
    return;
  }

  // Erro personalizado com status
  if (error.status) {
    res.status(error.status).json({
      error: error.message || 'Erro na requisição'
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor'
      : error.message || 'Erro desconhecido'
  });
};

export default errorHandler;
