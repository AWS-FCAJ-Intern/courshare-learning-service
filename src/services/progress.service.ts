import { ProgressRepository } from '../repositories/progress.repository';
import { CourseServiceClient } from './course-service.client';
import { CourseProgressDto } from '../dtos/course-progress.dto';
import { LearningSessionDto } from '../dtos/learning-session.dto';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly courseServiceClient: CourseServiceClient,
  ) {}

  async upsertProgress(
    userId: string,
    lessonId: string,
    percentage: number,
    completed: boolean,
  ): Promise<void> {
    const courseId = await this.courseServiceClient.getCourseIdForLesson(lessonId);
    if (!courseId) {
      throw new NotFoundError(`Lesson metadata not found for lesson ID: ${lessonId}`);
    }

    await this.progressRepository.upsertProgress(userId, courseId, lessonId, percentage, completed);
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressDto> {
    const allLessonIds = await this.courseServiceClient.getLessonIdsForCourse(courseId);
    if (!allLessonIds || allLessonIds.length === 0) {
      throw new NotFoundError(`Course metadata not found or course has no lessons: ${courseId}`);
    }

    const dbProgressList = await this.progressRepository.getCourseProgress(userId, courseId);

    // Filter database progress to only include lessons belonging to the course
    const validProgressList = dbProgressList.filter((progress) =>
      allLessonIds.includes(progress.lessonId),
    );

    // Map recorded progress
    const progressMap = new Map<string, number>();
    validProgressList.forEach((p) => progressMap.set(p.lessonId, p.percentage));

    // Sum percentages over all lessons in the course (defaulting to 0 if not started)
    let sumPercentages = 0;
    allLessonIds.forEach((lessonId) => {
      sumPercentages += progressMap.get(lessonId) || 0;
    });

    // Compute overall progress percentage rounded to nearest integer
    const overallPercentage = Math.round(sumPercentages / allLessonIds.length);

    return {
      courseId,
      percentage: overallPercentage,
      lessons: validProgressList,
    };
  }

  async getContinueLesson(userId: string, courseId: string): Promise<LearningSessionDto> {
    const allLessonIds = await this.courseServiceClient.getLessonIdsForCourse(courseId);
    if (!allLessonIds || allLessonIds.length === 0) {
      throw new NotFoundError(`Course metadata not found or course has no lessons: ${courseId}`);
    }

    const dbProgressList = await this.progressRepository.getCourseProgress(userId, courseId);

    // Filter unfinished lessons
    const unfinishedLessons = dbProgressList.filter(
      (progress) =>
        allLessonIds.includes(progress.lessonId) &&
        progress.percentage > 0 &&
        progress.percentage < 100 &&
        !progress.completed,
    );

    if (unfinishedLessons.length === 0) {
      return { courseId, lessonId: null };
    }

    // Sort by updatedAt descending
    unfinishedLessons.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

    const target = unfinishedLessons[0];
    return {
      courseId,
      lessonId: target.lessonId,
      percentage: target.percentage,
      completed: target.completed,
      lastUpdated: target.updatedAt,
    };
  }

  async getLastWatchedLesson(userId: string, courseId: string): Promise<LearningSessionDto> {
    const allLessonIds = await this.courseServiceClient.getLessonIdsForCourse(courseId);
    if (!allLessonIds || allLessonIds.length === 0) {
      throw new NotFoundError(`Course metadata not found or course has no lessons: ${courseId}`);
    }

    const dbProgressList = await this.progressRepository.getCourseProgress(userId, courseId);

    // Filter to lessons belonging to the course
    const courseProgressList = dbProgressList.filter((progress) =>
      allLessonIds.includes(progress.lessonId),
    );

    if (courseProgressList.length === 0) {
      return { courseId, lessonId: null };
    }

    // Sort by updatedAt descending
    courseProgressList.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

    const target = courseProgressList[0];
    return {
      courseId,
      lessonId: target.lessonId,
      percentage: target.percentage,
      completed: target.completed,
      lastUpdated: target.updatedAt,
    };
  }
}
