import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";
import { createAuthenticatedUser, createTestCourse, defaultCourse } from "../helpers";

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

describe("PUT /api/courses/:id", () => {
  it("deve atualizar curso quando é o criador → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.name).toBe("Nome Atualizado");
    expect(body.description).toBe(defaultCourse.description);
  });

  it("deve rejeitar atualização por usuário que não é o criador → 403", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("Você não tem permissão para editar este curso.");
  });

  it("deve retornar 404 antes de 403 para curso inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "PUT",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve rejeitar body vazio → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar endDate anterior a startDate na atualização → 400", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "PUT",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { startDate: "2025-07-01T00:00:00.000Z", endDate: "2025-06-01T00:00:00.000Z" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
      payload: { name: "Nome Atualizado" },
    });

    expect(response.statusCode).toBe(401);
  });
});
