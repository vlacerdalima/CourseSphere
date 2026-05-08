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
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  creator: { id: string; name: string };
  _count: { lessons: number };
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  videoUrl: string | null;
  createdAt: string;
}

export interface CreateCourseData {
  name: string;
  description?: string;
  coverUrl?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  coverUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  status?: "draft" | "published";
  videoUrl?: string;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  status?: "draft" | "published";
  videoUrl?: string;
}
