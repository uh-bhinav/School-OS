// ============================================================================
// LEAVE MANAGEMENT API SERVICE
// ============================================================================
// API functions for Leave Management and Proxy Assignment
// Uses mock data in demo mode, real API in production
// ============================================================================

import { isDemoMode, mockLeaveManagementProvider } from "../mockDataProviders";
import { http } from "./http";
import type {
  LeaveRequest,
  LeaveManagementKPIs,
  LeaveProxyPeriod,
  LeaveProxyAssignment,
  AvailableSubstituteTeacher,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  AssignLeaveProxyRequest,
  AssignLeaveProxyResponse,
  LeaveRequestFilters,
} from "./leaveManagement.schema";

// ============================================================================
// API FUNCTIONS
// ============================================================================

const BASE = "/leave-management";

/**
 * Get all leave requests with optional filters
 */
export async function getLeaveRequests(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getLeaveRequests(filters);
  }

  // Production: Call real API
  const { data } = await http.get<LeaveRequest[]>(`${BASE}/requests`, { params: filters });
  return data;
}

/**
 * Get a single leave request by ID
 */
export async function getLeaveRequestById(leaveId: string): Promise<LeaveRequest | null> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getLeaveRequestById(leaveId);
  }

  // Production: Call real API
  const { data } = await http.get<LeaveRequest>(`${BASE}/requests/${leaveId}`);
  return data;
}

/**
 * Get KPIs for leave management dashboard
 */
export async function getLeaveKPIs(): Promise<LeaveManagementKPIs> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getLeaveKPIs();
  }

  // Production: Call real API
  const { data } = await http.get<LeaveManagementKPIs>(`${BASE}/kpis`);
  return data;
}

/**
 * Approve a leave request
 */
export async function approveLeave(request: ApproveLeaveRequest): Promise<LeaveRequest> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.approveLeave(request);
  }

  // Production: Call real API
  const { data } = await http.post<LeaveRequest>(`${BASE}/requests/${request.leaveId}/approve`, {
    approved_by: request.approvedBy,
  });
  return data;
}

/**
 * Reject a leave request
 */
export async function rejectLeave(request: RejectLeaveRequest): Promise<LeaveRequest> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.rejectLeave(request);
  }

  // Production: Call real API
  const { data } = await http.post<LeaveRequest>(`${BASE}/requests/${request.leaveId}/reject`, {
    rejected_by: request.rejectedBy,
    rejection_reason: request.rejectionReason,
  });
  return data;
}

/**
 * Get teacher's timetable for a specific date (for proxy assignment)
 */
export async function getTeacherTimetableForLeave(
  teacherId: number,
  date: string
): Promise<LeaveProxyPeriod[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getTeacherTimetableForLeave(teacherId, date);
  }

  // Production: Call real API
  const { data } = await http.get<LeaveProxyPeriod[]>(`${BASE}/teacher-timetable`, {
    params: { teacher_id: teacherId, date },
  });
  return data;
}

/**
 * Get available substitute teachers for a specific period
 */
export async function getAvailableSubstitutes(
  periodNo: number,
  date: string,
  excludeTeacherId: number
): Promise<AvailableSubstituteTeacher[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getAvailableSubstitutes(periodNo, date, excludeTeacherId);
  }

  // Production: Call real API
  const { data } = await http.get<AvailableSubstituteTeacher[]>(`${BASE}/available-substitutes`, {
    params: {
      period_no: periodNo,
      date,
      exclude_teacher_id: excludeTeacherId,
    },
  });
  return data;
}

/**
 * Assign a substitute teacher for a leave period
 */
export async function assignLeaveProxy(
  request: AssignLeaveProxyRequest
): Promise<AssignLeaveProxyResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.assignLeaveProxy(request);
  }

  // Production: Call real API
  const { data } = await http.post<AssignLeaveProxyResponse>(`${BASE}/assign-proxy`, {
    leave_id: request.leaveId,
    date: request.date,
    period_no: request.periodNo,
    substitute_teacher_id: request.substituteTeacherId,
    substitute_teacher_name: request.substituteTeacherName,
  });
  return data;
}

/**
 * Get all proxy assignments for a leave
 */
export async function getLeaveProxyAssignments(leaveId: string): Promise<LeaveProxyAssignment[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.getLeaveProxyAssignments(leaveId);
  }

  // Production: Call real API
  const { data } = await http.get<LeaveProxyAssignment[]>(`${BASE}/requests/${leaveId}/proxy-assignments`);
  return data;
}

/**
 * Mark leave as fully proxy-assigned
 */
export async function markLeaveProxyComplete(leaveId: string): Promise<LeaveRequest> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockLeaveManagementProvider.markLeaveProxyComplete(leaveId);
  }

  // Production: Call real API
  const { data } = await http.post<LeaveRequest>(`${BASE}/requests/${leaveId}/mark-proxy-complete`);
  return data;
}
