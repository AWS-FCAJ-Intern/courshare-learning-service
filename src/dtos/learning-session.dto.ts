export interface LearningSessionDto {
  courseId: string;
  lessonId: string | null;
  percentage?: number;
  completed?: boolean;
  lastUpdated?: string;
}
