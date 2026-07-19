export interface LessonProgressDto {
  lessonId: string;
  percentage: number;
  completed: boolean;
  updatedAt?: string;
}
