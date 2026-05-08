import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/services/students.service";

export function useStudents(courseId: string, count: number = 8) {
  return useQuery({
    queryKey: ["students", courseId, count],
    queryFn: () => fetchStudents(courseId, count),
    staleTime: 1000 * 60 * 60,
    enabled: !!courseId,
  });
}
