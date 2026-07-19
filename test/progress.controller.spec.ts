import request from 'supertest';
import express from 'express';
import { ProgressController } from '../src/controllers/progress.controller';
import { ProgressService } from '../src/services/progress.service';

describe('ProgressController Routes', () => {
  let app: express.Express;
  let service: jest.Mocked<ProgressService>;
  let controller: ProgressController;

  beforeEach(() => {
    service = {
      upsertProgress: jest.fn(),
      getCourseProgress: jest.fn(),
    } as any;

    controller = new ProgressController(service);

    app = express();
    app.use(express.json());

    // Setup routes for testing
    app.post('/progress', controller.upsertProgress);
    app.get('/progress/:courseId', controller.getCourseProgress);
  });

  describe('POST /progress', () => {
    it('should successfully record progress when valid', async () => {
      const payload = { lessonId: 'lesson-1', percentage: 65, completed: false };
      service.upsertProgress.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/progress')
        .set('x-user-id', 'user-123')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'success', message: 'Progress recorded' });
      expect(service.upsertProgress).toHaveBeenCalledWith('user-123', 'lesson-1', 65, false);
    });

    it('should return 400 Bad Request when x-user-id is missing', async () => {
      const payload = { lessonId: 'lesson-1', percentage: 65, completed: false };

      const response = await request(app)
        .post('/progress')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });

    it('should return 400 Bad Request when percentage is invalid', async () => {
      const payload = { lessonId: 'lesson-1', percentage: 150, completed: false };

      const response = await request(app)
        .post('/progress')
        .set('x-user-id', 'user-123')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Failed');
    });
  });

  describe('GET /progress/:courseId', () => {
    it('should return course progress details when valid', async () => {
      const mockResult = {
        courseId: 'course-1',
        percentage: 43,
        lessons: [{ lessonId: 'lesson-1', percentage: 100, completed: true }],
      };
      service.getCourseProgress.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/progress/course-1')
        .set('x-user-id', 'user-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(service.getCourseProgress).toHaveBeenCalledWith('user-123', 'course-1');
    });

    it('should return 400 Bad Request when x-user-id is missing', async () => {
      const response = await request(app)
        .get('/progress/course-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });
  });
});
