import "dotenv/config";
import type { FastifyInstance } from "fastify";

export { createAuthenticatedUser, createTestCourse } from "../courses/helpers";

export const LESSON_KEYS = ["createdAt", "description", "id", "status", "title", "videoUrl"];

export async function createTestLesson(
  app: FastifyInstance,
  token: string,
  courseId: string,
  overrides?: { title?: string; status?: "draft" | "published"; videoUrl?: string },
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/courses/${courseId}/lessons`,
    headers: { authorization: `Bearer ${token}` },
    payload: {
      title: overrides?.title ?? "Aula de Teste",
      ...(overrides?.status !== undefined ? { status: overrides.status } : {}),
      ...(overrides?.videoUrl !== undefined ? { videoUrl: overrides.videoUrl } : {}),
    },
  });

  return response.json() as {
    id: string;
    title: string;
    description: string | null;
    status: "draft" | "published";
    videoUrl: string | null;
    createdAt: string;
  };
}
