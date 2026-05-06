import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createCourse,
  deleteCourse,
  findCourseById,
  findCoursesByCreator,
  updateCourse,
} from "../models/course.model.js";
import {
  createCourseSchema,
  listCoursesQuerySchema,
  updateCourseSchema,
} from "../schemas/course.schema.js";

const VALIDATION_ERROR = "Dados inválidos. Verifique os campos informados.";
const NOT_FOUND_ERROR = "Curso não encontrado.";
const FORBIDDEN_EDIT = "Você não tem permissão para editar este curso.";
const FORBIDDEN_DELETE = "Você não tem permissão para deletar este curso.";

export async function indexController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = listCoursesQuerySchema.safeParse(request.query);
  if (!result.success) {
    return reply.status(400).send({ error: VALIDATION_ERROR });
  }

  const creatorId = request.user.id;
  const { search } = result.data;

  const courses = await findCoursesByCreator(creatorId, search);
  return reply.status(200).send(courses);
}

export async function showController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };

  const course = await findCourseById(id);
  if (!course) {
    return reply.status(404).send({ error: NOT_FOUND_ERROR });
  }

  return reply.status(200).send(course);
}

export async function createController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = createCourseSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: VALIDATION_ERROR });
  }

  const creatorId = request.user.id;
  const course = await createCourse(result.data, creatorId);

  return reply.status(201).send(course);
}

export async function updateController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };

  const result = updateCourseSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: VALIDATION_ERROR });
  }

  const course = await findCourseById(id);
  if (!course) {
    return reply.status(404).send({ error: NOT_FOUND_ERROR });
  }

  if (course.creator.id !== request.user.id) {
    return reply.status(403).send({ error: FORBIDDEN_EDIT });
  }

  const updated = await updateCourse(id, result.data);
  return reply.status(200).send(updated);
}

export async function deleteController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };

  const course = await findCourseById(id);
  if (!course) {
    return reply.status(404).send({ error: NOT_FOUND_ERROR });
  }

  if (course.creator.id !== request.user.id) {
    return reply.status(403).send({ error: FORBIDDEN_DELETE });
  }

  await deleteCourse(id);
  return reply.status(204).send();
}
