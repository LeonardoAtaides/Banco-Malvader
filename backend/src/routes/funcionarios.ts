import { Router, Request, Response } from 'express';
const router = Router();
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Funcionarios route - to be implemented' });
});
export default router;
