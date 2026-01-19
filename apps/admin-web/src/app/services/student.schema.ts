// ============================================================================
// STUDENT SCHEMAS
// ============================================================================
// Type definitions matching backend endpoints for students

export interface Student {
  student_id: number;
  user_id: number | string;
  school_id: number;
  admission_no: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  blood_group?: string;
  class_id: number;
  class_name: string;
  section: string;
  roll_number: string;
  enrollment_date: string;
  admission_date?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  parent_relation?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StudentContact {
  contact_id: number;
  student_id: number;
  contact_name: string;
  relation: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  is_emergency: boolean;
}

export interface StudentKpi {
  total_students: number;
  active_students: number;
  inactive_students: number;
  avg_attendance: number;
  classes_covered: number;
}

export interface StudentUpdate {
  phone?: string;
  address?: string;
  class_id?: number;
  section?: string;
  roll_number?: string;
  is_active?: boolean;
}

export interface StudentAttendanceSummary {
  student_id: number;
  student_name: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}
