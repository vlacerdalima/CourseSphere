import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

type UserPublic = { id: string; name: string; email: string };
type UserWithPassword = UserPublic & { password: string };

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {...data,password: hashedPassword},
    select: { id: true, name: true, email: true },
  });
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true },
  });
}

export async function findUserById(id: string): Promise<UserPublic | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
