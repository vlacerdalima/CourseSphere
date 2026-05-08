import api from "./api";
import type { Course, CourseWithLessons, CreateCourseData, UpdateCourseData } from "@/types";

export async function getCourses(search?: string): Promise<Course[]> {
  const params = search ? { search } : {};
  const { data } = await api.get<Course[]>("/courses", { params });
  return data;
}

export async function getCourseById(id: string): Promise<CourseWithLessons> {
  const { data } = await api.get<CourseWithLessons>(`/courses/${id}`);
  return data;
}

export async function createCourse(courseData: CreateCourseData): Promise<Course> {
  const { data } = await api.post<Course>("/courses", courseData);
  return data;
}

export async function updateCourse(id: string, courseData: UpdateCourseData): Promise<Course> {
  const { data } = await api.put<Course>(`/courses/${id}`, courseData);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function getAllCourses(search?: string): Promise<Course[]> {
  const params = search ? { search } : {};
  const { data } = await api.get<Course[]>("/courses/explore", { params });
  return data;
}
