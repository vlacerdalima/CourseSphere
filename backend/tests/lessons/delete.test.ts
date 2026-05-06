import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import {
  createAuthenticatedUser,
  createTestCourse,
  createTestLesson,
} from "./helpers";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@coursesphere.test" } } });
  await app.close();
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@coursesphere.test" } } });
});

describe("DELETE /api/courses/:courseId/lessons/:id", () => {
  it("deve deletar aula sendo criador → 204, GET subsequente não lista mais a aula", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id, { title: "Aula a Deletar" });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(deleteResponse.statusCode).toBe(204);

    const listResponse = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(listResponse.statusCode).toBe(200);
    const lessons = listResponse.json() as Array<{ id: string }>;
    expect(lessons.some((l) => l.id === lesson.id)).toBe(false);
  });

  it("deve rejeitar deleção por não-criador do curso → 403", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);
    const lesson = await createTestLesson(app, tokenA, course.id);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe(
      "Você não tem permissão para gerenciar aulas deste curso.",
    );
  });

  it("deve retornar 404 quando aula pertence a outro curso", async () => {
    const { token } = await createAuthenticatedUser(app);
    const courseA = await createTestCourse(app, token, { name: "Curso A" });
    const courseB = await createTestCourse(app, token, { name: "Curso B" });
    const lessonInA = await createTestLesson(app, token, courseA.id, { title: "Aula do Curso A" });

    const response = await app.inject({
      method: "DELETE",
      url: `/api/courses/${courseB.id}/lessons/${lessonInA.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Aula não encontrada.");
  });

  it("deve retornar 404 para lessonId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}/lessons/00000000-0000-0000-0000-000000000000`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Aula não encontrada.");
  });

  it("deve retornar 404 para courseId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "DELETE",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons/00000000-0000-0000-0000-000000000001",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons/00000000-0000-0000-0000-000000000001",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Não autenticado.");
  });
});
