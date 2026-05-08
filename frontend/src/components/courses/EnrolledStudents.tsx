import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/useStudents";

type EnrolledStudentsProps = {
  courseId: string;
};

export function EnrolledStudents({ courseId }: EnrolledStudentsProps) {
  const { data: students, isLoading, isError } = useStudents(courseId, 8);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Alunos matriculados
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">8</span>
          <span className="text-sm text-gray-500">estudando agora</span>
        </div>
      </div>

      {/* Avatar grid 4x2 */}
      <div className="grid grid-cols-4 gap-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-full" />
            ))
          : isError
          ? null
          : students?.map((s) => (
              <img
                key={s.id}
                src={s.avatarUrl}
                alt={s.name}
                title={s.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ))}
      </div>

      <div className="border-t border-gray-100" />

      {/* Student list */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Lista da turma</p>
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-xs text-gray-400">Não foi possível carregar os alunos.</p>
        ) : (
          <div className="space-y-2.5">
            {students?.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <img
                  src={s.avatarUrl}
                  alt={s.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <span className="text-sm text-gray-700 truncate">{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
