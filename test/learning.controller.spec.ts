import request from 'supertest';
import express from 'express';
import { LearningController } from '../src/controllers/learning.controller';
import { ProgressService } from '../src/services/progress.service';

describe('LearningController Routes', () => {
  let app: express.Express;
  let service: jest.Mocked<ProgressService>;
  let controller: LearningController;

  beforeEach(() => {
    service = {
      getContinueLesson: jest.fn(),
      getLastWatchedLesson: jest.fn(),
    } as any;

    controller = new LearningController(service);

    app = express();
    app.use(express.json());

    // Map routes for testing
    app.get('/learning/:courseId/continue', controller.getContinueLesson);
    app.get('/learning/:courseId/last-watched', controller.getLastWatchedLesson);
  });

  describe('GET /learning/:courseId/continue', () => {
    it('should return continue lesson details when request is valid', async () => {
      const mockResult = {
        courseId: 'course-1',
        lessonId: 'lesson-b',
        percentage: 45,
        completed: false,
        lastUpdated: '2026-07-20T09:30:00Z',
      };
      service.getContinueLesson.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/learning/course-1/continue')
        .set('x-user-id', 'user-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(service.getContinueLesson).toHaveBeenCalledWith('user-123', 'course-1');
    });

    it('should return 400 Bad Request when header x-user-id is missing', async () => {
      const response = await request(app)
        .get('/learning/course-1/continue');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });
  });

  describe('GET /learning/:courseId/last-watched', () => {
    it('should return last watched details when request is valid', async () => {
      const mockResult = {
        courseId: 'course-1',
        lessonId: 'lesson-b',
        percentage: 40,
        completed: false,
        lastUpdated: '2026-07-20T09:30:00Z',
      };
      service.getLastWatchedLesson.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/learning/course-1/last-watched')
        .set('x-user-id', 'user-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(service.getLastWatchedLesson).toHaveBeenCalledWith('user-123', 'course-1');
    });

    it('should return 400 Bad Request when header x-user-id is missing', async () => {
      const response = await request(app)
        .get('/learning/course-1/last-watched');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });
  });
});
