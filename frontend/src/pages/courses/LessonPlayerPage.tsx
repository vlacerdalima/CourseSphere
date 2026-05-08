import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/lessons/VideoPlayer";
import { LessonFormModal } from "@/components/lessons/LessonFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseDetail, useDeleteLesson } from "@/hooks/useLessons";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
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

export function LessonPlayerPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: course, isLoading, isError } = useCourseDetail(id!);
  const deleteLessonMutation = useDeleteLesson();

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const isOwner = course?.creator.id === user?.id;

  const visibleLessons = useMemo(() => {
    if (!course) return [];
    return isOwner
      ? course.lessons
      : course.lessons.filter((l) => l.status === "published");
  }, [course, isOwner]);

  const currentIndex = visibleLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = currentIndex >= 0 ? visibleLessons[currentIndex] : null;
  const previousLesson = currentIndex > 0 ? visibleLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < visibleLessons.length - 1
      ? visibleLessons[currentIndex + 1]
      : null;

  // Redirect if course loaded but lesson is not visible (draft accessed by non-owner)
  useEffect(() => {
    if (course && currentIndex === -1) {
      toast.error("Aula não encontrada");
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [course, currentIndex, id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 space-y-6">
        <Skeleton className="h-12 w-full max-w-2xl" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Curso não encontrado</h2>
        <Button onClick={() => navigate("/courses")}>Voltar para meus cursos</Button>
      </div>
    );
  }

  // currentLesson may be null while useEffect redirect is in flight — render nothing
  if (!currentLesson) return null;

  const aulaNumero = currentIndex + 1;
  const totalAulas = visibleLessons.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur border-b border-border">
        <Link
          to={`/courses/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao curso
        </Link>

        <Link
          to={`/courses/${id}`}
          className="flex items-center gap-1.5 text-sm font-semibold"
        >
          <span className="text-gray-900">Course</span>
          <span className="text-blue-600">Sphere</span>
          <span className="text-muted-foreground font-normal mx-1">·</span>
          <span className="text-gray-700 font-medium max-w-[200px] truncate hidden sm:block">
            {course.name}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Aula {aulaNumero}/{totalAulas}
          </span>
          {user && <UserAvatar name={user.name} />}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-6 max-w-screen-2xl mx-auto">
          {/* Left column — video + info */}
          <div className="space-y-5 min-w-0">
            <VideoPlayer videoUrl={currentLesson.videoUrl} title={currentLesson.title} />

            {/* Meta badges */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                Aula {String(aulaNumero).padStart(2, "0")}
              </Badge>
              {currentLesson.status === "published" ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs font-medium">
                  Publicada
                </Badge>
              ) : (
                <Badge className="bg-orange-50 text-orange-600 border-0 text-xs font-medium">
                  Rascunho
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {currentLesson.title}
            </h1>

            {/* Creator */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Criador do curso
              </span>
              <CreatorAvatar name={course.creator.name} id={course.creator.id} />
              <span className="text-sm font-medium text-foreground">{course.creator.name}</span>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLesson(currentLesson)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar aula
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setDeletingLesson(currentLesson)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            )}

            {/* Description */}
            {currentLesson.description && (
              <p className="text-muted-foreground leading-relaxed">{currentLesson.description}</p>
            )}
          </div>

          {/* Right column — lesson sidebar */}
          <div>
            <div className="sticky top-24 bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Aulas do curso</p>
                <span className="text-xs text-muted-foreground">{totalAulas} aulas</span>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {visibleLessons.map((lesson, index) => {
                  const isActive = lesson.id === lessonId;
                  return (
                    <Link
                      key={lesson.id}
                      to={`/courses/${id}/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 p-3 transition-colors border-l-4",
                        isActive
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted border-transparent"
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground shrink-0 w-5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Play
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isActive ? "font-semibold" : "font-medium")}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.status === "published" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-medium py-0 px-1.5">
                              Publicada
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-50 text-orange-600 border-0 text-[10px] font-medium py-0 px-1.5">
                              Rascunho
                            </Badge>
                          )}
                          {!lesson.videoUrl && (
                            <span className="text-[10px] text-muted-foreground">sem vídeo</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="sticky bottom-0 z-10 flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur border-t border-border">
        <Button
          variant="outline"
          disabled={!previousLesson}
          onClick={() =>
            previousLesson && navigate(`/courses/${id}/lessons/${previousLesson.id}`)
          }
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground hidden sm:block">
          {aulaNumero} de {totalAulas}
        </span>

        <Button
          disabled={!nextLesson}
          onClick={() =>
            nextLesson && navigate(`/courses/${id}/lessons/${nextLesson.id}`)
          }
        >
          Próxima
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>

      {/* Modals */}
      <LessonFormModal
        open={editingLesson !== null}
        onOpenChange={(open) => { if (!open) setEditingLesson(null); }}
        courseId={course.id}
        lesson={editingLesson ?? undefined}
      />

      <ConfirmDialog
        open={deletingLesson !== null}
        onOpenChange={(open) => { if (!open) setDeletingLesson(null); }}
        title="Excluir aula?"
        description={`A aula "${deletingLesson?.title}" será removida permanentemente.`}
        confirmLabel="Excluir aula"
        variant="destructive"
        isLoading={deleteLessonMutation.isPending}
        onConfirm={async () => {
          if (!deletingLesson) return;
          try {
            await deleteLessonMutation.mutateAsync({
              courseId: course.id,
              lessonId: deletingLesson.id,
            });
            toast.success("Aula excluída");
            setDeletingLesson(null);
            navigate(`/courses/${course.id}`);
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao excluir aula");
          }
        }}
      />
    </div>
  );
}
