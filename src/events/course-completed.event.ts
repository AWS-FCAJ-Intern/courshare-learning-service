export interface CourseCompletedEvent {
  eventType: 'COURSE_COMPLETED';
  courseId: string;
  userId: string;
  completedAt: string;
}
