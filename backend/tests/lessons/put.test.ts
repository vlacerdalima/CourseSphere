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

describe("PUT /api/courses/:courseId/lessons/:id", () => {
  it("deve atualizar aula sendo criador do curso → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id, { title: "Titulo Original" });

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Titulo Atualizado" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.id).toBe(lesson.id);
    expect(body.title).toBe("Titulo Atualizado");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
    expect(body).not.toHaveProperty("courseId");
    expect(body).not.toHaveProperty("updatedAt");
    expect(body).not.toHaveProperty("password");
  });

  it("deve atualizar apenas o título, mantendo outros campos inalterados → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id, {
      title: "Aula Original",
      status: "published",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
    });

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Titulo Novo" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.title).toBe("Titulo Novo");
    expect(body.status).toBe("published");
    expect(body.videoUrl).toBe("https://www.youtube.com/watch?v=abc123");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve atualizar status de draft para published → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id, { title: "Aula Rascunho" });

    expect(lesson.status).toBe("draft");

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { status: "published" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("published");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve ignorar courseId enviado no body → 200, aula permanece no curso original", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id, { title: "Aula Original" });

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Titulo Novo", courseId: "00000000-0000-0000-0000-000000000000" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Titulo Novo");

    const listResponse = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
    });
    const lessons = listResponse.json() as Array<{ id: string }>;
    expect(lessons.some((l) => l.id === lesson.id)).toBe(true);
  });

  it("deve rejeitar body vazio → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar videoUrl fora da whitelist → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);
    const lesson = await createTestLesson(app, token, course.id);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { videoUrl: "https://example.com/video" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar atualização por não-criador do curso → 403", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);
    const lesson = await createTestLesson(app, tokenA, course.id);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/${lesson.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: { title: "Titulo Invasor" },
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
      method: "PUT",
      url: `/api/courses/${courseB.id}/lessons/${lessonInA.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Tentativa Cruzada" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Aula não encontrada.");
  });

  it("deve retornar 404 para lessonId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}/lessons/00000000-0000-0000-0000-000000000000`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Fantasma" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Aula não encontrada.");
  });

  it("deve retornar 404 para courseId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "PUT",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons/00000000-0000-0000-0000-000000000001",
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Fantasma" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons/00000000-0000-0000-0000-000000000001",
      payload: { title: "Aula Sem Token" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Não autenticado.");
  });
});
