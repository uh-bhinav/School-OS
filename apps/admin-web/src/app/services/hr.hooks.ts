// ============================================================================
// HR HOOKS
// ============================================================================
// React Query hooks for HR module

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as hrApi from "./hr.api";
import type {
  StaffUpdate,
  DepartmentUpdate,
  StaffAttendanceCreate,
} from "./hr.schema";

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

const hrKeys = {
  all: ["hr"] as const,

  // STAFF
  staff: () => [...hrKeys.all, "staff"] as const,
  staffList: () => [...hrKeys.staff(), "list"] as const,
  staffById: (id: number) => [...hrKeys.staff(), id] as const,
  staffByDept: (deptId: number) => [...hrKeys.staff(), "dept", deptId] as const,

  // DEPARTMENTS
  departments: () => [...hrKeys.all, "departments"] as const,
  deptList: () => [...hrKeys.departments(), "list"] as const,
  deptById: (id: number) => [...hrKeys.departments(), id] as const,

  // ATTENDANCE
  attendance: () => [...hrKeys.all, "attendance"] as const,
  attendanceByDate: (date: string) => [...hrKeys.attendance(), "date", date] as const,
  attendanceByStaff: (staffId: number, from?: string, to?: string) =>
    [...hrKeys.attendance(), "staff", staffId, from, to] as const,
  attendanceByDept: (deptId: number, date: string) =>
    [...hrKeys.attendance(), "dept", deptId, date] as const,
  attendanceStats: (date: string) => [...hrKeys.attendance(), "stats", date] as const,

  // LEAVE REQUESTS
  leaves: () => [...hrKeys.all, "leaves"] as const,
  leaveList: () => [...hrKeys.leaves(), "list"] as const,
  leaveById: (id: number) => [...hrKeys.leaves(), id] as const,
  leaveByStaff: (staffId: number) => [...hrKeys.leaves(), "staff", staffId] as const,
  leaveByStatus: (status: string) => [...hrKeys.leaves(), "status", status] as const,
  leavePending: () => [...hrKeys.leaves(), "pending"] as const,

  // PROXY ASSIGNMENTS
  proxies: () => [...hrKeys.all, "proxies"] as const,
  proxyList: () => [...hrKeys.proxies(), "list"] as const,
  proxyById: (id: number) => [...hrKeys.proxies(), id] as const,
  proxyByLeave: (leaveId: number) => [...hrKeys.proxies(), "leave", leaveId] as const,
  proxyByStaff: (staffId: number) => [...hrKeys.proxies(), "staff", staffId] as const,

  // ANALYTICS
  analytics: () => [...hrKeys.all, "analytics"] as const,
  staffKpi: () => [...hrKeys.analytics(), "kpi"] as const,
  hrAnalytics: () => [...hrKeys.analytics(), "hr"] as const,
};

// ============================================================================
// STAFF HOOKS
// ============================================================================

export const useAllStaff = () =>
  useQuery({
    queryKey: hrKeys.staffList(),
    queryFn: hrApi.getAllStaff,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useStaffById = (staffId?: number) =>
  useQuery({
    queryKey: hrKeys.staffById(staffId!),
    queryFn: () => hrApi.getStaffById(staffId!),
    enabled: !!staffId,
    staleTime: 5 * 60 * 1000,
  });

export const useStaffByDepartment = (deptId?: number) =>
  useQuery({
    queryKey: hrKeys.staffByDept(deptId!),
    queryFn: () => hrApi.getStaffByDepartment(deptId!),
    enabled: !!deptId,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.staffList() });
    },
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: number; data: StaffUpdate }) =>
      hrApi.updateStaff(staffId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.staff() });
    },
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.deleteStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.staffList() });
    },
  });
};

// ============================================================================
// DEPARTMENT HOOKS
// ============================================================================

export const useAllDepartments = () =>
  useQuery({
    queryKey: hrKeys.deptList(),
    queryFn: hrApi.getAllDepartments,
    staleTime: 5 * 60 * 1000,
  });

export const useDepartmentById = (deptId?: number) =>
  useQuery({
    queryKey: hrKeys.deptById(deptId!),
    queryFn: () => hrApi.getDepartmentById(deptId!),
    enabled: !!deptId,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.deptList() });
    },
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deptId, data }: { deptId: number; data: DepartmentUpdate }) =>
      hrApi.updateDepartment(deptId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.departments() });
    },
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.deleteDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.deptList() });
    },
  });
};

export const useAssignHOD = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deptId, staffId }: { deptId: number; staffId: number }) =>
      hrApi.assignHOD(deptId, staffId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.departments() });
    },
  });
};

// ============================================================================
// STAFF ATTENDANCE HOOKS
// ============================================================================

export const useAllStaffAttendance = () =>
  useQuery({
    queryKey: hrKeys.attendance(),
    queryFn: hrApi.getAllStaffAttendance,
    staleTime: 2 * 60 * 1000,
  });

export const useStaffAttendanceForDate = (date?: string) =>
  useQuery({
    queryKey: hrKeys.attendanceByDate(date!),
    queryFn: () => hrApi.getStaffAttendanceForDate(date!),
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  });

