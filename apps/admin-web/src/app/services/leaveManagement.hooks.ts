// ============================================================================
// LEAVE MANAGEMENT REACT QUERY HOOKS
// ============================================================================
// React Query hooks for Leave Management and Proxy Assignment
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveRequests,
  getLeaveRequestById,
  getLeaveKPIs,
  approveLeave,
  rejectLeave,
  getTeacherTimetableForLeave,
  getAvailableSubstitutes,
  assignLeaveProxy,
  getLeaveProxyAssignments,
  markLeaveProxyComplete,
} from "./leaveManagement.api";
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
// QUERY KEYS
// ============================================================================

export const leaveManagementKeys = {
  all: ["leave-management"] as const,
  requests: (filters?: LeaveRequestFilters) => [...leaveManagementKeys.all, "requests", filters] as const,
  request: (leaveId: string) => [...leaveManagementKeys.all, "request", leaveId] as const,
  kpis: () => [...leaveManagementKeys.all, "kpis"] as const,
  teacherTimetable: (teacherId: number, date: string) =>
    [...leaveManagementKeys.all, "teacher-timetable", teacherId, date] as const,
  availableSubstitutes: (periodNo: number, date: string, excludeTeacherId: number) =>
    [...leaveManagementKeys.all, "available-substitutes", periodNo, date, excludeTeacherId] as const,
  proxyAssignments: (leaveId: string) => [...leaveManagementKeys.all, "proxy-assignments", leaveId] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all leave requests
 */
export function useLeaveRequests(filters?: LeaveRequestFilters, options?: { enabled?: boolean }) {
  return useQuery<LeaveRequest[], Error>({
    queryKey: leaveManagementKeys.requests(filters),
    queryFn: () => getLeaveRequests(filters),
    staleTime: 30_000, // 30 seconds
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch a single leave request by ID
 */
export function useLeaveRequest(leaveId: string, options?: { enabled?: boolean }) {
  return useQuery<LeaveRequest | null, Error>({
    queryKey: leaveManagementKeys.request(leaveId),
    queryFn: () => getLeaveRequestById(leaveId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!leaveId,
  });
}

/**
 * Hook to fetch leave management KPIs
 */
export function useLeaveKPIs(options?: { enabled?: boolean }) {
  return useQuery<LeaveManagementKPIs, Error>({
    queryKey: leaveManagementKeys.kpis(),
    queryFn: getLeaveKPIs,
    staleTime: 60_000, // 1 minute
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch teacher's timetable for a specific date
 */
export function useTeacherTimetableForLeave(
  teacherId: number,
  date: string,
  options?: { enabled?: boolean }
) {
  return useQuery<LeaveProxyPeriod[], Error>({
    queryKey: leaveManagementKeys.teacherTimetable(teacherId, date),
    queryFn: () => getTeacherTimetableForLeave(teacherId, date),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!teacherId && !!date,
  });
}

/**
 * Hook to fetch available substitute teachers for a specific period
 */
export function useAvailableSubstitutes(
  periodNo: number,
  date: string,
  excludeTeacherId: number,
  options?: { enabled?: boolean }
) {
  return useQuery<AvailableSubstituteTeacher[], Error>({
    queryKey: leaveManagementKeys.availableSubstitutes(periodNo, date, excludeTeacherId),
    queryFn: () => getAvailableSubstitutes(periodNo, date, excludeTeacherId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!periodNo && !!date && !!excludeTeacherId,
  });
}

/**
 * Hook to fetch proxy assignments for a leave
 */
export function useLeaveProxyAssignments(leaveId: string, options?: { enabled?: boolean }) {
  return useQuery<LeaveProxyAssignment[], Error>({
    queryKey: leaveManagementKeys.proxyAssignments(leaveId),
    queryFn: () => getLeaveProxyAssignments(leaveId),
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && !!leaveId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to approve a leave request
 */
export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, ApproveLeaveRequest>({
    mutationFn: (request) => approveLeave(request),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
      // Update specific leave request cache
      queryClient.setQueryData(leaveManagementKeys.request(data.leaveId), data);
    },
  });
}

/**
 * Hook to reject a leave request
 */
export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, RejectLeaveRequest>({
    mutationFn: (request) => rejectLeave(request),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
      // Update specific leave request cache
      queryClient.setQueryData(leaveManagementKeys.request(data.leaveId), data);
    },
  });
}

/**
 * Hook to assign a substitute teacher for a leave period
 */
export function useAssignLeaveProxy() {
  const queryClient = useQueryClient();

  return useMutation<AssignLeaveProxyResponse, Error, AssignLeaveProxyRequest>({
    mutationFn: (request) => assignLeaveProxy(request),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.teacherTimetable(0, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: leaveManagementKeys.proxyAssignments(variables.leaveId),
      });
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.kpis() });
    },
  });
}

/**
 * Hook to mark a leave as fully proxy-assigned
 */
export function useMarkLeaveProxyComplete() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, string>({
    mutationFn: (leaveId) => markLeaveProxyComplete(leaveId),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: leaveManagementKeys.all });
      // Update specific leave request cache
      queryClient.setQueryData(leaveManagementKeys.request(data.leaveId), data);
    },
  });
}
