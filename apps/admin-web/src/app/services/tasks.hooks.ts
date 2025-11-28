// ============================================================================
// TASK MANAGER REACT QUERY HOOKS
// ============================================================================
// React Query hooks for Task Manager module
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getTaskById,
  getTaskKPIs,
  createTask,
  updateTask,
  getTasksForTeacher,
  getTasksForClass,
  getTeacherTaskStats,
  getTaskStatusHistory,
  markTaskCompleted,
  addTeacherRemarks,
  addAdminRemarks,
} from "./tasks.api";
import type {
  Task,
  TaskKPIs,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TeacherTaskStats,
  TaskStatusHistory,
} from "../mockDataProviders/mockTasks";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
  kpis: () => [...taskKeys.all, "kpis"] as const,
  teacherTasks: (teacherId: number) => [...taskKeys.all, "teacher", teacherId] as const,
  teacherStats: (teacherId: number) => [...taskKeys.all, "teacher-stats", teacherId] as const,
  classTasks: (classTarget: string) => [...taskKeys.all, "class", classTarget] as const,
  history: (taskId: string) => [...taskKeys.all, "history", taskId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all tasks with optional filters
 */
export function useTasks(filters?: TaskFilters, options?: { enabled?: boolean }) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.list(filters),
    queryFn: () => getTasks(filters),
    staleTime: 30_000, // 30 seconds
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(taskId: string, options?: { enabled?: boolean }) {
  return useQuery<Task | null, Error>({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskById(taskId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!taskId,
  });
}

/**
 * Hook to fetch task KPIs
 */
export function useTaskKPIs(options?: { enabled?: boolean }) {
  return useQuery<TaskKPIs, Error>({
    queryKey: taskKeys.kpis(),
    queryFn: getTaskKPIs,
    staleTime: 60_000, // 1 minute
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch tasks for a specific teacher
 */
export function useTeacherTasks(teacherId: number, options?: { enabled?: boolean }) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.teacherTasks(teacherId),
    queryFn: () => getTasksForTeacher(teacherId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!teacherId,
  });
}

/**
 * Hook to fetch teacher task statistics
 */
export function useTeacherTaskStats(teacherId: number, options?: { enabled?: boolean }) {
  return useQuery<TeacherTaskStats, Error>({
    queryKey: taskKeys.teacherStats(teacherId),
    queryFn: () => getTeacherTaskStats(teacherId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!teacherId,
  });
}

/**
 * Hook to fetch tasks for a specific class
 */
export function useClassTasks(classTarget: string, options?: { enabled?: boolean }) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.classTasks(classTarget),
    queryFn: () => getTasksForClass(classTarget),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!classTarget,
  });
}

/**
 * Hook to fetch task status history
 */
export function useTaskStatusHistory(taskId: string, options?: { enabled?: boolean }) {
  return useQuery<TaskStatusHistory[], Error>({
    queryKey: taskKeys.history(taskId),
    queryFn: () => getTaskStatusHistory(taskId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!taskId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskRequest>({
    mutationFn: (request) => createTask(request),
    onSuccess: () => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Hook to update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateTaskRequest>({
    mutationFn: (request) => updateTask(request),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Update specific task cache
      queryClient.setQueryData(taskKeys.detail(data.taskId), data);
    },
  });
}

/**
 * Hook to mark a task as completed
 */
export function useMarkTaskCompleted() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, string>({
    mutationFn: (taskId) => markTaskCompleted(taskId),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Update specific task cache
      queryClient.setQueryData(taskKeys.detail(data.taskId), data);
    },
  });
}

/**
 * Hook to add teacher remarks to a task
 */
export function useAddTeacherRemarks() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: string; remarks: string }>({
    mutationFn: ({ taskId, remarks }) => addTeacherRemarks(taskId, remarks),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Update specific task cache
      queryClient.setQueryData(taskKeys.detail(data.taskId), data);
    },
  });
}

/**
 * Hook to add admin remarks to a task
 */
export function useAddAdminRemarks() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: string; remarks: string }>({
    mutationFn: ({ taskId, remarks }) => addAdminRemarks(taskId, remarks),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Update specific task cache
      queryClient.setQueryData(taskKeys.detail(data.taskId), data);
    },
  });
}
