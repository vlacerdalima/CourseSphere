import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

type UserPublic = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type UserWithPassword = UserPublic & { password: string };

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: userPublicSelect,
  });
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { ...userPublicSelect, password: true },
  });
}

export async function findUserById(id: string): Promise<UserPublic | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; avatarUrl?: string | null },
): Promise<UserPublic> {
  return prisma.user.update({
    where: { id },
    data,
    select: userPublicSelect,
  });
}
