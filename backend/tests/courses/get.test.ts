import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createAuthenticatedUser, createTestCourse } from "./helpers";

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

describe("GET /api/courses", () => {
  it("deve listar apenas cursos do usuário autenticado → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);

    await createTestCourse(app, tokenA, { name: "Curso de A" });
    await createTestCourse(app, tokenB, { name: "Curso de B" });

    const responseA = await app.inject({
      method: "GET",
      url: "/api/courses",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    const responseB = await app.inject({
      method: "GET",
      url: "/api/courses",
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(responseA.statusCode).toBe(200);
    expect(responseA.json()).toHaveLength(1);
    expect(responseA.json()[0].name).toBe("Curso de A");

    expect(responseB.statusCode).toBe(200);
    expect(responseB.json()).toHaveLength(1);
    expect(responseB.json()[0].name).toBe("Curso de B");
  });

  it("deve retornar array vazio quando usuário não tem cursos → 200", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("deve filtrar cursos por nome com ?search= (case-insensitive) → 200", async () => {
    const { token } = await createAuthenticatedUser(app);

    await createTestCourse(app, token, { name: "TypeScript Avançado" });
    await createTestCourse(app, token, { name: "React Básico" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses?search=typescript",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    expect(courses).toHaveLength(1);
    expect(courses[0].name).toBe("TypeScript Avançado");
  });

  it("deve retornar todos os cursos quando search é string vazia → 200", async () => {
    const { token } = await createAuthenticatedUser(app);

    await createTestCourse(app, token, { name: "TypeScript Avançado" });
    await createTestCourse(app, token, { name: "React Básico" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses?search=",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(2);
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/courses",
    });

    expect(response.statusCode).toBe(401);
  });
});
