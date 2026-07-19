import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_DYNAMODB_REGION || 'us-east-1';
const endpoint = process.env.AWS_DYNAMODB_ENDPOINT;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'mock-key';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret';

const client = new DynamoDBClient({
  region,
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
export const tableName = process.env.AWS_DYNAMODB_TABLE_NAME || 'lesson_progress';
