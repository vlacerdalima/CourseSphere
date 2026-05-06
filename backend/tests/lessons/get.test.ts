import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import {
  LESSON_KEYS,
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

describe("GET /api/courses/:courseId/lessons", () => {
  it("deve listar aulas do curso → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    await createTestLesson(app, token, course.id, { title: "Aula Um" });
    await createTestLesson(app, token, course.id, { title: "Aula Dois" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const lessons = response.json();
    expect(lessons).toHaveLength(2);
    expect(Object.keys(lessons[0]).sort()).toEqual(LESSON_KEYS);
    expect(lessons[0]).not.toHaveProperty("courseId");
    expect(lessons[0]).not.toHaveProperty("updatedAt");
    expect(lessons[0]).not.toHaveProperty("password");
  });

  it("deve retornar aulas ordenadas por createdAt asc", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const first = await createTestLesson(app, token, course.id, { title: "Primeira" });
    const second = await createTestLesson(app, token, course.id, { title: "Segunda" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const lessons = response.json();
    expect(lessons).toHaveLength(2);
    expect(lessons[0].id).toBe(first.id);
    expect(lessons[1].id).toBe(second.id);
    const dates = lessons.map((l: { createdAt: string }) => new Date(l.createdAt).getTime());
    expect(dates[0]).toBeLessThanOrEqual(dates[1]);
  });

  it("deve retornar array vazio para curso sem aulas → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("deve filtrar por ?status=draft → retorna só drafts", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    await createTestLesson(app, token, course.id, { title: "Rascunho", status: "draft" });
    await createTestLesson(app, token, course.id, { title: "Publicada", status: "published" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons?status=draft`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const lessons = response.json();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].status).toBe("draft");
    expect(lessons[0].title).toBe("Rascunho");
  });

  it("deve filtrar por ?status=published → retorna só publicadas", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    await createTestLesson(app, token, course.id, { title: "Rascunho", status: "draft" });
    await createTestLesson(app, token, course.id, { title: "Publicada", status: "published" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons?status=published`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const lessons = response.json();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].status).toBe("published");
    expect(lessons[0].title).toBe("Publicada");
  });

  it("deve retornar todas as aulas sem filtro de status → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    await createTestLesson(app, token, course.id, { title: "Rascunho", status: "draft" });
    await createTestLesson(app, token, course.id, { title: "Publicada", status: "published" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(2);
  });

  it("deve rejeitar ?status=invalid → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons?status=invalid`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Status inválido. Use 'draft' ou 'published'.");
  });

  it("deve permitir que qualquer usuário autenticado liste aulas → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);
    await createTestLesson(app, tokenA, course.id, { title: "Aula do Curso de A" });

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(response.statusCode).toBe(200);
    const lessons = response.json();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].title).toBe("Aula do Curso de A");
  });

  it("deve retornar 404 para courseId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Não autenticado.");
  });
});
