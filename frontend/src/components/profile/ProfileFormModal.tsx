import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/shared/Avatar";
import { useAuth } from "@/hooks/useAuth";

const profileFormSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  avatarUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

type ProfileFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileFormModal({ open, onOpenChange }: ProfileFormModalProps) {
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  const watchedAvatarUrl = watch("avatarUrl");
  const watchedName = watch("name") ?? user?.name ?? "";

  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [open, user, reset]);

  async function onSubmit(data: ProfileFormData) {
    try {
      await updateProfile({
        name: data.name,
        avatarUrl: data.avatarUrl === "" ? null : data.avatarUrl,
      });
      toast.success("Perfil atualizado");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao atualizar perfil");
    }
  }

  const previewSrc = watchedAvatarUrl || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Atualize sua foto e nome de exibição</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <Avatar name={watchedName} src={previewSrc} size="xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder="Seu nome" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">URL da foto</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="Cole a URL de uma imagem"
              {...register("avatarUrl")}
            />
            {errors.avatarUrl && (
              <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
            )}
            <p className="text-xs text-gray-400">Ex: https://i.pravatar.cc/300</p>
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
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
