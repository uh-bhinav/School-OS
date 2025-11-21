/**
 * Students API Service
 * Provides student management functions with demo mode support
 */

import type { Student, StudentKpi } from './student.schema';
import { MOCK_STUDENTS } from '../mockDataProviders/mockStudents';
import type { StudentData } from '../mockDataProviders/mockStudents';

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

/**
 * Convert mock student format to Student schema
 */
function convertStudent(data: StudentData): Student {
  return {
    student_id: data.student_id,
    user_id: data.user_id,
    school_id: data.school_id,
    admission_no: data.admission_no,
    full_name: `${data.first_name} ${data.last_name}`,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    address: data.address,
    blood_group: data.blood_group,
    class_id: data.class_id,
    class_name: data.class_name,
    section: data.section,
    roll_number: data.roll_number,
    enrollment_date: data.enrollment_date,
    admission_date: data.admission_date,
    parent_name: data.parent_name,
    parent_phone: data.parent_phone,
    parent_email: data.parent_email,
    parent_relation: data.parent_relation,
    is_active: data.is_active,
    created_at: data.created_at,
  };
}

/**
 * Get all students
 */
export function getStudents(): Student[] {
  if (isDemoMode()) {
    return MOCK_STUDENTS.map(convertStudent);
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}

/**
 * Get student by ID
 */
export function getStudentById(studentId: number): Student | null {
  if (isDemoMode()) {
    const student = MOCK_STUDENTS.find(s => s.student_id === studentId);
    return student ? convertStudent(student) : null;
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}

/**
 * Filter students by various criteria
 */
export function filterStudents(params: {
  classId?: number;
  section?: string;
  searchQuery?: string;
  isActive?: boolean;
}): Student[] {
  if (isDemoMode()) {
    let filtered = [...MOCK_STUDENTS];

    if (params.classId) {
      filtered = filtered.filter(s => s.class_id === params.classId);
    }

    if (params.section) {
      filtered = filtered.filter(s => s.section === params.section);
    }

    if (params.isActive !== undefined) {
      filtered = filtered.filter(s => s.is_active === params.isActive);
    }

    if (params.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.first_name.toLowerCase().includes(query) ||
        s.last_name.toLowerCase().includes(query) ||
        s.admission_no.toLowerCase().includes(query) ||
        (s.parent_name && s.parent_name.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query))
      );
    }

    return filtered.map(convertStudent);
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}

/**
 * Get student KPIs
 */
export function getStudentKPI(): StudentKpi {
  if (isDemoMode()) {
    const students = getStudents();
    const activeStudents = students.filter(s => s.is_active);
    const inactiveStudents = students.filter(s => !s.is_active);

    // Get unique classes
    const uniqueClasses = new Set(students.map(s => s.class_id));

    // Mock attendance percentage (realistic average)
    const avgAttendance = 88.4;

    return {
      total_students: students.length,
      active_students: activeStudents.length,
      inactive_students: inactiveStudents.length,
      avg_attendance: avgAttendance,
      classes_covered: uniqueClasses.size,
    };
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}

/**
 * Get students by class
 */
export function getStudentsByClass(classId: number, section?: string): Student[] {
  return filterStudents({ classId, section });
}
