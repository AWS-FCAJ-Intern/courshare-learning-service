import { ProgressService, NotFoundError } from '../src/services/progress.service';
import { ProgressRepository } from '../src/repositories/progress.repository';
import { CourseServiceClient } from '../src/services/course-service.client';

describe('ProgressService Learning Sessions', () => {
  let service: ProgressService;
  let repository: jest.Mocked<ProgressRepository>;
  let client: jest.Mocked<CourseServiceClient>;

  beforeEach(() => {
    repository = {
      getCourseProgress: jest.fn(),
    } as any;

    client = {
      getLessonIdsForCourse: jest.fn(),
    } as any;

    service = new ProgressService(repository, client);
  });

  describe('getContinueLesson', () => {
    it('should return the correct lesson to continue based on percentage and activity date', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-a', 'lesson-b', 'lesson-c']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-a', percentage: 100, completed: true, updatedAt: '2026-07-19T00:00:00Z' },
        { lessonId: 'lesson-b', percentage: 45, completed: false, updatedAt: '2026-07-20T09:30:00Z' },
        { lessonId: 'lesson-c', percentage: 20, completed: false, updatedAt: '2026-07-18T00:00:00Z' },
      ]);

      const result = await service.getContinueLesson('user-1', 'course-1');

      expect(result).toEqual({
        courseId: 'course-1',
        lessonId: 'lesson-b',
        percentage: 45,
        completed: false,
        lastUpdated: '2026-07-20T09:30:00Z',
      });
    });

    it('should return lessonId: null when there are no unfinished lessons', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-a']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-a', percentage: 100, completed: true, updatedAt: '2026-07-19T00:00:00Z' },
      ]);

      const result = await service.getContinueLesson('user-1', 'course-1');

      expect(result).toEqual({
        courseId: 'course-1',
        lessonId: null,
      });
    });

    it('should throw NotFoundError when course has no lessons', async () => {
      client.getLessonIdsForCourse.mockResolvedValue([]);

      await expect(service.getContinueLesson('user-1', 'course-1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getLastWatchedLesson', () => {
    it('should return the last watched lesson regardless of completion status', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-a', 'lesson-b', 'lesson-c']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-a', percentage: 100, completed: true, updatedAt: '2026-07-19T00:00:00Z' },
        { lessonId: 'lesson-b', percentage: 40, completed: false, updatedAt: '2026-07-20T09:30:00Z' },
        { lessonId: 'lesson-c', percentage: 0, completed: false, updatedAt: '2026-07-15T00:00:00Z' },
      ]);

      const result = await service.getLastWatchedLesson('user-1', 'course-1');

      expect(result).toEqual({
        courseId: 'course-1',
        lessonId: 'lesson-b',
        percentage: 40,
        completed: false,
        lastUpdated: '2026-07-20T09:30:00Z',
      });
    });

    it('should return lessonId: null when user has never watched any lesson', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-a']);
      repository.getCourseProgress.mockResolvedValue([]);

      const result = await service.getLastWatchedLesson('user-1', 'course-1');

      expect(result).toEqual({
        courseId: 'course-1',
        lessonId: null,
      });
    });
  });
});
