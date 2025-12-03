// ============================================================================
// TASK MANAGER API SERVICE
// ============================================================================
// API functions for Task Manager module
// Uses mock data in demo mode, real API in production
// ============================================================================

import { isDemoMode, mockTasksProvider } from "../mockDataProviders";
import { http } from "./http";
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
// API FUNCTIONS
// ============================================================================

const BASE = "/tasks";

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTasks(filters);
  }

  // Production: Call real API
  const { data } = await http.get<Task[]>(`${BASE}`, { params: filters });
  return data;
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTaskById(taskId);
  }

  // Production: Call real API
  const { data } = await http.get<Task>(`${BASE}/${taskId}`);
  return data;
}

/**
 * Get task KPIs for dashboard
 */
export async function getTaskKPIs(): Promise<TaskKPIs> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTaskKPIs();
  }

  // Production: Call real API
  const { data } = await http.get<TaskKPIs>(`${BASE}/kpis`);
  return data;
}

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.createTask(request);
  }

  // Production: Call real API
  const { data } = await http.post<Task>(`${BASE}`, request);
  return data;
}

/**
 * Update an existing task
 */
export async function updateTask(request: UpdateTaskRequest): Promise<Task> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.updateTask(request);
  }

  // Production: Call real API
  const { data } = await http.patch<Task>(`${BASE}/${request.taskId}`, request);
  return data;
}

/**
 * Get tasks for a specific teacher
 */
export async function getTasksForTeacher(teacherId: number): Promise<Task[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTasksForTeacher(teacherId);
  }

  // Production: Call real API
  const { data } = await http.get<Task[]>(`${BASE}/teacher/${teacherId}`);
  return data;
}

/**
 * Get tasks for a specific class
 */
export async function getTasksForClass(classTarget: string): Promise<Task[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTasksForClass(classTarget);
  }

  // Production: Call real API
  const { data } = await http.get<Task[]>(`${BASE}/class`, { params: { target: classTarget } });
  return data;
}

/**
 * Get task statistics for a specific teacher
 */
export async function getTeacherTaskStats(teacherId: number): Promise<TeacherTaskStats> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTeacherTaskStats(teacherId);
  }

  // Production: Call real API
  const { data } = await http.get<TeacherTaskStats>(`${BASE}/teacher/${teacherId}/stats`);
  return data;
}

/**
 * Get task status history
 */
export async function getTaskStatusHistory(taskId: string): Promise<TaskStatusHistory[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.getTaskStatusHistory(taskId);
  }

  // Production: Call real API
  const { data } = await http.get<TaskStatusHistory[]>(`${BASE}/${taskId}/history`);
  return data;
}

/**
 * Mark task as completed
 */
export async function markTaskCompleted(taskId: string): Promise<Task> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.markTaskCompleted(taskId);
  }

  // Production: Call real API
  const { data } = await http.post<Task>(`${BASE}/${taskId}/complete`);
  return data;
}

/**
 * Add teacher remarks to a task
 */
export async function addTeacherRemarks(taskId: string, remarks: string): Promise<Task> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.addTeacherRemarks(taskId, remarks);
  }

  // Production: Call real API
  const { data } = await http.post<Task>(`${BASE}/${taskId}/teacher-remarks`, { remarks });
  return data;
}

/**
 * Add admin remarks to a task
 */
export async function addAdminRemarks(taskId: string, remarks: string): Promise<Task> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTasksProvider.addAdminRemarks(taskId, remarks);
  }

  // Production: Call real API
  const { data } = await http.post<Task>(`${BASE}/${taskId}/admin-remarks`, { remarks });
  return data;
}

/**
 * Get available target options for task creation
 */
export function getAvailableTargets(): string[] {
  return mockTasksProvider.AVAILABLE_TARGETS;
}
