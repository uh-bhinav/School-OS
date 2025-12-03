// ============================================================================
// HR API SERVICE
// ============================================================================
// Provides HR module functions with demo mode support
// Follows the pattern of attendance.api.ts and teachers.api.ts

import { isDemoMode } from "../mockDataProviders";
import { mockStaffProvider } from "../mockDataProviders/mockStaff";
import { mockDepartmentsProvider } from "../mockDataProviders/mockDepartments";
import { mockStaffAttendanceProvider } from "../mockDataProviders/mockStaffAttendance";
import { mockLeaveRequestsProvider } from "../mockDataProviders/mockLeaveRequests";
import { mockProxyAssignmentsProvider } from "../mockDataProviders/mockProxyAssignments";

import type {
  Staff,
  StaffCreate,
  StaffUpdate,
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  StaffAttendance,
  StaffAttendanceCreate,
  LeaveRequest,
  LeaveRequestCreate,
  LeaveStatus,
  ProxyAssignment,
  ProxyAssignmentCreate,
  StaffKPI,
  HRAnalytics,
} from "./hr.schema";

// ============================================================================
// STAFF MANAGEMENT APIs
// ============================================================================

export async function getAllStaff(): Promise<Staff[]> {
  if (isDemoMode()) {
    return mockStaffProvider.getAll();
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffById(staffId: number): Promise<Staff | null> {
  if (isDemoMode()) {
    return mockStaffProvider.getById(staffId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffByDepartment(departmentId: number): Promise<Staff[]> {
  if (isDemoMode()) {
    return mockStaffProvider.getByDepartment(departmentId);
  }
  throw new Error("Real API not implemented yet");
}

export async function createStaff(payload: StaffCreate): Promise<Staff> {
  if (isDemoMode()) {
    return mockStaffProvider.create(payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function updateStaff(staffId: number, payload: StaffUpdate): Promise<Staff> {
  if (isDemoMode()) {
    return mockStaffProvider.update(staffId, payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function deleteStaff(staffId: number): Promise<void> {
  if (isDemoMode()) {
    return mockStaffProvider.delete(staffId);
  }
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// DEPARTMENT MANAGEMENT APIs
// ============================================================================

export async function getAllDepartments(): Promise<Department[]> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.getAll();
  }
  throw new Error("Real API not implemented yet");
}

export async function getDepartmentById(departmentId: number): Promise<Department | null> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.getById(departmentId);
  }
  throw new Error("Real API not implemented yet");
}

export async function createDepartment(payload: DepartmentCreate): Promise<Department> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.create(payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function updateDepartment(
  departmentId: number,
  payload: DepartmentUpdate
): Promise<Department> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.update(departmentId, payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function deleteDepartment(departmentId: number): Promise<void> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.delete(departmentId);
  }
  throw new Error("Real API not implemented yet");
}

export async function assignHOD(departmentId: number, staffId: number): Promise<Department> {
  if (isDemoMode()) {
    return mockDepartmentsProvider.assignHOD(departmentId, staffId);
  }
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// STAFF ATTENDANCE APIs
// ============================================================================

export async function getAllStaffAttendance(): Promise<StaffAttendance[]> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.getAll();
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffAttendanceForDate(date: string): Promise<StaffAttendance[]> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.getForDate(date);
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffAttendanceForStaff(
  staffId: number,
  fromDate?: string,
  toDate?: string
): Promise<StaffAttendance[]> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.getForStaff(staffId, fromDate, toDate);
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffAttendanceForDepartment(
  departmentId: number,
  date: string
): Promise<StaffAttendance[]> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.getForDepartment(departmentId, date);
  }
  throw new Error("Real API not implemented yet");
}

export async function createStaffAttendance(payload: StaffAttendanceCreate): Promise<StaffAttendance> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.create(payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function updateStaffAttendance(
  attendanceId: number,
  patch: Partial<StaffAttendanceCreate>
): Promise<StaffAttendance> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.update(attendanceId, patch);
  }
  throw new Error("Real API not implemented yet");
}

export async function deleteStaffAttendance(attendanceId: number): Promise<void> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.delete(attendanceId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getStaffAttendanceStats(date: string): Promise<{
  total: number;
  present: number;
  absent: number;
  half_day: number;
  on_leave: number;
  late_arrival: number;
  early_departure: number;
}> {
  if (isDemoMode()) {
    return mockStaffAttendanceProvider.getStats(date);
  }
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// LEAVE REQUEST APIs
// ============================================================================

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.getAll();
  }
  throw new Error("Real API not implemented yet");
}

export async function getLeaveRequestById(leaveId: number): Promise<LeaveRequest | null> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.getById(leaveId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getLeaveRequestsByStaff(staffId: number): Promise<LeaveRequest[]> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.getByStaff(staffId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getLeaveRequestsByStatus(status: LeaveStatus): Promise<LeaveRequest[]> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.getByStatus(status);
  }
  throw new Error("Real API not implemented yet");
}

export async function createLeaveRequest(payload: LeaveRequestCreate): Promise<LeaveRequest> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.create(payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function approveLeaveRequest(
  leaveId: number,
  approvedBy: string
): Promise<LeaveRequest> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.approve(leaveId, approvedBy);
  }
  throw new Error("Real API not implemented yet");
}

export async function rejectLeaveRequest(
  leaveId: number,
  rejectionReason: string
): Promise<LeaveRequest> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.reject(leaveId, rejectionReason);
  }
  throw new Error("Real API not implemented yet");
}

export async function getPendingLeaveRequests(): Promise<LeaveRequest[]> {
  if (isDemoMode()) {
    return mockLeaveRequestsProvider.getPending();
  }
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// PROXY ASSIGNMENT APIs
// ============================================================================

export async function getAllProxyAssignments(): Promise<ProxyAssignment[]> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.getAll();
  }
  throw new Error("Real API not implemented yet");
}

export async function getProxyAssignmentById(proxyId: number): Promise<ProxyAssignment | null> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.getById(proxyId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getProxyAssignmentsByLeaveRequest(leaveRequestId: number): Promise<ProxyAssignment[]> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.getByLeaveRequest(leaveRequestId);
  }
  throw new Error("Real API not implemented yet");
}

export async function getProxyAssignmentsByStaff(staffId: number): Promise<ProxyAssignment[]> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.getByStaff(staffId);
  }
  throw new Error("Real API not implemented yet");
}

