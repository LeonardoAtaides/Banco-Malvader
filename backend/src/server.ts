import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas
import authRoutes from '@/routes/auth';
import usuariosRoutes from '@/routes/usuarios';
import contasRoutes from '@/routes/contas';
import transacoesRoutes from '@/routes/transacoes';
import agenciasRoutes from '@/routes/agencias';
import funcionariosRoutes from '@/routes/funcionarios';
import clientesRoutes from '@/routes/clientes';
import relatoriosRoutes from '@/routes/relatorios';
import dashboardRoutes from '@/routes/dashboard';

// Middleware de erro
import errorHandler from '@/middleware/errorHandler';

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requests por windowMs
  message: {
    error: 'Muitas requisições desta origem, tente novamente mais tarde.'
  }
});

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para logs básicos
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/contas', contasRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/agencias', agenciasRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor do Banco Malvader rodando na porta ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

export default app;
