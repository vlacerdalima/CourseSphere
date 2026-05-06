import { findCourseById } from "../models/course.model.js";

export type AuthorizationResult =
  | { ok: true }
  | { ok: false; status: 403 | 404; error: string };

export async function assertCourseOwnership(
  courseId: string,
  userId: string,
): Promise<AuthorizationResult> {
  const course = await findCourseById(courseId);

  if (!course) {
    return { ok: false, status: 404, error: "Curso não encontrado." };
  }

  if (course.creator.id !== userId) {
    return {
      ok: false,
      status: 403,
      error: "Você não tem permissão para gerenciar aulas deste curso.",
    };
  }

  return { ok: true };
}
