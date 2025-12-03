/**
 * Classes React Query Hooks
 * Provides data fetching and mutation hooks for classes
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Class,
  ClassDetail,
  ClassKpi,
  ClassStudent,
  ClassTimetableSlot,
  ClassSubjectMapping,
  ClassRankListEntry,
  ClassLeaderboardEntry,
} from "./classes.schema";
import {
  getClasses,
  getClassById,
  getClassKPI,
  assignTeacherToClass,
  getClassStudents,
  getClassTimetable,
  getClassSubjectMappings,
  updateClassSubjectMapping,
  getClassRankList,
  getClassLeaderboard,
} from "./classes.api";

// Query keys
export const classesKeys = {
  all: ["classes"] as const,
  lists: () => [...classesKeys.all, "list"] as const,
  list: (schoolId: number) => [...classesKeys.lists(), schoolId] as const,
  details: () => [...classesKeys.all, "detail"] as const,
  detail: (classId: number) => [...classesKeys.details(), classId] as const,
  kpi: (schoolId: number) => [...classesKeys.all, "kpi", schoolId] as const,
  students: (classId: number) => [...classesKeys.all, "students", classId] as const,
  timetable: (classId: number) => [...classesKeys.all, "timetable", classId] as const,
  subjectMapping: (classId: number) => [...classesKeys.all, "subjectMapping", classId] as const,
  rankList: (classId: number) => [...classesKeys.all, "rankList", classId] as const,
  leaderboard: (classId: number) => [...classesKeys.all, "leaderboard", classId] as const,
};

/**
 * Hook to fetch all classes
 */
export function useClasses(schoolId: number = 1) {
  return useQuery<Class[], Error>({
    queryKey: classesKeys.list(schoolId),
    queryFn: () => getClasses(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single class by ID
 */
export function useClassById(classId: number) {
  return useQuery<ClassDetail | null, Error>({
    queryKey: classesKeys.detail(classId),
    queryFn: () => getClassById(classId),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch class KPIs
 */
export function useClassKPI(schoolId: number = 1) {
  return useQuery<ClassKpi, Error>({
    queryKey: classesKeys.kpi(schoolId),
    queryFn: () => getClassKPI(schoolId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch students in a class
 */
export function useClassStudents(classId: number) {
  return useQuery<ClassStudent[], Error>({
    queryKey: classesKeys.students(classId),
    queryFn: () => getClassStudents(classId),
    enabled: !!classId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook to fetch class timetable
 */
export function useClassTimetable(classId: number) {
  return useQuery<ClassTimetableSlot[], Error>({
    queryKey: classesKeys.timetable(classId),
    queryFn: () => getClassTimetable(classId),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch class subject mappings
 */
export function useClassSubjectMapping(classId: number) {
  return useQuery<ClassSubjectMapping[], Error>({
    queryKey: classesKeys.subjectMapping(classId),
    queryFn: () => getClassSubjectMappings(classId),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch class rank list
 */
export function useClassRankList(classId: number) {
  return useQuery<ClassRankListEntry[], Error>({
    queryKey: classesKeys.rankList(classId),
    queryFn: () => getClassRankList(classId),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch class leaderboard
 */
export function useClassLeaderboard(classId: number) {
  return useQuery<ClassLeaderboardEntry[], Error>({
    queryKey: classesKeys.leaderboard(classId),
    queryFn: () => getClassLeaderboard(classId),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to assign class teacher
 */
export function useAssignClassTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, teacherId }: { classId: number; teacherId: number }) =>
      assignTeacherToClass(classId, teacherId),
    onSuccess: (_, { classId }) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classesKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: classesKeys.kpi(1) });
    },
  });
}

/**
 * Hook to update subject mapping
 */
export function useUpdateSubjectMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mappingId, teacherId }: { mappingId: number; teacherId: number }) =>
      updateClassSubjectMapping(mappingId, teacherId),
    onSuccess: () => {
      // Invalidate subject mapping queries
      // We need to find which class this mapping belongs to
      // For simplicity, invalidate all subject mapping queries
      queryClient.invalidateQueries({ queryKey: [...classesKeys.all, "subjectMapping"] });
    },
  });
}
