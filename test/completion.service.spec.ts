import { ProgressService, NotFoundError, ConflictError } from '../src/services/progress.service';
import { ProgressRepository } from '../src/repositories/progress.repository';
import { CourseServiceClient } from '../src/services/course-service.client';
import { EventPublisher } from '../src/publishers/event.publisher';

describe('ProgressService Course & Lesson Completions', () => {
  let service: ProgressService;
  let repository: jest.Mocked<ProgressRepository>;
  let client: jest.Mocked<CourseServiceClient>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    repository = {
      upsertProgress: jest.fn(),
      getCourseProgress: jest.fn(),
      isCourseCompleted: jest.fn(),
      markCourseCompleted: jest.fn(),
    } as any;

    client = {
      getCourseIdForLesson: jest.fn(),
      getLessonIdsForCourse: jest.fn(),
    } as any;

    publisher = {
      publishCourseCompleted: jest.fn(),
    };

    service = new ProgressService(repository, client, publisher);
  });

  describe('completeLesson', () => {
    it('should complete lesson and check course status, publishing event if completed and not yet done', async () => {
      client.getCourseIdForLesson.mockResolvedValue('course-1');
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-1', 'lesson-2']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-1', percentage: 100, completed: true },
        { lessonId: 'lesson-2', percentage: 100, completed: true },
      ]);
      repository.isCourseCompleted.mockResolvedValue(false);

      const result = await service.completeLesson('user-1', 'lesson-2');

      expect(result).toEqual({ lessonId: 'lesson-2', completed: true, percentage: 100 });
      expect(repository.upsertProgress).toHaveBeenCalledWith('user-1', 'course-1', 'lesson-2', 100, true);
      expect(repository.isCourseCompleted).toHaveBeenCalledWith('user-1', 'course-1');
      expect(repository.markCourseCompleted).toHaveBeenCalledWith('user-1', 'course-1');
      expect(publisher.publishCourseCompleted).toHaveBeenCalled();
    });

    it('should complete lesson but bypass event publishing if course is not fully complete', async () => {
      client.getCourseIdForLesson.mockResolvedValue('course-1');
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-1', 'lesson-2']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-1', percentage: 50, completed: false },
        { lessonId: 'lesson-2', percentage: 100, completed: true },
      ]);

      await service.completeLesson('user-1', 'lesson-2');

      expect(repository.markCourseCompleted).not.toHaveBeenCalled();
      expect(publisher.publishCourseCompleted).not.toHaveBeenCalled();
    });
  });

  describe('completeCourse', () => {
    it('should successfully complete course and publish event when all lessons are 100%', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-1', 'lesson-2']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-1', percentage: 100, completed: true },
        { lessonId: 'lesson-2', percentage: 100, completed: true },
      ]);
      repository.isCourseCompleted.mockResolvedValue(false);

      const result = await service.completeCourse('user-1', 'course-1');

      expect(result).toEqual({ courseId: 'course-1', completed: true });
      expect(repository.markCourseCompleted).toHaveBeenCalledWith('user-1', 'course-1');
      expect(publisher.publishCourseCompleted).toHaveBeenCalled();
    });

    it('should throw ConflictError if course progress is not 100%', async () => {
      client.getLessonIdsForCourse.mockResolvedValue(['lesson-1', 'lesson-2']);
      repository.getCourseProgress.mockResolvedValue([
        { lessonId: 'lesson-1', percentage: 90, completed: false },
        { lessonId: 'lesson-2', percentage: 100, completed: true },
      ]);

      await expect(service.completeCourse('user-1', 'course-1')).rejects.toThrow(ConflictError);
      expect(repository.markCourseCompleted).not.toHaveBeenCalled();
    });
  });
});
