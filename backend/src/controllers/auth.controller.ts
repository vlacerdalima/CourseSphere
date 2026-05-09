import bcrypt from "bcrypt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { sign } from "../lib/jwt.js";
import { createUser, findUserByEmail, updateUser } from "../models/user.model.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth.schema.js";

const REGISTER_ERROR = "Não foi possível criar a conta. Verifique os dados informados.";
const LOGIN_ERROR = "Credenciais inválidas.";

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = registerSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: REGISTER_ERROR });
  }

  const { name, email, password } = result.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return reply.status(400).send({ error: REGISTER_ERROR });
  }

  const user = await createUser({ name, email, password });
  const token = sign({ userId: user.id });

  return reply.status(201).send({ token, user });
}

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = loginSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(401).send({ error: LOGIN_ERROR });
  }

  const { email, password } = result.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return reply.status(401).send({ error: LOGIN_ERROR });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return reply.status(401).send({ error: LOGIN_ERROR });
  }

  const token = sign({ userId: user.id });

  return reply.status(200).send({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
}

export async function updateProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = updateProfileSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: "VALIDATION_ERROR", details: result.error.flatten() });
  }

  const userId = request.user!.id;
  const user = await updateUser(userId, result.data);

  return reply.status(200).send({ user });
}
