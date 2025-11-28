// ============================================================================
// PROXY (SUBSTITUTE TEACHER) API SERVICE
// ============================================================================
// API functions for teacher absence and substitute teacher management
// Uses mock data in demo mode, real API in production
// ============================================================================

import { isDemoMode, mockProxyProvider } from "../mockDataProviders";
import { http } from "./http";
import type { DayOfWeek } from "./timetable.schema";

// ============================================================================
// TYPES
// ============================================================================

export interface AbsentTeacher {
  teacherId: number;
  teacherName: string;
  subject: string;
  subjectId: number;
  classId: number;
  section: string;
  date: string;
  day: DayOfWeek;
  periodNo: number;
  periodTime: string;
  reason: string;
  entryId: number;
}

export interface AvailableTeacher {
  teacherId: number;
  teacherName: string;
  employeeCode: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  primarySubject: string;
  isFreeThisPeriod: boolean;
  currentLoad: number;
  maxLoad: number;
}

export interface ProxyAssignmentRequest {
  absentTeacherId: number;
  substituteTeacherId: number;
  classId: number;
  section: string;
  date: string;
  day: DayOfWeek;
  periodNo: number;
  entryId: number;
  reason?: string;
}

export interface ProxyAssignmentResponse {
  success: boolean;
  assignmentId: string;
  message: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const BASE = "/proxy";

/**
 * Get absent teachers for a specific class and date
 */
export async function getAbsentTeachers(params: {
  classId: number;
  section: string;
  date: string;
  weekStart: string;
}): Promise<AbsentTeacher[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockProxyProvider.getAbsentTeachers(params);
  }

  // Production: Call real API
  const { data } = await http.get<AbsentTeacher[]>(`${BASE}/absent-teachers`, {
    params: {
      class_id: params.classId,
      section: params.section,
      date: params.date,
      week_start: params.weekStart,
    },
  });
  return data;
}

/**
 * Get available teachers who can substitute for a specific period
 */
export async function getAvailableTeachers(params: {
  periodNo: number;
  date: string;
  day: DayOfWeek;
  classId: number;
  section: string;
  excludeTeacherId?: number;
}): Promise<AvailableTeacher[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockProxyProvider.getAvailableTeachers(params);
  }

  // Production: Call real API
  const { data } = await http.get<AvailableTeacher[]>(`${BASE}/available-teachers`, {
    params: {
      period_no: params.periodNo,
      date: params.date,
      day: params.day,
      class_id: params.classId,
      section: params.section,
      exclude_teacher_id: params.excludeTeacherId,
    },
  });
  return data;
}

/**
 * Assign a substitute teacher
 */
export async function assignProxy(
  request: ProxyAssignmentRequest
): Promise<ProxyAssignmentResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockProxyProvider.assignProxy(request);
  }

  // Production: Call real API
  const { data } = await http.post<ProxyAssignmentResponse>(`${BASE}/assign`, {
    absent_teacher_id: request.absentTeacherId,
    substitute_teacher_id: request.substituteTeacherId,
    class_id: request.classId,
    section: request.section,
    date: request.date,
    day: request.day,
    period_no: request.periodNo,
    entry_id: request.entryId,
    reason: request.reason,
  });
  return data;
}
