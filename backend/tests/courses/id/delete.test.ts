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

describe("DELETE /api/courses/:id", () => {
  it("deve deletar curso quando é o criador → 204, GET subsequente retorna 404", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await app.inject({
      method: "GET",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(getResponse.statusCode).toBe(404);
  });

  it("deve rejeitar deleção por usuário que não é o criador → 403", async () => {
    const { token: tokenA } = await createAuthenticatedUser(app);
    const { token: tokenB } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, tokenA);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error).toBe("Você não tem permissão para deletar este curso.");
  });

  it("deve retornar 404 antes de 403 para curso inexistente", async () => {
    const { token } = await createAuthenticatedUser(app);

    const response = await app.inject({
      method: "DELETE",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Curso não encontrado.");
  });

  it("deve deletar aulas em cascata ao deletar o curso → 204", async () => {
    const { token } = await createAuthenticatedUser(app);
    const course = await createTestCourse(app, token);

    await prisma.lesson.create({
      data: { title: "Aula de teste", courseId: course.id },
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/courses/${course.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(deleteResponse.statusCode).toBe(204);

    const lessons = await prisma.lesson.findMany({ where: { courseId: course.id } });
    expect(lessons).toHaveLength(0);
  });

  it("deve rejeitar requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/courses/00000000-0000-0000-0000-000000000000",
    });

    expect(response.statusCode).toBe(401);
  });
});
