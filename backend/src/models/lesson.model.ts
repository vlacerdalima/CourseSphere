import type { LessonStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateLessonInput, UpdateLessonInput } from "../schemas/lesson.schema.js";

export type LessonResponse = {
  id: string;
  title: string;
  description: string | null;
  status: LessonStatus;
  videoUrl: string | null;
  createdAt: Date;
};

const lessonSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  videoUrl: true,
  createdAt: true,
} as const;

export async function createLesson(
  data: CreateLessonInput,
  courseId: string,
): Promise<LessonResponse> {
  return prisma.lesson.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      videoUrl: data.videoUrl,
      courseId,
    },
    select: lessonSelect,
  });
}

export async function findLessonsByCourse(
  courseId: string,
  status?: LessonStatus,
): Promise<LessonResponse[]> {
  return prisma.lesson.findMany({
    where: {
      courseId,
      ...(status ? { status } : {}),
    },
    select: lessonSelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function findLessonByIdAndCourseId(
  lessonId: string,
  courseId: string,
): Promise<LessonResponse | null> {
  return prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
    select: lessonSelect,
  });
}

export async function updateLesson(
  lessonId: string,
  data: UpdateLessonInput,
): Promise<LessonResponse> {
  const { title, description, status, videoUrl } = data;
  return prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(videoUrl !== undefined && { videoUrl }),
    },
    select: lessonSelect,
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await prisma.lesson.delete({ where: { id: lessonId } });
}
