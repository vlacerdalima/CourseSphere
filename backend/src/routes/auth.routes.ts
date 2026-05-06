import type { FastifyInstance } from "fastify";
import { loginController, registerController } from "../controllers/auth.controller.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/register", registerController);
  app.post("/login", loginController);
}
