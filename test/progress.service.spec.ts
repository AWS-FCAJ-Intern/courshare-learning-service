import { ProgressService, NotFoundError } from '../src/services/progress.service';
import { ProgressRepository } from '../src/repositories/progress.repository';
import { CourseServiceClient } from '../src/services/course-service.client';

describe('ProgressService', () => {
  let service: ProgressService;
  let repository: jest.Mocked<ProgressRepository>;
  let client: jest.Mocked<CourseServiceClient>;

  beforeEach(() => {
    repository = {
      upsertProgress: jest.fn(),
      getCourseProgress: jest.fn(),
    } as any;

    client = {
      getCourseIdForLesson: jest.fn(),
      getLessonIdsForCourse: jest.fn(),
    } as any;

    service = new ProgressService(repository, client);
  });

  describe('upsertProgress', () => {
    it('should upsert progress successfully when course is resolved', async () => {
      client.getCourseIdForLesson.mockResolvedValue('course-1');

      await service.upsertProgress('user-1', 'lesson-1', 65, false);

      expect(client.getCourseIdForLesson).toHaveBeenCalledWith('lesson-1');
      expect(repository.upsertProgress).toHaveBeenCalledWith('user-1', 'course-1', 'lesson-1', 65, false);
    });

    it('should throw NotFoundError when course is not resolved', async () => {
      client.getCourseIdForLesson.mockResolvedValue(null);

      await expect(service.upsertProgress('user-1', 'lesson-1', 65, false)).rejects.toThrow(
        NotFoundError,
      );

      expect(repository.upsertProgress).not.toHaveBeenCalled();
    });
  });

  describe('getCourseProgress', () => {
    it('should calculate dynamic overall course progress percentage correctly', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-1', 'lesson-2', 'lesson-3']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-1', percentage: 100, completed: true },
        { lessonId: 'lesson-2', percentage: 30, completed: false },
      ]);

      const result = await service.getCourseProgress('user-1', 'course-1');

      expect(result.courseId).toBe('course-1');
      expect(result.percentage).toBe(43); // (100 + 30 + 0) / 3 = 43.33 -> 43
      expect(result.lessons).toHaveLength(2);
    });

    it('should throw NotFoundError when course has no lessons', async () => {
      client.getLessonIdsForCourse.mockResolvedValue([]);

      await expect(service.getCourseProgress('user-1', 'course-1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
