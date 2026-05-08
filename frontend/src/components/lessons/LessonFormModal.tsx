import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLesson, useUpdateLesson } from "@/hooks/useLessons";
import type { Lesson } from "@/types";

const lessonFormSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().trim().optional(),
  status: z.enum(["draft", "published"]),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  lesson?: Lesson;
}

export function LessonFormModal({ open, onOpenChange, courseId, lesson }: LessonFormModalProps) {
  const isEdit = !!lesson;
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: { status: "draft" },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (open) {
      reset(
        lesson
          ? {
              title: lesson.title,
              description: lesson.description ?? "",
              status: lesson.status,
              videoUrl: lesson.videoUrl ?? "",
            }
          : { title: "", description: "", status: "draft", videoUrl: "" }
      );
    }
  }, [open, lesson, reset]);

  async function onSubmit(data: LessonFormData) {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      videoUrl: data.videoUrl || undefined,
    };

    try {
      if (isEdit) {
        await updateLesson.mutateAsync({ courseId, lessonId: lesson.id, data: payload });
        toast.success("Aula atualizada!");
      } else {
        await createLesson.mutateAsync({ courseId, data: payload });
        toast.success("Aula criada!");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? "Erro ao atualizar aula." : "Erro ao criar aula.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aula" : "Nova aula"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input id="title" placeholder="Ex: Introdução ao módulo" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lesson-description">Descrição</Label>
            <Textarea
              id="lesson-description"
              placeholder="Descreva o conteúdo desta aula..."
              className="resize-none"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">URL do vídeo</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/..."
              {...register("videoUrl")}
            />
            {errors.videoUrl && (
              <p className="text-xs text-destructive">{errors.videoUrl.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={statusValue}
              onValueChange={(val) => setValue("status", val as "draft" | "published")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Salvando..."
                  : "Criando..."
                : isEdit
                ? "Salvar alterações"
                : "Criar aula"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
