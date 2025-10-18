import { Router, Request, Response } from 'express';
const router = Router();
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Dashboard route - to be implemented' });
});
export default router;
