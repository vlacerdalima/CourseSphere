import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import {
  LESSON_KEYS,
  createAuthenticatedUser,
  createTestCourse,
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

describe("POST /api/courses/:courseId/lessons", () => {
  it("deve criar aula com dados válidos → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula 1" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe("Aula 1");
    expect(body.status).toBe("draft");
    expect(body.videoUrl).toBeNull();
    expect(new Date(body.createdAt).getTime()).not.toBeNaN();
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
    expect(body).not.toHaveProperty("courseId");
    expect(body).not.toHaveProperty("updatedAt");
    expect(body).not.toHaveProperty("password");
  });

  it("deve criar aula com status published → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Publicada", status: "published" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.status).toBe("published");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve criar aula com videoUrl do YouTube → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula YouTube", videoUrl: "https://www.youtube.com/watch?v=abc123" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.videoUrl).toBe("https://www.youtube.com/watch?v=abc123");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve criar aula com videoUrl do Vimeo → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Vimeo", videoUrl: "https://vimeo.com/123456789" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.videoUrl).toBe("https://vimeo.com/123456789");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve criar aula com videoUrl do youtu.be → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Youtu.be", videoUrl: "https://youtu.be/abc123" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.videoUrl).toBe("https://youtu.be/abc123");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve rejeitar videoUrl de domínio fora da whitelist → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Inválida", videoUrl: "https://example.com/video" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar videoUrl malformada → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula URL Ruim", videoUrl: "nao-e-uma-url" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar título com menos de 3 caracteres → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "AB" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar status inválido → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Status Ruim", status: "archived" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar criação por não-criador do curso → 403", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: { title: "Aula Invasora" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe(
      "Você não tem permissão para gerenciar aulas deste curso.",
    );
  });

  it("deve retornar 404 para courseId inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons",
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Fantasma" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve criar aula com description → 201, retorna description", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula com Descrição", description: "Introdução ao módulo" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.description).toBe("Introdução ao módulo");
    expect(Object.keys(body).sort()).toEqual(LESSON_KEYS);
  });

  it("deve criar aula sem description → 201, description retorna null", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "POST",
      url: `/api/courses/${course.id}/lessons`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Aula Sem Descrição" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().description).toBeNull();
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/courses/00000000-0000-0000-0000-000000000000/lessons",
      payload: { title: "Aula Sem Token" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Não autenticado.");
  });
});
