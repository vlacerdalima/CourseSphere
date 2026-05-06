import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";
import { createAuthenticatedUser, createTestCourse } from "../helpers";

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

describe("GET /api/courses/:id", () => {
  it("deve retornar detalhes do curso com campo lessons → 200", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.id).toBe(course.id);
    expect(Array.isArray(body.lessons)).toBe(true);
    expect(body.creator).toBeDefined();
    expect(Object.keys(body.creator)).toEqual(["id", "name"]);
    expect(body).not.toHaveProperty("password");
  });

  it("deve permitir que qualquer usuário autenticado veja detalhes do curso → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);

    const response = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(course.id);
  });

  it("deve retornar 404 para curso inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
    });

    expect(response.statusCode).toBe(401);
  });
});
