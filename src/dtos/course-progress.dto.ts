import { LessonProgressDto } from './lesson-progress.dto';

export interface CourseProgressDto {
  courseId: string;
  percentage: number;
  lessons: LessonProgressDto[];
}
