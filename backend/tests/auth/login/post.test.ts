import "dotenv/config";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";

let app: FastifyInstance;

const TEST_USER = {
  name: "Login Test",
  email: "login.test@coursesphere.test",
  password: "Senha123",
};

beforeAll(async () => {
  app = await buildApp();
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: TEST_USER,
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@coursesphere.test" } },
  });
  await app.close();
});

describe("POST /api/auth/login", () => {
  it("200 — credenciais válidas retornam token e usuário sem senha", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: TEST_USER.email, password: TEST_USER.password },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.user).toMatchObject({
      name: TEST_USER.name,
      email: TEST_USER.email,
    });
    expect(body.user).not.toHaveProperty("password");
  });

  it("401 — email inexistente retorna 'Credenciais inválidas.'", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "naoexiste@email.com", password: "Senha123" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Credenciais inválidas.");
  });

  it("401 — senha errada retorna a mesma mensagem de email inexistente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: TEST_USER.email, password: "senha_errada" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Credenciais inválidas.");
  });

  it("401 — body ausente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Credenciais inválidas.");
  });

  it("401 — email com formato inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "nao-e-um-email", password: "Senha123" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("Credenciais inválidas.");
  });
});
