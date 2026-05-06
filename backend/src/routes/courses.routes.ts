import type { FastifyInstance } from "fastify";
import {
  createController,
  deleteController,
  indexController,
  showController,
  updateController,
} from "../controllers/courses.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export async function coursesRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", authenticate);

  app.get("/", indexController);
  app.get("/:id", showController);
  app.post("/", createController);
  app.put("/:id", updateController);
  app.delete("/:id", deleteController);
}
