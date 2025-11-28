// ============================================================================
// HR SCHEMAS
// ============================================================================
// Type definitions for HR module: staff, departments, attendance, leave, proxy

import { z } from "zod";

// ============================================================================
// STAFF MANAGEMENT SCHEMAS
// ============================================================================

export const EmploymentStatus = z.enum([
  "Active",
  "On Leave",
  "Inactive",
  "Contract",
  "Retired",
]);
export type EmploymentStatus = z.infer<typeof EmploymentStatus>;

export const StaffRole = z.enum([
  "Teaching",
  "Non-Teaching",
  "Administration",
  "Support",
  "Management",
]);
export type StaffRole = z.infer<typeof StaffRole>;

export const Staff = z.object({
  staff_id: z.number(),
  school_id: z.number(),
  employee_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  department_id: z.number().optional(),
  designation: z.string(),
  role: StaffRole,
  joining_date: z.string(),
  employment_status: EmploymentStatus,
  qualification: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  experience_years: z.number().optional(),
  periods_per_week: z.number().optional(), // Teaching workload

  // Professional details
  professional_qualification: z.string().optional(),
  certifications: z.array(z.string()).optional(),

  // Personal details
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),

  // Emergency contact
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),

  // Bank details
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  pan: z.string().optional(),

  // System fields
  is_active: z.boolean(),
  profile_photo_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type Staff = z.infer<typeof Staff>;

export const StaffCreate = z.object({
  employee_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  department_id: z.number().optional(),
  designation: z.string(),
  role: StaffRole,
  joining_date: z.string(),
  employment_status: EmploymentStatus,
  qualification: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});
export type StaffCreate = z.infer<typeof StaffCreate>;

export const StaffUpdate = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department_id: z.number().optional(),
  employment_status: EmploymentStatus.optional(),
  qualification: z.string().optional(),
  is_active: z.boolean().optional(),
});
export type StaffUpdate = z.infer<typeof StaffUpdate>;

// ============================================================================
// DEPARTMENT MANAGEMENT SCHEMAS
// ============================================================================

export const Department = z.object({
  department_id: z.number(),
  school_id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  hod_staff_id: z.number().optional(), // Head of Department
  hod_name: z.string().optional(),
  total_staff: z.number().optional(),
  required_staff_count: z.number().optional(), // Required staff positions
  present_today: z.number().optional(),
  on_leave_today: z.number().optional(),
  absent_today: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type Department = z.infer<typeof Department>;

export const DepartmentCreate = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  hod_staff_id: z.number().optional(),
});
export type DepartmentCreate = z.infer<typeof DepartmentCreate>;

export const DepartmentUpdate = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  hod_staff_id: z.number().optional(),
});
export type DepartmentUpdate = z.infer<typeof DepartmentUpdate>;

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

export const StaffAttendanceStatus = z.enum([
  "Present",
  "Absent",
  "Half Day",
  "Late Arrival",
  "Early Departure",
  "On Leave",
]);
export type StaffAttendanceStatus = z.infer<typeof StaffAttendanceStatus>;

export const StaffAttendance = z.object({
  attendance_id: z.number(),
  staff_id: z.number(),
  employee_id: z.string(),
  staff_name: z.string(),
  date: z.string(), // ISO date YYYY-MM-DD
  status: StaffAttendanceStatus,
  check_in_time: z.string().optional(), // HH:MM format
  check_out_time: z.string().optional(),
  remarks: z.string().optional(),
  department_id: z.number().optional(),
  marked_by: z.string().optional(),
  marked_at: z.string().optional(),
  created_at: z.string(),
});
export type StaffAttendance = z.infer<typeof StaffAttendance>;

export const StaffAttendanceCreate = z.object({
  staff_id: z.number(),
  date: z.string(),
  status: StaffAttendanceStatus,
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  remarks: z.string().optional(),
});
export type StaffAttendanceCreate = z.infer<typeof StaffAttendanceCreate>;

