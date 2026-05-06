import type { FastifyInstance } from "fastify";
import {
  createController,
  deleteController,
  indexController,
  updateController,
} from "../controllers/lessons.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export async function lessonsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", authenticate);

  app.get("/", indexController);
  app.post("/", createController);
  app.put("/:id", updateController);
  app.delete("/:id", deleteController);
}
