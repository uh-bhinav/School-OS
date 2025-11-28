// ============================================================================
// LEAVE MANAGEMENT SCHEMA / TYPES
// ============================================================================
// TypeScript interfaces for Leave Management and Proxy Assignment
// ============================================================================

import type { DayOfWeek } from "./timetable.schema";

// ============================================================================
// LEAVE REQUEST TYPES
// ============================================================================

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveType =
  | "CASUAL"
  | "SICK"
  | "EMERGENCY"
  | "MATERNITY"
  | "PATERNITY"
  | "NATIONAL_DUTY"
  | "SCHOOL_EVENT"
  | "PERSONAL"
  | "STUDY"
  | "BEREAVEMENT";

export interface LeaveRequest {
  leaveId: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  teacherAvatar?: string;
  subject: string;
  employeeCode: string;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
  totalDays: number;
  leaveType: LeaveType;
  reasonSummary: string;
  reasonDescription: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: LeaveStatus;
  proxyAssigned: boolean;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// ============================================================================
// TEACHER TIMETABLE TYPES
// ============================================================================

export interface TeacherPeriod {
  periodNo: number;
  startTime: string;
  endTime: string;
  classId: number;
  section: string;
  subject: string;
  roomId?: number;
  roomName?: string;
  isFree: boolean;
}

export interface TeacherDaySchedule {
  teacherId: number;
  teacherName: string;
  date: string;
  day: DayOfWeek;
  periods: TeacherPeriod[];
}

// ============================================================================
// PROXY ASSIGNMENT TYPES FOR LEAVE
// ============================================================================

export interface LeaveProxyPeriod {
  periodNo: number;
  startTime: string;
  endTime: string;
  classId: number;
  section: string;
  subject: string;
  subjectId: number;
  roomId?: number;
  roomName?: string;
  status: "NEEDS_PROXY" | "ASSIGNED" | "FREE";
  substituteTeacherId?: number;
  substituteTeacherName?: string;
  assignedAt?: string;
}

export interface LeaveProxyAssignment {
  assignmentId: string;
  leaveId: string;
  teacherId: number;
  teacherName: string;
  date: string;
  day: DayOfWeek;
  periodNo: number;
  periodTime: string;
  classId: number;
  section: string;
  subject: string;
  subjectId: number;
  substituteTeacherId: number;
  substituteTeacherName: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt: string;
}

// ============================================================================
// AVAILABLE TEACHER FOR PROXY (REUSING FROM PROXY.API)
// ============================================================================

export interface AvailableSubstituteTeacher {
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
  avatar?: string;
}

// ============================================================================
// KPI TYPES
// ============================================================================

export interface LeaveManagementKPIs {
  pendingRequests: number;
  approvedLeavesToday: number;
  teachersAbsentToday: number;
  proxyAssignmentsPending: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApproveLeaveRequest {
  leaveId: string;
  approvedBy: string;
}

export interface RejectLeaveRequest {
  leaveId: string;
  rejectedBy: string;
  rejectionReason: string;
}

export interface AssignLeaveProxyRequest {
  leaveId: string;
  date: string;
  periodNo: number;
  substituteTeacherId: number;
  substituteTeacherName: string;
}

export interface AssignLeaveProxyResponse {
  success: boolean;
  assignmentId: string;
  message: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface LeaveRequestFilters {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  fromDate?: string;
  toDate?: string;
  teacherId?: number;
  search?: string;
}
