import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import router from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 8085;

app.use(cors());
app.use(express.json());

// OpenAPI Specification Object
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Progress Tracking Service',
    description: 'APIs for tracking student progress in courses and lessons',
    version: '1.0.0',
  },
  paths: {
    '/progress': {
      post: {
        summary: 'Create or update lesson progress (Upsert)',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lessonId: { type: 'string', example: 'lesson-1' },
                  percentage: { type: 'integer', minimum: 0, maximum: 100, example: 65 },
                  completed: { type: 'boolean', example: false },
                },
                required: ['lessonId', 'percentage', 'completed'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Progress successfully recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Progress recorded' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid payload or missing user header' },
          404: { description: 'Lesson metadata not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/progress/{courseId}': {
      get: {
        summary: 'Get overall and detailed course progress',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the course',
          },
        ],
        responses: {
          200: {
            description: 'Successfully retrieved course progress',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string', example: 'course-1' },
                    percentage: { type: 'integer', example: 43 },
                    lessons: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          lessonId: { type: 'string', example: 'lesson-1' },
                          percentage: { type: 'integer', example: 100 },
                          completed: { type: 'boolean', example: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Missing user header' },
          404: { description: 'Course metadata not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/learning/{courseId}/continue': {
      get: {
        summary: 'Get the lesson to continue learning',
        description: 'Returns the lesson in the course with active progress > 0 and < 100, having the latest activity.',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the course',
          },
        ],
        responses: {
          200: {
            description: 'Successfully resolved continue lesson',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string', example: 'course-1' },
                    lessonId: { type: 'string', nullable: true, example: 'lesson-b' },
                    percentage: { type: 'integer', example: 45 },
                    completed: { type: 'boolean', example: false },
                    lastUpdated: { type: 'string', example: '2026-07-20T09:30:00Z' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing user header or parameter' },
          404: { description: 'Course metadata not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/learning/{courseId}/last-watched': {
      get: {
        summary: 'Get the last watched lesson',
        description: 'Returns the lesson in the course with the latest activity timestamp regardless of completion status.',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the course',
          },
        ],
        responses: {
          200: {
            description: 'Successfully resolved last watched lesson',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string', example: 'course-1' },
                    lessonId: { type: 'string', nullable: true, example: 'lesson-b' },
                    percentage: { type: 'integer', example: 40 },
                    completed: { type: 'boolean', example: false },
                    lastUpdated: { type: 'string', example: '2026-07-20T09:30:00Z' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing user header or parameter' },
          404: { description: 'Course metadata not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/lessons/{lessonId}/complete': {
      post: {
        summary: 'Mark a lesson as completed',
        description: 'Marks a lesson as 100% completed. This is an idempotent operation.',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the lesson to complete',
          },
        ],
        responses: {
          200: {
            description: 'Lesson successfully marked completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    lessonId: { type: 'string', example: 'lesson-1' },
                    completed: { type: 'boolean', example: true },
                    percentage: { type: 'integer', example: 100 },
                  },
                },
              },
            },
          },
          400: { description: 'Missing user header or path parameter' },
          404: { description: 'Lesson metadata not found' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/courses/{courseId}/complete': {
      post: {
        summary: 'Verify and record course completion',
        description: 'Verifies if course progress is 100%. Marks the course completed and publishes CourseCompletedEvent. Idempotent.',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Authenticated User ID injected by API Gateway',
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the course to complete',
          },
        ],
        responses: {
          200: {
            description: 'Course successfully completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string', example: 'course-1' },
                    completed: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          400: { description: 'Missing user header' },
          404: { description: 'Course metadata not found' },
          409: {
            description: 'Course is not yet completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Course is not yet completed.' },
                  },
                },
              },
            },
          },
          500: { description: 'Internal server error' },
        },
      },
    },
  },
};

// Swagger UI Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routing
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api-docs`);
});

export default app;
