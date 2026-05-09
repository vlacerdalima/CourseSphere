import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string()
  .min(6, "Senha deve ter no mínimo 6 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
  avatarUrl: z.string().url("URL inválida").nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Informe pelo menos um campo para atualizar" },
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
