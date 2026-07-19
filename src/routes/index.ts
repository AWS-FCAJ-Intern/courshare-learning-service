import { Router } from 'express';
import progressRouter from './progress.routes';
import learningRouter from './learning.routes';

const router = Router();

router.use('/progress', progressRouter);
router.use('/learning', learningRouter);

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ service: 'learning-service', status: 'UP' });
});

export default router;
