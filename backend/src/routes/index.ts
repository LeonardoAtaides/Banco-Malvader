import { Router } from 'express';

const router = Router();

// Healthcheck
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Banco Malvader API' 
  });
});

// Rotas básicas para teste
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Banco Malvader API funcionando!',
    version: '1.0.0'
  });
});

// TODO: Importar e configurar rotas quando estiverem prontas
/*
import authRoutes from './auth';
import usuariosRoutes from './usuarios';
// ... outras importações

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
// ... outras rotas
*/

export default router;