import { Request, Response } from 'express';
import usuariosService from '../services/usuariosService';

class UsuariosController {
  async list(req: Request, res: Response) {
    try {
      const usuarios = await usuariosService.getAll();
      res.status(200).json({ success: true, data: usuarios });
    } catch (err: any) {
      console.error('Erro list usuários:', err);
      res.status(500).json({ success: false, error: err.message || 'Erro ao listar usuários' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuariosService.getById(id);
      if (!usuario) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      res.status(200).json({ success: true, data: usuario });
    } catch (err: any) {
      console.error('Erro get usuário:', err);
      res.status(500).json({ success: false, error: err.message || 'Erro ao obter usuário' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      // Aqui você pode validar com zod/yup antes de criar
      const payload = req.body;
      const newUser = await usuariosService.create(payload);
      res.status(201).json({ success: true, data: newUser });
    } catch (err: any) {
      console.error('Erro create usuário:', err);
      res.status(400).json({ success: false, error: err.message || 'Erro ao criar usuário' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body;
      const updated = await usuariosService.update(id, payload);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      console.error('Erro update usuário:', err);
      res.status(400).json({ success: false, error: err.message || 'Erro ao atualizar usuário' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await usuariosService.remove(id);
      res.status(200).json({ success: true, data: null });
    } catch (err: any) {
      console.error('Erro delete usuário:', err);
      res.status(400).json({ success: false, error: err.message || 'Erro ao deletar usuário' });
    }
  }
}

export default new UsuariosController();