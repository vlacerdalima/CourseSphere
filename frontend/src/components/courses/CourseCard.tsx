import { Link } from "react-router-dom";
import { BookOpen, Calendar, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { getCoverGradient } from "@/lib/coverGradient";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  showOwnerBadge?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CourseCard({ course, onEdit, onDelete, showOwnerBadge }: CourseCardProps) {
  const hasActions = onEdit || onDelete;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Cover — clicking navigates to detail */}
      <Link to={`/courses/${course.id}`} className="h-36 relative shrink-0 block">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: getCoverGradient(course.id) }}
          />
        )}
        {showOwnerBadge && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 text-gray-800 text-xs font-medium border-0 shadow-sm">
              Você é o criador
            </Badge>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link to={`/courses/${course.id}`} className="flex-1 block">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </Link>

        {/* Creator */}
        <div className="flex items-center gap-2">
          <Avatar name={course.creator.name} src={course.creator.avatarUrl} size="xs" />
          <span className="text-xs text-gray-500 truncate">{course.creator.name}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course._count.lessons} {course._count.lessons === 1 ? "aula" : "aulas"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(course.endDate)}
          </span>
        </div>

        {/* Actions */}
        {hasActions && (
          <div className="flex gap-2 pt-1 border-t border-gray-50">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-1.5 text-xs h-8"
                onClick={() => onEdit(course)}
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-1.5 text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(course.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
