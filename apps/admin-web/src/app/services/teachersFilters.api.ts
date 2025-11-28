// ============================================================================
// FILE: src/app/services/teachersFilters.api.ts
// PURPOSE: API service for teacher filtering and class teacher assignments
// ============================================================================

import { isDemoMode } from "../mockDataProviders";
import {
  mockTeacherFiltersProvider,
  type ClassTeacherAssignment,
} from "../mockDataProviders/mockTeacherFilters";
import {
  mockTeacherSubjectMappingProvider,
  type SubjectInfo,
  type TeacherSubjectMapping,
} from "../mockDataProviders/mockTeacherSubjectMapping";
import { getTeachers } from "./teachers.api";
import type { Teacher } from "./teacher.schema";

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface TeacherFilters {
  searchQuery?: string;
  subjectIds?: number[];
  classTeachersOnly?: boolean;
  isActive?: boolean;
}

export interface FilteredTeachersResponse {
  teachers: Teacher[];
  total: number;
  appliedFilters: TeacherFilters;
}

export interface ClassInfo {
  class_id: number;
  class_name: string;
  section: string;
  grade_level: number;
  has_teacher: boolean;
  teacher_name?: string;
}

export interface AssignClassTeacherRequest {
  teacher_id: number;
  class_id: number;
  class_name: string;
  section: string;
  grade_level: number;
}

export interface AssignClassTeacherResponse {
  success: boolean;
  message: string;
}

// Re-export types from mock providers
export type { ClassTeacherAssignment, SubjectInfo, TeacherSubjectMapping };

// ============================================================================
// API FUNCTIONS - SUBJECTS
// ============================================================================

/**
 * Get all available subjects for filtering
 */
export async function getAllSubjects(): Promise<SubjectInfo[]> {
  if (isDemoMode()) {
    return mockTeacherSubjectMappingProvider.getAllSubjects();
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get teacher-subject mappings
 */
export async function getTeacherSubjectMappings(): Promise<TeacherSubjectMapping[]> {
  if (isDemoMode()) {
    return mockTeacherSubjectMappingProvider.getTeacherSubjectMappings();
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get teacher IDs who teach specific subjects
 */
export async function getTeacherIdsBySubjects(subjectIds: number[]): Promise<number[]> {
  if (isDemoMode()) {
    return mockTeacherSubjectMappingProvider.getTeacherIdsBySubjects(subjectIds);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// API FUNCTIONS - CLASS TEACHERS
// ============================================================================

/**
 * Get all class teacher assignments
 */
export async function getClassTeacherAssignments(): Promise<ClassTeacherAssignment[]> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.getClassTeacherAssignments();
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get IDs of teachers who are class teachers
 */
export async function getClassTeacherIds(): Promise<number[]> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.getClassTeacherIds();
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Check if a teacher is a class teacher
 */
export async function isTeacherClassTeacher(teacherId: number): Promise<boolean> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.isClassTeacher(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get the class assigned to a specific teacher
 */
export async function getClassForTeacher(teacherId: number): Promise<ClassTeacherAssignment | null> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.getClassForTeacher(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get all classes with assignment status
 */
export async function getAllClasses(): Promise<ClassInfo[]> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.getAllClasses();
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get available classes (without a class teacher)
 */
export async function getAvailableClasses(): Promise<ClassInfo[]> {
  if (isDemoMode()) {
    const classes = await mockTeacherFiltersProvider.getAvailableClasses();
    return classes.map((c) => ({ ...c, has_teacher: false }));
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Assign a teacher as class teacher
 */
export async function assignClassTeacher(
  request: AssignClassTeacherRequest
): Promise<AssignClassTeacherResponse> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.assignTeacherToClass(
      request.teacher_id,
      request.class_id,
      request.class_name,
      request.section,
      request.grade_level
    );
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Remove class teacher assignment
 */
export async function removeClassTeacherAssignment(
  teacherId: number
): Promise<AssignClassTeacherResponse> {
  if (isDemoMode()) {
    return mockTeacherFiltersProvider.removeClassTeacherAssignment(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// API FUNCTIONS - FILTERED TEACHERS
// ============================================================================

/**
 * Get teachers with filters applied
 * This combines multiple filter conditions
 */
export async function getFilteredTeachers(
  filters: TeacherFilters
): Promise<FilteredTeachersResponse> {
  if (isDemoMode()) {
    let teachers = getTeachers();

    // Apply search filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      teachers = teachers.filter(
        (t) =>
          t.full_name.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query) ||
          (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(query)))
      );
    }

    // Apply class teacher filter
    if (filters.classTeachersOnly) {
      const classTeacherIds = await getClassTeacherIds();
      teachers = teachers.filter((t) => classTeacherIds.includes(t.teacher_id));
    }

    // Apply subject filter
    if (filters.subjectIds && filters.subjectIds.length > 0) {
      const teacherIdsBySubject = await getTeacherIdsBySubjects(filters.subjectIds);
      teachers = teachers.filter((t) => teacherIdsBySubject.includes(t.teacher_id));
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      teachers = teachers.filter((t) => t.is_active === filters.isActive);
    }

    return {
      teachers,
      total: teachers.length,
      appliedFilters: filters,
    };
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get teachers with class teacher badge info
 * Returns teachers with an additional isClassTeacher property
 */
export async function getTeachersWithClassTeacherInfo(): Promise<
  (Teacher & { isClassTeacher: boolean; classInfo?: ClassTeacherAssignment })[]
> {
  if (isDemoMode()) {
    const teachers = getTeachers();
    const assignments = await getClassTeacherAssignments();

    return teachers.map((teacher) => {
      const classInfo = assignments.find((a) => a.teacher_id === teacher.teacher_id);
      return {
        ...teacher,
        isClassTeacher: !!classInfo,
        classInfo: classInfo || undefined,
      };
    });
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}