export const useStaffAttendanceForStaff = (staffId?: number, fromDate?: string, toDate?: string) =>
  useQuery({
    queryKey: hrKeys.attendanceByStaff(staffId!, fromDate, toDate),
    queryFn: () => hrApi.getStaffAttendanceForStaff(staffId!, fromDate, toDate),
    enabled: !!staffId,
    staleTime: 3 * 60 * 1000,
  });

export const useStaffAttendanceForDepartment = (deptId?: number, date?: string) =>
  useQuery({
    queryKey: hrKeys.attendanceByDept(deptId!, date!),
    queryFn: () => hrApi.getStaffAttendanceForDepartment(deptId!, date!),
    enabled: !!deptId && !!date,
    staleTime: 2 * 60 * 1000,
  });

export const useStaffAttendanceStats = (date?: string) =>
  useQuery({
    queryKey: hrKeys.attendanceStats(date!),
    queryFn: () => hrApi.getStaffAttendanceStats(date!),
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  });

export const useCreateStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createStaffAttendance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.attendance() });
    },
  });
};

export const useUpdateStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, patch }: { attendanceId: number; patch: Partial<StaffAttendanceCreate> }) =>
      hrApi.updateStaffAttendance(attendanceId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.attendance() });
    },
  });
};

export const useDeleteStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.deleteStaffAttendance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.attendance() });
    },
  });
};

// ============================================================================
// LEAVE REQUEST HOOKS
// ============================================================================

export const useAllLeaveRequests = () =>
  useQuery({
    queryKey: hrKeys.leaveList(),
    queryFn: hrApi.getAllLeaveRequests,
    staleTime: 5 * 60 * 1000,
  });

export const useLeaveRequestById = (leaveId?: number) =>
  useQuery({
    queryKey: hrKeys.leaveById(leaveId!),
    queryFn: () => hrApi.getLeaveRequestById(leaveId!),
    enabled: !!leaveId,
    staleTime: 5 * 60 * 1000,
  });

export const useLeaveRequestsByStaff = (staffId?: number) =>
  useQuery({
    queryKey: hrKeys.leaveByStaff(staffId!),
    queryFn: () => hrApi.getLeaveRequestsByStaff(staffId!),
    enabled: !!staffId,
    staleTime: 5 * 60 * 1000,
  });

export const useLeaveRequestsByStatus = (status?: string) =>
  useQuery({
    queryKey: hrKeys.leaveByStatus(status!),
    queryFn: () => hrApi.getLeaveRequestsByStatus(status as any),
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });

export const usePendingLeaveRequests = () =>
  useQuery({
    queryKey: hrKeys.leavePending(),
    queryFn: hrApi.getPendingLeaveRequests,
    staleTime: 3 * 60 * 1000,
  });

export const useCreateLeaveRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createLeaveRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.leaveList() });
    },
  });
};

export const useApproveLeaveRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leaveId, approvedBy }: { leaveId: number; approvedBy: string }) =>
      hrApi.approveLeaveRequest(leaveId, approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.leaves() });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leaveId, reason }: { leaveId: number; reason: string }) =>
      hrApi.rejectLeaveRequest(leaveId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.leaves() });
    },
  });
};

// ============================================================================
// PROXY ASSIGNMENT HOOKS
// ============================================================================

export const useAllProxyAssignments = () =>
  useQuery({
    queryKey: hrKeys.proxyList(),
    queryFn: hrApi.getAllProxyAssignments,
    staleTime: 5 * 60 * 1000,
  });

export const useProxyAssignmentById = (proxyId?: number) =>
  useQuery({
    queryKey: hrKeys.proxyById(proxyId!),
    queryFn: () => hrApi.getProxyAssignmentById(proxyId!),
    enabled: !!proxyId,
    staleTime: 5 * 60 * 1000,
  });

export const useProxyAssignmentsByLeaveRequest = (leaveId?: number) =>
  useQuery({
    queryKey: hrKeys.proxyByLeave(leaveId!),
    queryFn: () => hrApi.getProxyAssignmentsByLeaveRequest(leaveId!),
    enabled: !!leaveId,
    staleTime: 5 * 60 * 1000,
  });

export const useProxyAssignmentsByStaff = (staffId?: number) =>
  useQuery({
    queryKey: hrKeys.proxyByStaff(staffId!),
    queryFn: () => hrApi.getProxyAssignmentsByStaff(staffId!),
    enabled: !!staffId,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateProxyAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createProxyAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.proxies() });
    },
  });
};

export const useAcceptProxyAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.acceptProxyAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.proxies() });
    },
  });
};

export const useDeclineProxyAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.declineProxyAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.proxies() });
    },
  });
};

export const useDeleteProxyAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hrApi.deleteProxyAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrKeys.proxyList() });
    },
  });
};

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export const useStaffKPI = () =>
  useQuery({
    queryKey: hrKeys.staffKpi(),
    queryFn: hrApi.getStaffKPI,
    staleTime: 10 * 60 * 1000,
  });

export const useHRAnalytics = () =>
  useQuery({
    queryKey: hrKeys.hrAnalytics(),
    queryFn: hrApi.getHRAnalytics,
    staleTime: 10 * 60 * 1000,
  });
