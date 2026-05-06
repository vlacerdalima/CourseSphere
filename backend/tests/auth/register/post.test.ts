import "dotenv/config";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";

let app: FastifyInstance;

const VALID_USER = {
  name: "João Silva",
  email: "register.test@coursesphere.test",
  password: "senha123",
};

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

afterEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@coursesphere.test" } },
  });
});

describe("POST /api/auth/register", () => {
  it("201 — dados válidos retornam token e usuário sem senha", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: VALID_USER,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.user).toMatchObject({
      name: VALID_USER.name,
      email: VALID_USER.email,
    });
    expect(body.user).not.toHaveProperty("password");
  });

  it("400 — email duplicado retorna mensagem genérica sem revelar o conflito", async () => {
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: VALID_USER,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: VALID_USER,
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error).toBe(
      "Não foi possível criar a conta. Verifique os dados informados.",
    );
    // Garante que a resposta não revela que o email já existe
    expect(JSON.stringify(body)).not.toMatch(
      /duplicad|já exist|conflict|already/i,
    );
  });

  it("400 — password com menos de 6 caracteres", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        ...VALID_USER,
        email: "short.pass@coursesphere.test",
        password: "abc",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe(
      "Não foi possível criar a conta. Verifique os dados informados.",
    );
  });

  it("400 — body ausente", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe(
      "Não foi possível criar a conta. Verifique os dados informados.",
    );
  });

  it("400 — name com menos de 2 caracteres", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        ...VALID_USER,
        email: "short.name@coursesphere.test",
        name: "A",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe(
      "Não foi possível criar a conta. Verifique os dados informados.",
    );
  });

  it("400 — email com formato inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { ...VALID_USER, email: "nao-e-um-email" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe(
      "Não foi possível criar a conta. Verifique os dados informados.",
    );
  });
});
