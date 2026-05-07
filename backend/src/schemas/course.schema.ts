import { z } from "zod";

export const createCourseSchema = z
  .object({
    name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().trim().optional(),
    coverUrl: z.string().url("URL inválida").optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Data final deve ser maior ou igual à data inicial",
    path: ["endDate"],
  });

export const updateCourseSchema = z
  .object({
    name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
    description: z.string().trim().optional(),
    coverUrl: z.string().url("URL inválida").optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  })
  .refine(
    (data) => {
      if (data.startDate !== undefined && data.endDate !== undefined) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    { message: "Data final deve ser maior ou igual à data inicial", path: ["endDate"] },
  );

export const listCoursesQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
