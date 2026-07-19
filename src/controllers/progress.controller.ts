import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProgressService, NotFoundError, ConflictError } from '../services/progress.service';
import { ProgressUpsertDto } from '../dtos/progress-upsert.dto';

export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  upsertProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const dto = plainToInstance(ProgressUpsertDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        const details = errors.map((err) => Object.values(err.constraints || {})).flat();
        return res.status(400).json({ status: 400, error: 'Validation Failed', details });
      }

      await this.progressService.upsertProgress(
        userId,
        dto.lessonId,
        dto.percentage,
        dto.completed,
      );

      return res.status(200).json({ status: 'success', message: 'Progress recorded' });
    } catch (err) {
      this.handleError(err, res, next);
    }
  };

  getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const { courseId } = req.params;

      const progress = await this.progressService.getCourseProgress(userId, courseId);
      return res.status(200).json(progress);
    } catch (err) {
      this.handleError(err, res, next);
    }
  };

  completeLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const { lessonId } = req.params;
      if (!lessonId || lessonId.trim() === '') {
        const error = new Error('Required path parameter "lessonId" is missing or empty');
        (error as any).status = 400;
        (error as any).errorName = 'Invalid Lesson ID';
        throw error;
      }

      const result = await this.progressService.completeLesson(userId, lessonId);
      return res.status(200).json(result);
    } catch (err) {
      this.handleError(err, res, next);
    }
  };

  completeCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      this.validateUserId(userId);

      const { courseId } = req.params;
      if (!courseId || courseId.trim() === '') {
        const error = new Error('Required path parameter "courseId" is missing or empty');
        (error as any).status = 400;
        (error as any).errorName = 'Invalid Course ID';
        throw error;
      }

      const result = await this.progressService.completeCourse(userId, courseId);
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

  private handleError(err: any, res: Response, next: NextFunction) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        status: 404,
        error: 'Resource Not Found',
        details: [err.message],
      });
    }
    if (err instanceof ConflictError) {
      return res.status(409).json({
        message: err.message,
      });
    }
    if (err.status === 400) {
      return res.status(400).json({
        status: 400,
        error: err.errorName || 'Bad Request',
        details: [err.message],
      });
    }
    console.error('Unhandled Controller Error:', err);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      details: [err.message || 'An unexpected error occurred'],
    });
  }
}
