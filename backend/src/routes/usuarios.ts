import { Router } from 'express';
import usuariosController from '../controllers/usuariosController';
import { authenticate } from '../middleware/auth'; // se quiser proteger as rotas

const router = Router();

// Rota pública de listagem (ou proteja com authenticate)
router.get('/', authenticate, usuariosController.list.bind(usuariosController));
router.get('/:id', authenticate, usuariosController.getById.bind(usuariosController));

// Criação pode ser pública (registro) ou protegida — ajuste conforme necessidade
router.post('/', authenticate, usuariosController.create.bind(usuariosController));
router.put('/:id', authenticate, usuariosController.update.bind(usuariosController));
router.delete('/:id', authenticate, usuariosController.remove.bind(usuariosController));

export default router;