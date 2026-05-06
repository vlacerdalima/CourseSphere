import type { FastifyReply, FastifyRequest } from "fastify";
import { assertCourseOwnership } from "../lib/authorization.js";
import { findCourseById } from "../models/course.model.js";
import {
  createLesson,
  deleteLesson,
  findLessonByIdAndCourseId,
  findLessonsByCourse,
  updateLesson,
} from "../models/lesson.model.js";
import {
  createLessonSchema,
  listLessonsQuerySchema,
  updateLessonSchema,
} from "../schemas/lesson.schema.js";
import type { LessonStatus } from "@prisma/client";

const VALIDATION_ERROR = "Dados inválidos. Verifique os campos informados.";
const LESSON_NOT_FOUND = "Aula não encontrada.";
const INVALID_STATUS_FILTER = "Status inválido. Use 'draft' ou 'published'.";
const COURSE_NOT_FOUND = "Curso não encontrado.";

export async function indexController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { courseId } = request.params as { courseId: string };

  const queryResult = listLessonsQuerySchema.safeParse(request.query);
  if (!queryResult.success) {
    return reply.status(400).send({ error: INVALID_STATUS_FILTER });
  }

  const course = await findCourseById(courseId);
  if (!course) {
    return reply.status(404).send({ error: COURSE_NOT_FOUND });
  }

  const { status } = queryResult.data;
  const lessons = await findLessonsByCourse(courseId, status as LessonStatus | undefined);
  return reply.status(200).send(lessons);
}

export async function createController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { courseId } = request.params as { courseId: string };

  const bodyResult = createLessonSchema.safeParse(request.body);
  if (!bodyResult.success) {
    return reply.status(400).send({ error: VALIDATION_ERROR });
  }

  const authResult = await assertCourseOwnership(courseId, request.user!.id);
  if (!authResult.ok) {
    return reply.status(authResult.status).send({ error: authResult.error });
  }

  const lesson = await createLesson(bodyResult.data, courseId);
  return reply.status(201).send(lesson);
}

export async function updateController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { courseId, id } = request.params as { courseId: string; id: string };

  const bodyResult = updateLessonSchema.safeParse(request.body);
  if (!bodyResult.success) {
    return reply.status(400).send({ error: VALIDATION_ERROR });
  }

  const authResult = await assertCourseOwnership(courseId, request.user!.id);
  if (!authResult.ok) {
    return reply.status(authResult.status).send({ error: authResult.error });
  }

  const lesson = await findLessonByIdAndCourseId(id, courseId);
  if (!lesson) {
    return reply.status(404).send({ error: LESSON_NOT_FOUND });
  }

  const updated = await updateLesson(id, bodyResult.data);
  return reply.status(200).send(updated);
}

export async function deleteController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { courseId, id } = request.params as { courseId: string; id: string };

  const authResult = await assertCourseOwnership(courseId, request.user!.id);
  if (!authResult.ok) {
    return reply.status(authResult.status).send({ error: authResult.error });
  }

  const lesson = await findLessonByIdAndCourseId(id, courseId);
  if (!lesson) {
    return reply.status(404).send({ error: LESSON_NOT_FOUND });
  }

  await deleteLesson(id);
  return reply.status(204).send();
}
