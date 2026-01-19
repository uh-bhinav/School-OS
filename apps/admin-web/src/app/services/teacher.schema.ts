// ============================================================================
// TEACHER SCHEMAS
// ============================================================================
// Type definitions matching backend endpoints for teachers

export interface Teacher {
  teacher_id: number;
  user_id: number;
  school_id: number;
  employee_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  joining_date: string;
  employment_status_id?: number;
  employment_status?: string;
  subjects?: string[]; // Subject names
  classes?: string[]; // Class names
  qualifications?: string[];
  experience_years?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TeacherQualification {
  teacher_id: number;
  qualifications?: string[];
  certifications?: string[];
  experience_years?: number;
  specializations?: string[];
  previous_institutions?: string[];
}

export interface TeacherUpdate {
  employee_code?: string;
  phone?: string;
  address?: string;
  employment_status_id?: number;
  is_active?: boolean;
}

export interface TeacherKpi {
  total_teachers: number;
  active_teachers: number;
  on_leave: number;
  unassigned_teachers: number;
  avg_experience_years: number;
  subjects_covered: number;
}

export interface TeacherSubjectAssignment {
  assignment_id: number;
  teacher_id: number;
  teacher_name: string;
  subject_id: number;
  subject_name: string;
  class_id: number;
  class_name: string;
  section?: string;
  academic_year_id: number;
}
