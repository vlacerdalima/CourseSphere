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

beforeEach(async () => {
  await prisma.course.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@coursesphere.test" } } });
});

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@coursesphere.test" } } });
});

describe("GET /api/courses/explore", () => {
  it("deve retornar todos os cursos da plataforma → 200", async () => {
    const { token: tokenA, user: userA } = await createAuthenticatedUser(app);
    const { token: tokenB, user: userB } = await createAuthenticatedUser(app);
    await createTestCourse(app, tokenA, { name: "Curso de A" });
    await createTestCourse(app, tokenB, { name: "Curso de B" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${tokenA}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    expect(courses).toHaveLength(2);
    const creatorIds = courses.map((c: { creator: { id: string } }) => c.creator.id);
    expect(creatorIds).toContain(userA.id);
    expect(creatorIds).toContain(userB.id);
  });

  it("deve retornar array vazio quando não há cursos → 200", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("deve filtrar por ?search= em todos os cursos (case-insensitive) → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    await createTestCourse(app, tokenA, { name: "TypeScript Avançado" });
    await createTestCourse(app, tokenB, { name: "React Básico" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore?search=react",
      headers: { authorization: `Bearer ${tokenA}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    expect(courses).toHaveLength(1);
    expect(courses[0].name).toBe("React Básico");
  });

  it("deve retornar todos os cursos quando search é string vazia → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    await createTestCourse(app, tokenA);
    await createTestCourse(app, tokenB);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore?search=",
      headers: { authorization: `Bearer ${tokenA}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(2);
  });

  it("deve permitir que qualquer usuário autenticado veja todos os cursos → 200", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const courseA = await createTestCourse(app, tokenA, { name: "Curso de A" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    expect(courses).toHaveLength(1);
    expect(courses[0].id).toBe(courseA.id);
  });

  it("deve ordenar por createdAt desc (mais recente primeiro)", async () => {
    const { token } = await createAuthenticatedUser(app);
    const first = await createTestCourse(app, token, { name: "Curso Antigo" });
    const second = await createTestCourse(app, token, { name: "Curso Recente" });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    expect(courses).toHaveLength(2);
    expect(courses[0].id).toBe(second.id);
    expect(courses[1].id).toBe(first.id);
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
    });

    expect(response.statusCode).toBe(401);
  });

  it("não deve retornar campo password em nenhum nível → creator tem apenas id, name e avatarUrl", async () => {
    const { token } = await createAuthenticatedUser(app);
    await createTestCourse(app, token);

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const [course] = response.json();
    expect(course).not.toHaveProperty("password");
    expect(Object.keys(course.creator).sort()).toEqual(["avatarUrl", "id", "name"]);
  });

  it("deve incluir coverUrl na resposta (null quando ausente, valor quando presente)", async () => {
    const { token } = await createAuthenticatedUser(app);
    await createTestCourse(app, token, { name: "Sem Capa" });
    await createTestCourse(app, token, {
      name: "Com Capa",
      coverUrl: "https://picsum.photos/800/400",
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const courses = response.json();
    const semCapa = courses.find((c: { name: string }) => c.name === "Sem Capa");
    const comCapa = courses.find((c: { name: string }) => c.name === "Com Capa");
    expect(semCapa).toHaveProperty("coverUrl", null);
    expect(comCapa).toHaveProperty("coverUrl", "https://picsum.photos/800/400");
  });

  it("não deve afetar GET /api/courses (regression check)", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    await createTestCourse(app, tokenA);
    await createTestCourse(app, tokenB);

    const myCoursesResponse = await app.inject({
      method: "GET",
      url: "/api/courses",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    const exploreResponse = await app.inject({
      method: "GET",
      url: "/api/courses/explore",
      headers: { authorization: `Bearer ${tokenA}` },
    });

    expect(myCoursesResponse.statusCode).toBe(200);
    expect(myCoursesResponse.json()).toHaveLength(1);

    expect(exploreResponse.statusCode).toBe(200);
    expect(exploreResponse.json()).toHaveLength(2);
  });
});
