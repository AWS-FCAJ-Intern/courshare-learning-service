import { CourseCompletedEvent } from '../events/course-completed.event';

export interface EventPublisher {
  publishCourseCompleted(event: CourseCompletedEvent): Promise<void>;
}
