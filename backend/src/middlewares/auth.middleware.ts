import type { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "../lib/jwt.js";
import { findUserById } from "../models/user.model.js";

declare module "fastify" {
  interface FastifyRequest {
    user: { id: string; name: string; email: string; avatarUrl: string | null; createdAt: Date };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Não autenticado." });
  }

  const token = authHeader.slice(7);

  let userId: string;
  try {
    ({ userId } = verify(token));
  } catch {
    return reply.status(401).send({ error: "Não autenticado." });
  }

  const user = await findUserById(userId);
  if (!user) {
    return reply.status(401).send({ error: "Não autenticado." });
  }

  request.user = user;
}
