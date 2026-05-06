import { z } from "zod";

const ALLOWED_VIDEO_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
];

const videoUrlSchema = z
  .string()
  .url("URL inválida")
  .refine(
    (url) => {
      try {
        const hostname = new URL(url).hostname;
        return ALLOWED_VIDEO_DOMAINS.includes(hostname);
      } catch {
        return false;
      }
    },
    { message: "Vídeo deve ser do YouTube ou Vimeo" },
  );

export const createLessonSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres"),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  videoUrl: videoUrlSchema.optional(),
});

export const updateLessonSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Título deve ter no mínimo 3 caracteres")
      .optional(),
    status: z.enum(["draft", "published"]).optional(),
    videoUrl: videoUrlSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe pelo menos um campo para atualizar",
  });

export const listLessonsQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
