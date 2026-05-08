import cors from "@fastify/cors";
import fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { authRoutes } from "./routes/auth.routes.js";
import { coursesRoutes } from "./routes/courses.routes.js";
import { lessonsRoutes } from "./routes/lessons.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const message =
      statusCode >= 500 ? "Erro interno do servidor" : error.message;

    reply.status(statusCode).send({ message });
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(coursesRoutes, { prefix: "/api/courses" });
  await app.register(lessonsRoutes, { prefix: "/api/courses/:courseId/lessons" });

  return app;
}
