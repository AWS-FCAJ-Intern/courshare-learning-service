import { Request, Response, NextFunction } from 'express';
import { ProgressService, NotFoundError } from '../services/progress.service';

export class LearningController {
  constructor(private readonly progressService: ProgressService) {}

  getContinueLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const { courseId } = req.params;
      this.validateCourseId(courseId);

      const result = await this.progressService.getContinueLesson(userId, courseId);
      return res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, next);
    }
  };

  getLastWatchedLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const { courseId } = req.params;
      this.validateCourseId(courseId);

      const result = await this.progressService.getLastWatchedLesson(userId, courseId);
      return res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, next);
    }
  };

  private validateUserId(userId: string): void {
    if (!userId || userId.trim() === '') {
      const error = new Error('Required request header "x-user-id" is missing or empty');
      (error as any).status = 400;
      (error as any).errorName = 'Missing Required Header';
      throw error;
    }
  }

  private validateCourseId(courseId: string): void {
    if (!courseId || courseId.trim() === '') {
      const error = new Error('Required path parameter "courseId" is missing or empty');
      (error as any).status = 400;
      (error as any).errorName = 'Invalid Course ID';
      throw error;
    }
  }

  private handleError(err: any, res: Response, next: NextFunction) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        status: 404,
        error: 'Resource Not Found',
        details: [err.message],
      });
    }
    if (err.status === 400) {
      return res.status(400).json({
        status: 400,
        error: err.errorName || 'Bad Request',
        details: [err.message],
      });
    }
    console.error('Unhandled Learning Controller Error:', err);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      details: [err.message || 'An unexpected error occurred'],
    });
  }
}
