import { Router } from 'express';
import progressRouter from './progress.routes';
import learningRouter from './learning.routes';
import lessonsRouter from './lessons.routes';
import coursesRouter from './courses.routes';

const router = Router();

router.use('/progress', progressRouter);
router.use('/learning', learningRouter);
router.use('/lessons', lessonsRouter);
router.use('/courses', coursesRouter);

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ service: 'learning-service', status: 'UP' });
});

export default router;
