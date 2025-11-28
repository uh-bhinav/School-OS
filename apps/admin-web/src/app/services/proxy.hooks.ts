// ============================================================================
// PROXY (SUBSTITUTE TEACHER) REACT QUERY HOOKS
// ============================================================================
// React Query hooks for teacher absence and substitute teacher management
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAbsentTeachers,
  getAvailableTeachers,
  assignProxy,
  type AbsentTeacher,
  type AvailableTeacher,
  type ProxyAssignmentRequest,
  type ProxyAssignmentResponse,
} from "./proxy.api";
import type { DayOfWeek } from "./timetable.schema";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const proxyKeys = {
  all: ["proxy"] as const,
  absentTeachers: (params: { classId: number; section: string; date: string; weekStart: string }) =>
    [...proxyKeys.all, "absent-teachers", params] as const,
  availableTeachers: (params: { periodNo: number; date: string; day: DayOfWeek; classId: number; section: string }) =>
    [...proxyKeys.all, "available-teachers", params] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch absent teachers for a specific class and date
 */
export function useAbsentTeachers(params: {
  classId: number;
  section: string;
  date: string;
  weekStart: string;
}, options?: { enabled?: boolean }) {
  return useQuery<AbsentTeacher[], Error>({
    queryKey: proxyKeys.absentTeachers(params),
    queryFn: () => getAbsentTeachers(params),
    staleTime: 30_000, // 30 seconds
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch available substitute teachers for a specific period
 */
export function useAvailableTeachers(params: {
  periodNo: number;
  date: string;
  day: DayOfWeek;
  classId: number;
  section: string;
  excludeTeacherId?: number;
}, options?: { enabled?: boolean }) {
  return useQuery<AvailableTeacher[], Error>({
    queryKey: proxyKeys.availableTeachers(params),
    queryFn: () => getAvailableTeachers(params),
    staleTime: 30_000, // 30 seconds
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to assign a substitute teacher
 */
export function useAssignProxy() {
  const queryClient = useQueryClient();

  return useMutation<ProxyAssignmentResponse, Error, ProxyAssignmentRequest>({
    mutationFn: (request) => assignProxy(request),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: proxyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}
