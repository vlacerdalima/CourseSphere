import type { FastifyReply, FastifyRequest } from "fastify";
import { verify, type JwtPayload } from "../lib/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ message: "Token não fornecido" });
  }

  const token = authHeader.slice(7);

  try {
    request.user = verify(token);
  } catch {
    return reply.status(401).send({ message: "Token inválido ou expirado" });
  }
}
