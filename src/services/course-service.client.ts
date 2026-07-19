export interface CourseServiceClient {
  getCourseIdForLesson(lessonId: string): Promise<string | null>;
  getLessonIdsForCourse(courseId: string): Promise<string[]>;
}

export class MockCourseServiceClient implements CourseServiceClient {
  private mockCourseLessons: Record<string, string[]> = {};

  constructor() {
    const rawMockConfig = process.env.MOCK_COURSE_LESSONS;
    if (rawMockConfig) {
      try {
        const cleaned = rawMockConfig.trim().replace(/^'|'$/g, '');
        this.mockCourseLessons = JSON.parse(cleaned);
      } catch (err) {
        console.error('Failed to parse MOCK_COURSE_LESSONS environment config:', err);
      }
    }
  }

  async getCourseIdForLesson(lessonId: string): Promise<string | null> {
    for (const [courseId, lessons] of Object.entries(this.mockCourseLessons)) {
      if (lessons.includes(lessonId)) {
        return courseId;
      }
    }
    return null;
  }

  async getLessonIdsForCourse(courseId: string): Promise<string[]> {
    return this.mockCourseLessons[courseId] || [];
  }
}
