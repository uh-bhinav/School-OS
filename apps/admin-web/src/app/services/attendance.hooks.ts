// services/attendance.hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAttendance, createAttendance, updateAttendance, deleteAttendance,
  createBulkAttendance, getClassRange, getClassWeeklySummary, getStudentHistory
} from "./attendance.api";

// Query keys factory for consistent cache management
const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (filters: any) => [...attendanceKeys.lists(), filters] as const,
  ranges: () => [...attendanceKeys.all, "range"] as const,
  range: (classId: number, from: string, to: string) => [...attendanceKeys.ranges(), classId, from, to] as const,
  weeklies: () => [...attendanceKeys.all, "weekly"] as const,
  weekly: (classId: number, week?: string) => [...attendanceKeys.weeklies(), classId, week] as const,
  students: () => [...attendanceKeys.all, "student"] as const,
  student: (studentId: number) => [...attendanceKeys.students(), studentId] as const,
};

export function useAttendanceList(q: { class_id?: number; date?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: attendanceKeys.list(q),
    queryFn: () => listAttendance(q),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!q.class_id, // Only fetch when class is selected
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
      qc.invalidateQueries({ queryKey: attendanceKeys.ranges() });
      qc.invalidateQueries({ queryKey: attendanceKeys.weeklies() });
    },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attendance_id, patch }: { attendance_id: number; patch: any }) =>
      updateAttendance(attendance_id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
      qc.invalidateQueries({ queryKey: attendanceKeys.ranges() });
      qc.invalidateQueries({ queryKey: attendanceKeys.weeklies() });
    },
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
      qc.invalidateQueries({ queryKey: attendanceKeys.ranges() });
      qc.invalidateQueries({ queryKey: attendanceKeys.weeklies() });
    },
  });
}

export function useBulkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBulkAttendance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
      qc.invalidateQueries({ queryKey: attendanceKeys.ranges() });
      qc.invalidateQueries({ queryKey: attendanceKeys.weeklies() });
    },
  });
}

export const useClassRange = (class_id: number, from: string, to: string) =>
  useQuery({
    queryKey: attendanceKeys.range(class_id, from, to),
    queryFn: () => getClassRange(class_id, from, to),
    staleTime: 5 * 60 * 1000, // 5 minutes (less frequent updates)
    enabled: !!class_id && !!from && !!to,
  });

export const useWeeklySummary = (class_id: number, week?: string) =>
  useQuery({
    queryKey: attendanceKeys.weekly(class_id, week),
    queryFn: () => getClassWeeklySummary(class_id, week),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!class_id,
  });

export const useStudentHistory = (student_id?: number) =>
  useQuery({
    enabled: !!student_id,
    queryKey: attendanceKeys.student(student_id!),
    queryFn: () => getStudentHistory(student_id!),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
