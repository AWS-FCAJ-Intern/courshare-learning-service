import { EventPublisher } from './event.publisher';
import { CourseCompletedEvent } from '../events/course-completed.event';

export class MockEventPublisher implements EventPublisher {
  async publishCourseCompleted(event: CourseCompletedEvent): Promise<void> {
    console.log('[EventBus] Published Event:', JSON.stringify(event, null, 2));
    // Pluggable integration point for RabbitMQ, Kafka, or Amazon SNS/SQS.
  }
}