export async function createProxyAssignment(payload: ProxyAssignmentCreate): Promise<ProxyAssignment> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.create(payload);
  }
  throw new Error("Real API not implemented yet");
}

export async function acceptProxyAssignment(proxyId: number): Promise<ProxyAssignment> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.accept(proxyId);
  }
  throw new Error("Real API not implemented yet");
}

export async function declineProxyAssignment(proxyId: number): Promise<ProxyAssignment> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.decline(proxyId);
  }
  throw new Error("Real API not implemented yet");
}

export async function deleteProxyAssignment(proxyId: number): Promise<void> {
  if (isDemoMode()) {
    return mockProxyAssignmentsProvider.delete(proxyId);
  }
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// ANALYTICS & KPI APIs
// ============================================================================

export async function getStaffKPI(): Promise<StaffKPI> {
  if (isDemoMode()) {
    const staff = await getAllStaff();
    const today = new Date().toISOString().split("T")[0];
    const attendance = await getStaffAttendanceForDate(today);
    const depts = await getAllDepartments();
    const leaves = await getPendingLeaveRequests();

    const active = staff.filter((s) => s.employment_status === "Active").length;
    const onLeave = staff.filter((s) => s.employment_status === "On Leave").length;
    const absentToday = attendance.filter((a) => a.status === "Absent").length;
    const avgExp = Math.round(
      staff.reduce((sum, s) => sum + (s.experience_years || 0), 0) / staff.length
    );

    return {
      total_staff: staff.length,
      active_staff: active,
      on_leave: onLeave,
      absent_today: absentToday,
      avg_experience_years: avgExp,
      total_departments: depts.length,
      pending_leaves: leaves.length,
    };
  }
  throw new Error("Real API not implemented yet");
}

export async function getHRAnalytics(): Promise<HRAnalytics> {
  if (isDemoMode()) {
    const staff = await getAllStaff();
    const today = new Date().toISOString().split("T")[0];
    const attendance = await getStaffAttendanceForDate(today);
    const depts = await getAllDepartments();
    const leaves = await getPendingLeaveRequests();

    const active = staff.filter((s) => s.employment_status === "Active").length;
    const onLeave = staff.filter((s) => s.employment_status === "On Leave").length;
    const absentToday = attendance.filter((a) => a.status === "Absent").length;
    const avgExp = Math.round(
      staff.reduce((sum, s) => sum + (s.experience_years || 0), 0) / staff.length
    );
    const deptsWithHOD = depts.filter((d) => d.hod_staff_id).length;

    // Compute role distribution
    const staffByRole: Record<string, number> = {};
    staff.forEach((s) => {
      staffByRole[s.role] = (staffByRole[s.role] || 0) + 1;
    });

    // Compute department distribution
    const staffByDept: Record<string, number> = {};
    depts.forEach((d) => {
      staffByDept[d.name] = staff.filter((s) => s.department_id === d.department_id).length;
    });

    return {
      total_staff: staff.length,
      active_staff: active,
      on_leave: onLeave,
      absent_today: absentToday,
      total_departments: depts.length,
      departments_with_hod: deptsWithHOD,
      pending_leave_requests: leaves.length,
      avg_experience_years: avgExp,
      staff_by_role: staffByRole,
      staff_by_department: staffByDept,
    };
  }
  throw new Error("Real API not implemented yet");
}
