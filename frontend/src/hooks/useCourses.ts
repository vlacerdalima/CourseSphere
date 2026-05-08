import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourses,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/services/courses.service";
import type { CreateCourseData, UpdateCourseData } from "@/types";

export function useMyCourses(search?: string) {
  return useQuery({
    queryKey: ["courses", "mine", search ?? ""],
    queryFn: () => getCourses(search),
  });
}

export function useExploreCourses(search?: string) {
  return useQuery({
    queryKey: ["courses", "explore", search ?? ""],
    queryFn: () => getAllCourses(search),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseData) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
