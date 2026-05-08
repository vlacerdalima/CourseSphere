import { Link } from "react-router-dom";
import { Play, Pencil, Trash2, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/types";

type LessonListItemProps = {
  lesson: Lesson;
  index: number;
  courseId: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function LessonListItem({ lesson, index, courseId, isOwner, onEdit, onDelete }: LessonListItemProps) {
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <Link
      to={`/courses/${courseId}/lessons/${lesson.id}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
    >
      {/* Index + play icon */}
      <div className="flex items-center gap-2 shrink-0 w-10">
        <span className="font-mono text-sm text-gray-300 group-hover:hidden">
          {indexLabel}
        </span>
        <Play className="w-4 h-4 text-gray-400 hidden group-hover:block" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm leading-snug">{lesson.title}</p>
        {lesson.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 leading-relaxed">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {!lesson.videoUrl && (
          <span className="flex items-center gap-1 text-[11px] text-gray-300">
            <VideoOff className="w-3 h-3" />
            sem vídeo
          </span>
        )}

        {lesson.status === "published" ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[11px] font-medium">
            Publicada
          </Badge>
        ) : (
          <Badge className="bg-orange-50 text-orange-600 border-0 text-[11px] font-medium">
            Rascunho
          </Badge>
        )}

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
              title="Editar aula"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
              title="Excluir aula"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </Link>
  );
}
