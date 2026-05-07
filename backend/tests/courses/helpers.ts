import "dotenv/config";
import type { FastifyInstance } from "fastify";

export const defaultCourse = {
  name: "Curso de TypeScript",
  description: "Aprendendo TypeScript do zero",
  startDate: "2025-06-01T00:00:00.000Z",
  endDate: "2025-07-01T00:00:00.000Z",
};

let counter = 0;

export function makeEmail() {
  return `courses.${++counter}@coursesphere.test`;
}

export async function createAuthenticatedUser(
  server: FastifyInstance,
  overrides?: { name?: string; email?: string; password?: string },
) {
  const payload = {
    name: overrides?.name ?? "Test User",
    email: overrides?.email ?? makeEmail(),
    password: overrides?.password ?? "Senha123",
  };

  const response = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload,
  });

  const body = response.json();
  return {
    user: body.user as { id: string; name: string; email: string },
    token: body.token as string,
  };
}

export async function createTestCourse(
  server: FastifyInstance,
  token: string,
  overrides?: Record<string, unknown>,
) {
  const response = await server.inject({
    method: "POST",
    url: "/api/courses",
    headers: { authorization: `Bearer ${token}` },
    payload: { ...defaultCourse, ...overrides },
  });

  return response.json() as {
    id: string;
    name: string;
    description: string | null;
    coverUrl: string | null;
    startDate: string;
    endDate: string;
    createdAt: string;
    creator: { id: string; name: string };
  };
}
