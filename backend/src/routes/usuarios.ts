import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder routes - to be implemented
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Usuarios route - to be implemented' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Usuario ${req.params.id} - to be implemented` });
});

export default router;
