import type { FastifyInstance } from "fastify";
import { loginController, registerController, updateProfileController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.patch("/profile", { onRequest: [authenticate] }, updateProfileController);
}
