import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createAuthenticatedUser, defaultCourse } from "./helpers";

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

describe("POST /api/courses", () => {
  it("deve criar curso com dados válidos → 201", async () => {
    const { user, token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: defaultCourse,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe(defaultCourse.name);
    expect(body.description).toBe(defaultCourse.description);
    expect(body.creator.id).toBe(user.id);
    expect(body.creator.name).toBe(user.name);
    expect(Object.keys(body.creator)).toEqual(["id", "name"]);
    expect(body).not.toHaveProperty("password");
    expect(new Date(body.startDate).getTime()).not.toBeNaN();
    expect(new Date(body.endDate).getTime()).not.toBeNaN();
  });

  it("deve criar curso sem description → 201, description retorna null", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: defaultCourse.name, startDate: defaultCourse.startDate, endDate: defaultCourse.endDate },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().description).toBeNull();
  });

  it("deve criar curso com startDate igual a endDate → 201", async () => {
    const { token } = await createAuthenticatedUser(app);
    const sameDate = "2025-06-01T00:00:00.000Z";

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: { ...defaultCourse, startDate: sameDate, endDate: sameDate },
    });

    expect(response.statusCode).toBe(201);
  });

  it("deve rejeitar curso com nome menor que 3 caracteres → 400", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: { ...defaultCourse, name: "AB" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar curso com endDate anterior a startDate → 400", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: { ...defaultCourse, startDate: "2025-07-01T00:00:00.000Z", endDate: "2025-06-01T00:00:00.000Z" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar curso sem campos obrigatórios → 400", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Dados inválidos. Verifique os campos informados.");
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      payload: defaultCourse,
    });

    expect(response.statusCode).toBe(401);
  });

  it("deve ignorar creatorId enviado no body e usar o usuário autenticado", async () => {
    const { user, token } = await createAuthenticatedUser(app);
    const fakeCreatorId = "00000000-0000-0000-0000-000000000000";

    const response = await app.inject({
      method: "POST",
      url: "/api/courses",
      headers: { authorization: `Bearer ${token}` },
      payload: { ...defaultCourse, creatorId: fakeCreatorId },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.creator.id).toBe(user.id);
    expect(body.creator.id).not.toBe(fakeCreatorId);
  });
});
