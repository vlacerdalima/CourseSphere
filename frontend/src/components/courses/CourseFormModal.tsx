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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourses";
import type { Course } from "@/types";

const courseFormSchema = z
  .object({
    name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().trim().optional(),
    coverUrl: z
      .string()
      .url("URL inválida")
      .optional()
      .or(z.literal("")),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de término é obrigatória"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Data de término não pode ser anterior à data de início",
    path: ["endDate"],
  });

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function CourseFormModal({ open, onOpenChange, course }: CourseFormModalProps) {
  const isEdit = !!course;
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        course
          ? {
              name: course.name,
              description: course.description ?? "",
              coverUrl: course.coverUrl ?? "",
              startDate: toDateInput(course.startDate),
              endDate: toDateInput(course.endDate),
            }
          : { name: "", description: "", coverUrl: "", startDate: "", endDate: "" }
      );
    }
  }, [open, course, reset]);

  async function onSubmit(data: CourseFormData) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      coverUrl: data.coverUrl || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    try {
      if (isEdit) {
        await updateCourse.mutateAsync({ id: course.id, data: payload });
        toast.success("Curso atualizado!");
      } else {
        await createCourse.mutateAsync(payload);
        toast.success("Curso criado!");
      }
      onOpenChange(false);
    } catch (error: any) {
      const status = error?.response?.status;
      const body = error?.response?.data;
      const detail = body?.error ?? body?.message ?? error?.message ?? "";
      toast.error(`[${status ?? "Network"}] ${detail || (isEdit ? "Erro ao atualizar curso." : "Erro ao criar curso.")}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar curso" : "Criar novo curso"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nome do curso <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder="Ex: Introdução ao React" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo do curso..."
              className="resize-none"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coverUrl">URL da capa</Label>
            <Input
              id="coverUrl"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              {...register("coverUrl")}
            />
            {errors.coverUrl && (
              <p className="text-xs text-destructive">{errors.coverUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">
                Data de início <span className="text-red-500">*</span>
              </Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">
                Data de término <span className="text-red-500">*</span>
              </Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>
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
                : "Criar curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