// ============================================================================
// LEAVE REQUEST SCHEMAS
// ============================================================================

export const LeaveType = z.enum([
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
]);
export type LeaveType = z.infer<typeof LeaveType>;

export const LeaveStatus = z.enum([
  "Pending",
  "Approved",
  "Rejected",
  "Withdrawn",
]);
export type LeaveStatus = z.infer<typeof LeaveStatus>;

export const LeaveRequest = z.object({
  leave_id: z.number(),
  staff_id: z.number(),
  employee_id: z.string(),
  staff_name: z.string(),
  leave_type: LeaveType,
  from_date: z.string(), // ISO date
  to_date: z.string(), // ISO date
  reason: z.string(),
  status: LeaveStatus,
  approved_by: z.string().optional(),
  approved_at: z.string().optional(),
  rejection_reason: z.string().optional(),
  created_at: z.string(),
});
export type LeaveRequest = z.infer<typeof LeaveRequest>;

export const LeaveRequestCreate = z.object({
  staff_id: z.number(),
  leave_type: LeaveType,
  from_date: z.string(),
  to_date: z.string(),
  reason: z.string(),
});
export type LeaveRequestCreate = z.infer<typeof LeaveRequestCreate>;

// ============================================================================
// PROXY ASSIGNMENT SCHEMAS
// ============================================================================

export const ProxyAssignment = z.object({
  proxy_id: z.number(),
  leave_request_id: z.number(),
  absent_staff_id: z.number(),
  absent_staff_name: z.string(),
  proxy_staff_id: z.number(),
  proxy_staff_name: z.string(),
  from_date: z.string(),
  to_date: z.string(),
  periods: z.array(z.string()).optional(), // Period numbers
  status: z.enum(["Pending", "Accepted", "Declined", "Completed"]),
  remarks: z.string().optional(),
  created_at: z.string(),
});
export type ProxyAssignment = z.infer<typeof ProxyAssignment>;

export const ProxyAssignmentCreate = z.object({
  leave_request_id: z.number(),
  absent_staff_id: z.number(),
  proxy_staff_id: z.number(),
  periods: z.array(z.string()).optional(),
  remarks: z.string().optional(),
});
export type ProxyAssignmentCreate = z.infer<typeof ProxyAssignmentCreate>;

// ============================================================================
// PROFESSIONAL LOG SCHEMAS
// ============================================================================

export const ProfessionalLog = z.object({
  log_id: z.number(),
  staff_id: z.number(),
  entry_type: z.enum(["Training", "Certification", "Achievement", "Skill", "Award"]),
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  document_url: z.string().optional(),
  created_at: z.string(),
});
export type ProfessionalLog = z.infer<typeof ProfessionalLog>;

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const StaffTask = z.object({
  task_id: z.number(),
  staff_id: z.number(),
  assigned_by_id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  due_date: z.string(),
  status: z.enum(["Pending", "In Progress", "Completed", "Overdue"]),
  priority: z.enum(["Low", "Medium", "High"]),
  created_at: z.string(),
});
export type StaffTask = z.infer<typeof StaffTask>;

// ============================================================================
// KPI/ANALYTICS SCHEMAS
// ============================================================================

export const HRAnalytics = z.object({
  total_staff: z.number(),
  active_staff: z.number(),
  on_leave: z.number(),
  absent_today: z.number(),
  total_departments: z.number(),
  departments_with_hod: z.number(),
  pending_leave_requests: z.number(),
  avg_experience_years: z.number(),
  staff_by_role: z.record(z.string(), z.number()),
  staff_by_department: z.record(z.string(), z.number()),
});
export type HRAnalytics = z.infer<typeof HRAnalytics>;

export const StaffKPI = z.object({
  total_staff: z.number(),
  active_staff: z.number(),
  on_leave: z.number(),
  absent_today: z.number(),
  avg_experience_years: z.number(),
  total_departments: z.number(),
  pending_leaves: z.number(),
});
export type StaffKPI = z.infer<typeof StaffKPI>;
