import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CourseDetailHeader } from "@/components/courses/CourseDetailHeader";
import { EnrolledStudents } from "@/components/courses/EnrolledStudents";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { LessonFormModal } from "@/components/lessons/LessonFormModal";
import { LessonListItem } from "@/components/lessons/LessonListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCourseDetail, useDeleteLesson } from "@/hooks/useLessons";
import { useDeleteCourse } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson } from "@/types";

function LoadingSkeleton() {
  return (
    <DashboardLayout onCreateCourse={() => {}}>
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </DashboardLayout>
  );
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: course, isLoading, isError } = useCourseDetail(id!);
  const deleteCourseMutation = useDeleteCourse();
  const deleteLessonMutation = useDeleteLesson();

  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !course) {
    return (
      <DashboardLayout onCreateCourse={() => navigate("/courses")}>
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O curso pode ter sido removido ou você não tem acesso.
          </p>
          <Button onClick={() => navigate("/courses")}>Voltar para meus cursos</Button>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = course.creator.id === user?.id;
  const visibleLessons = isOwner
    ? course.lessons
    : course.lessons.filter((l) => l.status === "published");

  return (
    <DashboardLayout onCreateCourse={() => navigate("/courses")}>
      <div className="p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-6 min-w-0">
            <CourseDetailHeader
              course={course}
              isOwner={isOwner}
              onEdit={() => setIsEditCourseOpen(true)}
              onDelete={() => setIsDeleteCourseOpen(true)}
            />

            {/* Lessons card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <h2 className="font-semibold text-gray-900">Aulas</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {visibleLessons.length} aula{visibleLessons.length !== 1 ? "s" : ""} ·{" "}
                    {visibleLessons.filter((l) => l.status === "published").length} publicada
                    {visibleLessons.filter((l) => l.status === "published").length !== 1 ? "s" : ""}
                  </p>
                </div>
                {isOwner && (
                  <Button size="sm" className="gap-1.5" onClick={() => setIsCreateLessonOpen(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    Nova aula
                  </Button>
                )}
              </div>

              <div className="p-2">
                {visibleLessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="font-medium text-gray-700 mb-1">Nenhuma aula ainda</p>
                    <p className="text-sm text-gray-400">
                      {isOwner
                        ? "Crie a primeira aula para começar."
                        : "As aulas ainda não foram publicadas."}
                    </p>
                  </div>
                ) : (
                  visibleLessons.map((lesson, i) => (
                    <LessonListItem
                      key={lesson.id}
                      lesson={lesson}
                      index={i}
                      courseId={course.id}
                      isOwner={isOwner}
                      onEdit={() => setEditingLesson(lesson)}
                      onDelete={() => setDeletingLesson(lesson)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div>
            <EnrolledStudents courseId={course.id} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CourseFormModal
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        course={course}
      />

      <ConfirmDialog
        open={isDeleteCourseOpen}
        onOpenChange={setIsDeleteCourseOpen}
        title="Excluir curso?"
        description={`O curso "${course.name}" e todas as suas aulas serão removidos permanentemente.`}
        confirmLabel="Excluir curso"
        variant="destructive"
        isLoading={deleteCourseMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteCourseMutation.mutateAsync(course.id);
            toast.success("Curso excluído com sucesso");
            setIsDeleteCourseOpen(false);
            navigate("/courses");
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao excluir curso");
          }
        }}
      />

      <LessonFormModal
        open={isCreateLessonOpen}
        onOpenChange={setIsCreateLessonOpen}
        courseId={course.id}
      />

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
            toast.success("Aula excluída com sucesso");
            setDeletingLesson(null);
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao excluir aula");
          }
        }}
      />
    </DashboardLayout>
  );
}
