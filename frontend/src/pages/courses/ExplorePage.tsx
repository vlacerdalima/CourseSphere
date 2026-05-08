import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Compass } from "lucide-react";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useExploreCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 9 }).map((_, i) => (
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

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Compass className="w-7 h-7 text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasSearch ? "Nenhum curso encontrado" : "Nenhum curso disponível ainda"}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs">
        {hasSearch
          ? "Tente outra palavra-chave."
          : "Em breve novos cursos serão publicados."}
      </p>
    </div>
  );
}

export function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: courses, isLoading } = useExploreCourses(debouncedSearch || undefined);

  return (
    <DashboardLayout onCreateCourse={() => navigate("/courses")}>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Explorar cursos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Descubra o que a comunidade está criando.
          </p>
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
          <EmptyState hasSearch={!!debouncedSearch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                showOwnerBadge={course.creator.id === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
