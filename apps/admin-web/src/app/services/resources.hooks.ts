import { useQuery } from "@tanstack/react-query";
import { getTeachers, getSubjects, getRooms } from "./resources.api";

/**
 * Hook to fetch teachers list with caching
 */
export function useTeachers(schoolId: number) {
  return useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: () => getTeachers(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!schoolId,
  });
}

/**
 * Hook to fetch subjects list with caching
 */
export function useSubjects(params: { class_id?: number; school_id?: number }) {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => getSubjects(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!(params.class_id || params.school_id),
  });
}

/**
 * Hook to fetch rooms list with caching
 */
export function useRooms(schoolId: number) {
  return useQuery({
    queryKey: ["rooms", schoolId],
    queryFn: () => getRooms(schoolId),
    staleTime: 5 * 60 * 1000,
    enabled: !!schoolId,
  });
}
