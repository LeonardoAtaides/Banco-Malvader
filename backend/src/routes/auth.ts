import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate, requireFuncionario, requireCargo } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.post('/login', authController.login.bind(authController));
router.post('/registrar-cliente', authController.registrarCliente.bind(authController));

// Rotas protegidas
router.get('/perfil', authenticate, authController.obterPerfil.bind(authController));
router.put('/alterar-senha', authenticate, authController.alterarSenha.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

// Rotas administrativas (apenas GERENTE ou ADMINISTRADOR)
router.post(
  '/registrar-funcionario',
  authenticate,
  requireFuncionario,
  requireCargo('GERENTE', 'ADMINISTRADOR'),
  authController.registrarFuncionario.bind(authController)
);

export default router;
