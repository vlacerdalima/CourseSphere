import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMyCourses, useDeleteCourse } from "@/hooks/useCourses";
import type { Course } from "@/types";

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasSearch,
  onCreateCourse,
}: {
  hasSearch: boolean;
  onCreateCourse: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasSearch ? "Nenhum curso encontrado" : "Você ainda não tem cursos"}
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        {hasSearch
          ? "Tente outra palavra-chave."
          : "Crie seu primeiro curso e compartilhe seu conhecimento."}
      </p>
      {!hasSearch && (
        <Button onClick={onCreateCourse}>Criar meu primeiro curso</Button>
      )}
    </div>
  );
}

export function CoursesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: courses, isLoading } = useMyCourses(debouncedSearch || undefined);
  const deleteCourse = useDeleteCourse();

  return (
    <DashboardLayout onCreateCourse={() => setIsCreateModalOpen(true)}>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus cursos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie e acompanhe seus cursos.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Novo curso
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar curso..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <CourseGridSkeleton />
        ) : !courses?.length ? (
          <EmptyState
            hasSearch={!!debouncedSearch}
            onCreateCourse={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={setEditingCourse}
                onDelete={(id) => {
                  const found = courses.find((c) => c.id === id);
                  if (found) setDeletingCourse(found);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CourseFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <CourseFormModal
        open={!!editingCourse}
        onOpenChange={(open) => { if (!open) setEditingCourse(null); }}
        course={editingCourse ?? undefined}
      />

      <ConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => { if (!open) setDeletingCourse(null); }}
        title="Excluir curso?"
        description={`O curso "${deletingCourse?.name}" será removido permanentemente.`}
        confirmLabel="Excluir"
        variant="destructive"
        isLoading={deleteCourse.isPending}
        onConfirm={async () => {
          if (!deletingCourse) return;
          try {
            await deleteCourse.mutateAsync(deletingCourse.id);
            toast.success("Curso excluído.");
            setDeletingCourse(null);
          } catch {
            toast.error("Erro ao excluir curso.");
          }
        }}
      />
    </DashboardLayout>
  );
}
