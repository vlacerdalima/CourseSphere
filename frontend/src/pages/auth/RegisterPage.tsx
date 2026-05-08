import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerFormSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  if (password.length < 6) return 1;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (hasUpper && hasNumber) return 4;
  if (hasUpper || hasNumber) return 3;
  return 2;
}

const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const passwordValue = watch("password") ?? "";
  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message =
        axiosError.response?.data?.error || "Erro ao criar conta. Tente novamente.";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — manifesto */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-gray-950 flex-col justify-between p-10 relative overflow-hidden">
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3b82f6 0, #3b82f6 1px, transparent 0, transparent 50%)",
            backgroundSize: "10px 10px",
          }}
        />

        <div className="relative z-10">
          <span className="text-xl font-bold text-blue-400 tracking-tight">Sphere</span>
        </div>

        <div className="relative z-10 space-y-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Manifesto</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-snug">
            Aprender é um ato de{" "}
            <span className="text-blue-400">curiosidade</span>{" "}
            sustentada — e merece um espaço à altura.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            A CourseSphere foi construída pra deixar o conteúdo no centro: zero ruído,
            zero gamificação artificial.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40?img=5"
            alt="Helena Figueiredo"
            className="w-10 h-10 rounded-full border-2 border-gray-700"
          />
          <div>
            <p className="text-white text-sm font-medium">Helena Figueiredo</p>
            <p className="text-gray-500 text-xs">Instrutora · CourseSphere</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <p className="text-sm text-gray-500">
            Já tem conta?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">Crie sua conta</h1>
              <p className="text-gray-500 text-sm">Em 30 segundos você está dentro.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome completo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="mínimo 6 caracteres com 1 maiúscula e 1 número"
                    className="pl-10 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength >= bar ? strengthColor[strength] : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || strength < 4}
              >
                {isSubmitting ? "Criando conta..." : "Criar conta →"}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-400">
              Ao continuar, você concorda com os{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline hover:text-gray-600"
              >
                Termos
              </a>{" "}
              e{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline hover:text-gray-600"
              >
                Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
