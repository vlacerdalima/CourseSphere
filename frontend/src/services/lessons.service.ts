import api from "./api";
import type { Lesson, CreateLessonData, UpdateLessonData } from "@/types";

export async function getLessons(courseId: string, status?: "draft" | "published"): Promise<Lesson[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<Lesson[]>(`/courses/${courseId}/lessons`, { params });
  return data;
}

export async function createLesson(courseId: string, lessonData: CreateLessonData): Promise<Lesson> {
  const { data } = await api.post<Lesson>(`/courses/${courseId}/lessons`, lessonData);
  return data;
}

export async function updateLesson(courseId: string, lessonId: string, lessonData: UpdateLessonData): Promise<Lesson> {
  const { data } = await api.put<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, lessonData);
  return data;
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
}
