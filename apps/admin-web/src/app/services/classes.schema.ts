// ============================================================================
// CLASSES SCHEMAS
// ============================================================================
// Type definitions for the Classes module

export interface Class {
  class_id: number;
  school_id: number;
  class_name: string;
  section: string;
  grade: number;
  class_teacher_id: number | null;
  class_teacher_name: string | null;
  total_students: number;
  total_subjects: number;
  average_performance: number;
  academic_year_id: number;
  academic_year: string;
  room_id?: number;
  room_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClassDetail {
  class_id: number;
  school_id: number;
  class_name: string;
  section: string;
  grade: number;
  class_teacher_id: number | null;
  class_teacher_name: string | null;
  class_teacher_email?: string;
  class_teacher_phone?: string;
  total_students: number;
  total_subjects: number;
  average_performance: number;
  attendance_percentage: number;
  academic_year_id: number;
  academic_year: string;
  room_id?: number;
  room_name?: string;
  floor?: number;
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClassStudent {
  student_id: number;
  roll_number: string;
  full_name: string;
  email: string;
  phone?: string;
  attendance_percentage: number;
  average_marks: number;
  rank: number;
  is_active: boolean;
}

export interface ClassSubjectMapping {
  mapping_id: number;
  class_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  teacher_id: number | null;
  teacher_name: string | null;
  periods_per_week: number;
  academic_year_id: number;
}

export interface ClassRankListEntry {
  rank: number;
  student_id: number;
  roll_number: string;
  full_name: string;
  total_marks: number;
  max_marks: number;
  percentage: number;
  average: number;
  grade: string;
}

export interface ClassLeaderboardEntry {
  rank: number;
  student_id: number;
  roll_number: string;
  full_name: string;
  holistic_score: number;
  academic_score: number;
  achievements_count: number;
  attendance_score: number;
  behavior_score: number;
  sports_score: number;
  extracurricular_score: number;
  final_composite_score: number;
}

export interface ClassTimetableSlot {
  slot_id: number;
  period: number;
  day: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  teacher_id: number;
  teacher_name: string;
  room_id?: number;
  room_name?: string;
  start_time: string;
  end_time: string;
}

export interface ClassKpi {
  total_classes: number;
  active_classes: number;
  classes_with_teacher: number;
  classes_without_teacher: number;
  average_students_per_class: number;
  total_students: number;
}

export interface AssignClassTeacherRequest {
  class_id: number;
  teacher_id: number;
}

export interface UpdateClassSubjectMappingRequest {
  mapping_id: number;
  teacher_id: number;
}
