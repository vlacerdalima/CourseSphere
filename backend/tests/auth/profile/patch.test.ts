import "dotenv/config";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";
import { findUserById } from "../../../src/models/user.model";

let app: FastifyInstance;

let counter = 0;
function makeEmail() {
  return `profile.${++counter}@coursesphere.test`;
}

async function createAuthenticatedUser(overrides?: { name?: string; email?: string }) {
  const payload = {
    name: overrides?.name ?? "Profile User",
    email: overrides?.email ?? makeEmail(),
    password: "Senha123",
  };

  const response = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload,
  });

  const body = response.json();
  return {
    user: body.user as { id: string; name: string; email: string; avatarUrl: string | null; createdAt: string },
    token: body.token as string,
    email: payload.email,
  };
}

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

describe("PATCH /api/auth/profile", () => {
  it("atualiza nome com sucesso → 200", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Novo Nome" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.user.name).toBe("Novo Nome");
  });

  it("atualiza avatarUrl com sucesso → 200", async () => {
    const { token } = await createAuthenticatedUser();
    const avatarUrl = "https://example.com/avatar.jpg";

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { avatarUrl },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.avatarUrl).toBe(avatarUrl);
  });

  it("atualiza nome e avatarUrl juntos → 200", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nome Completo", avatarUrl: "https://example.com/pic.png" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.user.name).toBe("Nome Completo");
    expect(body.user.avatarUrl).toBe("https://example.com/pic.png");
  });

  it("remove avatarUrl enviando null → 200, avatarUrl fica null", async () => {
    const { token } = await createAuthenticatedUser();

    await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { avatarUrl: "https://example.com/avatar.jpg" },
    });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { avatarUrl: null },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.avatarUrl).toBeNull();
  });

  it("rejeita body vazio → 400", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejeita avatarUrl inválida (não é URL) → 400", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { avatarUrl: "não-é-url" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejeita nome com menos de 2 caracteres → 400", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "A" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejeita requisição sem token → 401", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      payload: { name: "Sem Token" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("atualiza apenas o usuário autenticado, não afeta outros usuários", async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();

    await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${userA.token}` },
      payload: { name: "Apenas A" },
    });

    const userBRecord = await findUserById(userB.user.id);
    expect(userBRecord?.name).toBe("Profile User");
  });

  it("ignora email e password do body — Zod descarta campos desconhecidos", async () => {
    const { token, email } = await createAuthenticatedUser();

    const response = await app.inject({
      method: "PATCH",
      url: "/api/auth/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nome Válido", email: "outro@email.com", password: "NovaSenha1" },
    });

    expect(response.statusCode).toBe(200);
    const userInDb = await prisma.user.findUnique({ where: { email } });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(email);
  });
});
