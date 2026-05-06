import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";
import { authRoutes } from "./routes/auth.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const message =
      statusCode >= 500 ? "Erro interno do servidor" : error.message;

    reply.status(statusCode).send({ message });
  });

  await app.register(authRoutes, { prefix: "/api/auth" });

  return app;
}
