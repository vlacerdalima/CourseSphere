export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  creator: { id: string; name: string };
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  status: "draft" | "published";
  videoUrl: string | null;
  createdAt: string;
}

export interface CreateCourseData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateLessonData {
  title: string;
  status?: "draft" | "published";
  videoUrl?: string;
}

export interface UpdateLessonData {
  title?: string;
  status?: "draft" | "published";
  videoUrl?: string;
}
