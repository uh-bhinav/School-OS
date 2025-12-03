// ============================================================================
// FILE: src/app/services/lessonPlan.hooks.ts
// PURPOSE: React Query hooks for lesson plan management
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import {
  getLessonPlansByTeacher,
  getLessonPlanById,
  getLessonPlansBySubject,
  getLessonPlanStats,
  getLessonPlanListForTeacher,
} from "./lessonPlan.api";

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

export const lessonPlanKeys = {
  all: ["lessonPlans"] as const,
  byTeacher: (teacherId: number) => [...lessonPlanKeys.all, "teacher", teacherId] as const,
  byId: (planId: string) => [...lessonPlanKeys.all, "plan", planId] as const,
  bySubject: (subjectId: number) => [...lessonPlanKeys.all, "subject", subjectId] as const,
  stats: (teacherId: number) => [...lessonPlanKeys.all, "stats", teacherId] as const,
  listWithStats: (teacherId: number) => [...lessonPlanKeys.all, "listWithStats", teacherId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get lesson plans for a specific teacher
 */
export function useLessonPlansByTeacher(teacherId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: lessonPlanKeys.byTeacher(teacherId),
    queryFn: () => getLessonPlansByTeacher(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && teacherId),
  });
}

/**
 * Get a specific lesson plan by ID
 */
export function useLessonPlanById(planId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: lessonPlanKeys.byId(planId),
    queryFn: () => getLessonPlanById(planId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && planId),
  });
}

/**
 * Get lesson plans by subject
 */
export function useLessonPlansBySubject(subjectId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: lessonPlanKeys.bySubject(subjectId),
    queryFn: () => getLessonPlansBySubject(subjectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && subjectId),
  });
}

/**
 * Get lesson plan statistics for a teacher
 */
export function useLessonPlanStats(teacherId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: lessonPlanKeys.stats(teacherId),
    queryFn: () => getLessonPlanStats(teacherId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && teacherId),
  });
}

/**
 * Get lesson plans with stats for a teacher
 * Combined query for efficiency
 */
export function useLessonPlanListWithStats(teacherId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: lessonPlanKeys.listWithStats(teacherId),
    queryFn: () => getLessonPlanListForTeacher(teacherId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && teacherId),
  });
}
