import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { ProgressService } from '../services/progress.service';
import { ProgressRepository } from '../repositories/progress.repository';
import { MockCourseServiceClient } from '../services/course-service.client';

const router = Router();

const progressRepository = new ProgressRepository();
const courseServiceClient = new MockCourseServiceClient();
const progressService = new ProgressService(progressRepository, courseServiceClient);
const progressController = new ProgressController(progressService);

router.post('/:courseId/complete', progressController.completeCourse);

export default router;
