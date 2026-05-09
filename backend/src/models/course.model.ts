import type { LessonStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateCourseInput, UpdateCourseInput } from "../schemas/course.schema.js";

type CourseCreator = { id: string; name: string; avatarUrl: string | null };

export type CourseWithCreator = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  creator: CourseCreator;
  _count: { lessons: number };
};

type LessonSummary = {
  id: string;
  title: string;
  description: string | null;
  status: LessonStatus;
  videoUrl: string | null;
  createdAt: Date;
};

export type CourseFullDetails = CourseWithCreator & {
  lessons: LessonSummary[];
};

const courseSelect = {
  id: true,
  name: true,
  description: true,
  coverUrl: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  creator: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { lessons: true } },
} as const;

export async function createCourse(
  data: CreateCourseInput,
  creatorId: string,
): Promise<CourseWithCreator> {
  return prisma.course.create({
    data: {
      name: data.name,
      description: data.description,
      coverUrl: data.coverUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      creatorId,
    },
    select: courseSelect,
  });
}

export async function findCoursesByCreator(
  creatorId: string,
  search?: string,
): Promise<CourseWithCreator[]> {
  const trimmed = search?.trim();
  return prisma.course.findMany({
    where: {
      creatorId,
      ...(trimmed ? { name: { contains: trimmed, mode: "insensitive" } } : {}),
    },
    select: courseSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findCourseById(id: string): Promise<CourseFullDetails | null> {
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      coverUrl: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
      lessons: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          videoUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateCourse(
  id: string,
  data: UpdateCourseInput,
): Promise<CourseWithCreator> {
  const { name, description, coverUrl, startDate, endDate } = data;
  return prisma.course.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
    },
    select: courseSelect,
  });
}

export async function deleteCourse(id: string): Promise<void> {
  await prisma.course.delete({ where: { id } });
}

export async function findAllCourses(search?: string): Promise<CourseWithCreator[]> {
  const trimmed = search?.trim();
  return prisma.course.findMany({
    where: trimmed ? { name: { contains: trimmed, mode: "insensitive" } } : {},
    select: courseSelect,
    orderBy: { createdAt: "desc" },
  });
}
