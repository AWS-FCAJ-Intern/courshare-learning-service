import { UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName } from '../config/dynamodb.config';
import { LessonProgressDto } from '../dtos/lesson-progress.dto';

export class ProgressRepository {
  async upsertProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    percentage: number,
    completed: boolean,
  ): Promise<void> {
    const pk = `USER#${userId}`;
    const sk = `COURSE#${courseId}#LESSON#${lessonId}`;
    const now = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        PK: pk,
        SK: sk,
      },
      UpdateExpression: 'SET #p = :p, #c = :c, #u = :u',
      ExpressionAttributeNames: {
        '#p': 'percentage',
        '#c': 'completed',
        '#u': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':p': percentage,
        ':c': completed,
        ':u': now,
      },
    });

    await docClient.send(command);
  }

  async getCourseProgress(userId: string, courseId: string): Promise<LessonProgressDto[]> {
    const pk = `USER#${userId}`;
    const skPrefix = `COURSE#${courseId}#`;

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk and begins_with(#sk, :skPrefix)',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK',
      },
      ExpressionAttributeValues: {
        ':pk': pk,
        ':skPrefix': skPrefix,
      },
    });

    const response = await docClient.send(command);
    const items = response.Items || [];

    return items.map((item) => {
      const sk = item.SK as string;
      const lessonId = this.extractLessonId(sk);
      return {
        lessonId,
        percentage: item.percentage ?? 0,
        completed: item.completed ?? false,
        updatedAt: item.updatedAt as string | undefined,
      };
    });
  }

  private extractLessonId(sk: string): string {
    const index = sk.indexOf('#LESSON#');
    if (index !== -1) {
      return sk.substring(index + 8);
    }
    return sk;
  }
}
