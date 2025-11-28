// ============================================================================
// FILE: src/app/services/teachersFilters.hooks.ts
// PURPOSE: React Query hooks for teacher filtering and class teacher assignments
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import {
  getAllSubjects,
  getTeacherSubjectMappings,
  getTeacherIdsBySubjects,
  getClassTeacherAssignments,
  getClassTeacherIds,
  isTeacherClassTeacher,
  getClassForTeacher,
  getAllClasses,
  getAvailableClasses,
  assignClassTeacher,
  removeClassTeacherAssignment,
  getFilteredTeachers,
  getTeachersWithClassTeacherInfo,
  type TeacherFilters,
  type AssignClassTeacherRequest,
} from "./teachersFilters.api";

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

export const teacherFilterKeys = {
  all: ["teacherFilters"] as const,
  // Subjects
  subjects: () => [...teacherFilterKeys.all, "subjects"] as const,
  subjectMappings: () => [...teacherFilterKeys.all, "subjectMappings"] as const,
  teachersBySubjects: (subjectIds: number[]) =>
    [...teacherFilterKeys.all, "teachersBySubjects", subjectIds] as const,
  // Class Teachers
  classTeachers: () => [...teacherFilterKeys.all, "classTeachers"] as const,
  classTeacherIds: () => [...teacherFilterKeys.all, "classTeacherIds"] as const,
  isClassTeacher: (teacherId: number) =>
    [...teacherFilterKeys.all, "isClassTeacher", teacherId] as const,
  classForTeacher: (teacherId: number) =>
    [...teacherFilterKeys.all, "classForTeacher", teacherId] as const,
  // Classes
  allClasses: () => [...teacherFilterKeys.all, "allClasses"] as const,
  availableClasses: () => [...teacherFilterKeys.all, "availableClasses"] as const,
  // Filtered Teachers
  filteredTeachers: (filters: TeacherFilters) =>
    [...teacherFilterKeys.all, "filtered", filters] as const,
  teachersWithInfo: () => [...teacherFilterKeys.all, "withInfo"] as const,
};

// ============================================================================
// SUBJECT HOOKS
// ============================================================================

/**
 * Get all available subjects for filtering dropdown
 */
export function useSubjectList() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.subjects(),
    queryFn: getAllSubjects,
    staleTime: 10 * 60 * 1000, // 10 minutes - subjects don't change often
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Get teacher-subject mappings
 */
export function useTeacherSubjectMappings() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.subjectMappings(),
    queryFn: getTeacherSubjectMappings,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Get teacher IDs by subject IDs
 */
export function useTeacherIdsBySubjects(subjectIds: number[]) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.teachersBySubjects(subjectIds),
    queryFn: () => getTeacherIdsBySubjects(subjectIds),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && subjectIds.length > 0),
  });
}

// ============================================================================
// CLASS TEACHER HOOKS
// ============================================================================

/**
 * Get all class teacher assignments
 */
export function useClassTeacherAssignments() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.classTeachers(),
    queryFn: getClassTeacherAssignments,
    staleTime: 2 * 60 * 1000, // 2 minutes - can change frequently
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Get class teacher IDs only
 */
export function useClassTeacherIds() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.classTeacherIds(),
    queryFn: getClassTeacherIds,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Check if a specific teacher is a class teacher
 */
export function useIsClassTeacher(teacherId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.isClassTeacher(teacherId),
    queryFn: () => isTeacherClassTeacher(teacherId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && teacherId),
  });
}

/**
 * Get the class assigned to a specific teacher
 */
export function useClassForTeacher(teacherId: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.classForTeacher(teacherId),
    queryFn: () => getClassForTeacher(teacherId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config && teacherId),
  });
}

// ============================================================================
// CLASSES HOOKS
// ============================================================================

/**
 * Get all classes with assignment status
 */
export function useAllClasses() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.allClasses(),
    queryFn: getAllClasses,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Get available classes (without a class teacher)
 */
export function useAvailableClasses() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.availableClasses(),
    queryFn: getAvailableClasses,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Assign a teacher as class teacher
 */
export function useAssignClassTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignClassTeacherRequest) => assignClassTeacher(request),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.classTeachers() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.classTeacherIds() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.allClasses() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.availableClasses() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.teachersWithInfo() });
      // Also invalidate any filtered teacher queries
      queryClient.invalidateQueries({
        queryKey: teacherFilterKeys.all,
        predicate: (query) => query.queryKey.includes("filtered")
      });
    },
  });
}

/**
 * Remove class teacher assignment
 */
export function useRemoveClassTeacherAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: number) => removeClassTeacherAssignment(teacherId),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.classTeachers() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.classTeacherIds() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.allClasses() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.availableClasses() });
      queryClient.invalidateQueries({ queryKey: teacherFilterKeys.teachersWithInfo() });
    },
  });
}

// ============================================================================
// FILTERED TEACHERS HOOKS
// ============================================================================

/**
 * Get filtered teachers based on multiple criteria
 */
export function useFilteredTeachers(filters: TeacherFilters) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.filteredTeachers(filters),
    queryFn: () => getFilteredTeachers(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

/**
 * Get all teachers with class teacher badge info
 */
export function useTeachersWithClassTeacherInfo() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: teacherFilterKeys.teachersWithInfo(),
    queryFn: getTeachersWithClassTeacherInfo,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!(isAuthenticated && config),
  });
}

// ============================================================================
// COMBINED FILTER HOOK
// ============================================================================

/**
 * Combined hook for teacher filtering functionality
 * Provides subjects, class teacher IDs, and filter mutation
 */
export function useTeacherFilters() {
  const subjects = useSubjectList();
  const classTeacherIds = useClassTeacherIds();
  const classTeacherAssignments = useClassTeacherAssignments();

  return {
    subjects: subjects.data || [],
    subjectsLoading: subjects.isLoading,
    classTeacherIds: classTeacherIds.data || [],
    classTeacherIdsLoading: classTeacherIds.isLoading,
    classTeacherAssignments: classTeacherAssignments.data || [],
    classTeacherAssignmentsLoading: classTeacherAssignments.isLoading,
    isLoading: subjects.isLoading || classTeacherIds.isLoading || classTeacherAssignments.isLoading,
    isError: subjects.isError || classTeacherIds.isError || classTeacherAssignments.isError,
  };
}
