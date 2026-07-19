import request from 'supertest';
import express from 'express';
import { ProgressController } from '../src/controllers/progress.controller';
import { ProgressService } from '../src/services/progress.service';

describe('ProgressController Completion Routes', () => {
  let app: express.Express;
  let service: jest.Mocked<ProgressService>;
  let controller: ProgressController;

  beforeEach(() => {
    service = {
      completeLesson: jest.fn(),
      completeCourse: jest.fn(),
    } as any;

    controller = new ProgressController(service);

    app = express();
    app.use(express.json());

    // Map completion routes
    app.post('/lessons/:lessonId/complete', controller.completeLesson);
    app.post('/courses/:courseId/complete', controller.completeCourse);
  });

  describe('POST /lessons/:lessonId/complete', () => {
    it('should return completed lesson object when valid', async () => {
      const mockResult = { lessonId: 'lesson-1', completed: true, percentage: 100 };
      service.completeLesson.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/lessons/lesson-1/complete')
        .set('x-user-id', 'user-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(service.completeLesson).toHaveBeenCalledWith('user-123', 'lesson-1');
    });

    it('should return 400 Bad Request when header x-user-id is missing', async () => {
      const response = await request(app)
        .post('/lessons/lesson-1/complete');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });
  });

  describe('POST /courses/:courseId/complete', () => {
    it('should return course completion object when valid', async () => {
      const mockResult = { courseId: 'course-1', completed: true };
      service.completeCourse.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/courses/course-1/complete')
        .set('x-user-id', 'user-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(service.completeCourse).toHaveBeenCalledWith('user-123', 'course-1');
    });

    it('should return 400 Bad Request when header x-user-id is missing', async () => {
      const response = await request(app)
        .post('/courses/course-1/complete');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing Required Header');
    });
  });
});
