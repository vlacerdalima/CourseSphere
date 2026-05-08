import { Link } from "react-router-dom";
import { ChevronLeft, Calendar, Play, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCoverGradient } from "@/lib/coverGradient";
import type { CourseWithLessons } from "@/types";

type CourseDetailHeaderProps = {
  course: CourseWithLessons;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function CreatorAvatar({ name, id }: { name: string; id: string }) {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const color = colors[Math.abs(hash) % colors.length];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold shrink-0 ${color}`}
    >
      {initials}
    </span>
  );
}

export function CourseDetailHeader({ course, isOwner, onEdit, onDelete }: CourseDetailHeaderProps) {
  const total = course.lessons.length;
  const published = course.lessons.filter((l) => l.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <Link
            to="/courses"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/courses" className="hover:text-gray-900 transition-colors shrink-0">
            Meus cursos
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">{course.name}</span>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5" />
              Editar curso
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="h-64 rounded-2xl overflow-hidden relative">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: getCoverGradient(course.id) }}
          >
            <span className="font-mono text-white/40 text-sm tracking-widest uppercase">
              capa
            </span>
          </div>
        )}
        {isOwner && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs font-medium shadow-sm">
              Você é o criador
            </Badge>
          </div>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{course.name}</h1>
        {course.description && (
          <p className="mt-2 text-gray-500 leading-relaxed">{course.description}</p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Criador
          </span>
          <div className="flex items-center gap-2">
            <CreatorAvatar name={course.creator.name} id={course.creator.id} />
            <span className="font-medium text-gray-800">{course.creator.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Início
          </span>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {formatDate(course.startDate)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Encerramento
          </span>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {formatDate(course.endDate)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Aulas
          </span>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Play className="w-3.5 h-3.5 text-gray-400" />
            {total} no total · {published} publicada{published !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
