import { Router } from 'express';
import { LearningController } from '../controllers/learning.controller';
import { ProgressService } from '../services/progress.service';
import { ProgressRepository } from '../repositories/progress.repository';
import { MockCourseServiceClient } from '../services/course-service.client';

const router = Router();

const progressRepository = new ProgressRepository();
const courseServiceClient = new MockCourseServiceClient();
const progressService = new ProgressService(progressRepository, courseServiceClient);
const learningController = new LearningController(progressService);

router.get('/:courseId/continue', learningController.getContinueLesson);
router.get('/:courseId/last-watched', learningController.getLastWatchedLesson);

export default router;
