// ============================================================================
// MOCK TEACHER FILTERS DATA PROVIDER
// ============================================================================

import { MOCK_TEACHERS } from "./mockTeachers";

export interface ClassTeacherAssignment {
  class_id: number;
  class_name: string;
  section: string;
  grade_level: number;
  teacher_id: number;
  teacher_name: string;
  academic_year_id: number;
  assigned_at: string;
}

// In-memory store for class teacher assignments
// This allows for dynamic updates during the session
let classTeacherAssignmentsCache: ClassTeacherAssignment[] = [];

// Initialize class teacher assignments
function initializeClassTeacherAssignments(): void {
  if (classTeacherAssignmentsCache.length > 0) return;

  // Initial assignments: first 20 teachers are class teachers
  const initialAssignments: ClassTeacherAssignment[] = [];

  for (let i = 1; i <= 20; i++) {
    const teacher = MOCK_TEACHERS.find((t) => t.teacher_id === i);
    if (teacher) {
      const gradeLevel = Math.ceil(i / 2);
      const section = i % 2 === 1 ? "A" : "B";

      initialAssignments.push({
        class_id: i,
        class_name: `Class ${gradeLevel}`,
        section: section,
        grade_level: gradeLevel,
        teacher_id: i,
        teacher_name: `${teacher.first_name} ${teacher.last_name}`,
        academic_year_id: 1,
        assigned_at: new Date().toISOString(),
      });
    }
  }

  classTeacherAssignmentsCache = initialAssignments;
  console.log(`[MOCK TEACHER FILTERS] Initialized ${classTeacherAssignmentsCache.length} class teacher assignments`);
}

// Ensure initialization
initializeClassTeacherAssignments();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get all class teacher assignments
 */
export async function getClassTeacherAssignments(): Promise<ClassTeacherAssignment[]> {
  await simulateDelay(200);
  initializeClassTeacherAssignments();
  console.log(`[MOCK TEACHER FILTERS] getClassTeacherAssignments → ${classTeacherAssignmentsCache.length} assignments`);
  return [...classTeacherAssignmentsCache];
}

/**
 * Get class teachers only (teacher IDs)
 */
export async function getClassTeacherIds(): Promise<number[]> {
  await simulateDelay(150);
  initializeClassTeacherAssignments();
  const teacherIds = classTeacherAssignmentsCache.map((a) => a.teacher_id);
  console.log(`[MOCK TEACHER FILTERS] getClassTeacherIds → ${teacherIds.length} teachers`);
  return teacherIds;
}

/**
 * Check if a teacher is a class teacher
 */
export async function isClassTeacher(teacherId: number): Promise<boolean> {
  await simulateDelay(100);
  initializeClassTeacherAssignments();
  const isTeacher = classTeacherAssignmentsCache.some((a) => a.teacher_id === teacherId);
  console.log(`[MOCK TEACHER FILTERS] isClassTeacher(${teacherId}) → ${isTeacher}`);
  return isTeacher;
}

/**
 * Get class assignment for a specific teacher
 */
export async function getClassForTeacher(teacherId: number): Promise<ClassTeacherAssignment | null> {
  await simulateDelay(100);
  initializeClassTeacherAssignments();
  const assignment = classTeacherAssignmentsCache.find((a) => a.teacher_id === teacherId);
  console.log(`[MOCK TEACHER FILTERS] getClassForTeacher(${teacherId}) → ${assignment ? assignment.class_name : "null"}`);
  return assignment || null;
}

/**
 * Assign a teacher as class teacher
 */
export async function assignTeacherToClass(
  teacherId: number,
  classId: number,
  className: string,
  section: string,
  gradeLevel: number
): Promise<{ success: boolean; message: string }> {
  await simulateDelay(300);
  initializeClassTeacherAssignments();

  const teacher = MOCK_TEACHERS.find((t) => t.teacher_id === teacherId);
  if (!teacher) {
    return { success: false, message: "Teacher not found" };
  }

  // Check if teacher is already assigned to another class
  const existingAssignment = classTeacherAssignmentsCache.find((a) => a.teacher_id === teacherId);
  if (existingAssignment) {
    // Remove old assignment
    classTeacherAssignmentsCache = classTeacherAssignmentsCache.filter((a) => a.teacher_id !== teacherId);
  }

  // Check if class already has a teacher
  const classAssignment = classTeacherAssignmentsCache.find((a) => a.class_id === classId);
  if (classAssignment) {
    // Remove old teacher from this class
    classTeacherAssignmentsCache = classTeacherAssignmentsCache.filter((a) => a.class_id !== classId);
  }

  // Add new assignment
  const newAssignment: ClassTeacherAssignment = {
    class_id: classId,
    class_name: className,
    section: section,
    grade_level: gradeLevel,
    teacher_id: teacherId,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
    academic_year_id: 1,
    assigned_at: new Date().toISOString(),
  };

  classTeacherAssignmentsCache.push(newAssignment);
  console.log(`[MOCK TEACHER FILTERS] assignTeacherToClass → ${teacher.first_name} assigned to ${className} ${section}`);

  return { success: true, message: `Successfully assigned ${teacher.first_name} ${teacher.last_name} as class teacher for ${className} ${section}` };
}

/**
 * Remove class teacher assignment
 */
export async function removeClassTeacherAssignment(teacherId: number): Promise<{ success: boolean; message: string }> {
  await simulateDelay(200);
  initializeClassTeacherAssignments();

  const assignment = classTeacherAssignmentsCache.find((a) => a.teacher_id === teacherId);
  if (!assignment) {
    return { success: false, message: "Teacher is not assigned as a class teacher" };
  }

  classTeacherAssignmentsCache = classTeacherAssignmentsCache.filter((a) => a.teacher_id !== teacherId);
  console.log(`[MOCK TEACHER FILTERS] removeClassTeacherAssignment → removed assignment for teacher ${teacherId}`);

  return { success: true, message: "Class teacher assignment removed successfully" };
}

/**
 * Get available classes (classes without a class teacher)
 */
export async function getAvailableClasses(): Promise<Array<{ class_id: number; class_name: string; section: string; grade_level: number }>> {
  await simulateDelay(200);
  initializeClassTeacherAssignments();

  // Generate all possible classes (Class 1-12, sections A and B)
  const allClasses: Array<{ class_id: number; class_name: string; section: string; grade_level: number }> = [];

  for (let grade = 1; grade <= 12; grade++) {
    ["A", "B"].forEach((section, index) => {
      const classId = (grade - 1) * 2 + index + 1;
      allClasses.push({
        class_id: classId,
        class_name: `Class ${grade}`,
        section: section,
        grade_level: grade,
      });
    });
  }

  // Filter out classes that already have teachers
  const assignedClassIds = new Set(classTeacherAssignmentsCache.map((a) => a.class_id));
  const availableClasses = allClasses.filter((c) => !assignedClassIds.has(c.class_id));

  console.log(`[MOCK TEACHER FILTERS] getAvailableClasses → ${availableClasses.length} available classes`);
  return availableClasses;
}

/**
 * Get all classes (for dropdown)
 */
export async function getAllClasses(): Promise<Array<{ class_id: number; class_name: string; section: string; grade_level: number; has_teacher: boolean; teacher_name?: string }>> {
  await simulateDelay(200);
  initializeClassTeacherAssignments();

  const allClasses: Array<{ class_id: number; class_name: string; section: string; grade_level: number; has_teacher: boolean; teacher_name?: string }> = [];

  for (let grade = 1; grade <= 12; grade++) {
    ["A", "B"].forEach((section, index) => {
      const classId = (grade - 1) * 2 + index + 1;
      const assignment = classTeacherAssignmentsCache.find((a) => a.class_id === classId);

      allClasses.push({
        class_id: classId,
        class_name: `Class ${grade}`,
        section: section,
        grade_level: grade,
        has_teacher: !!assignment,
        teacher_name: assignment?.teacher_name,
      });
    });
  }

  console.log(`[MOCK TEACHER FILTERS] getAllClasses → ${allClasses.length} classes`);
  return allClasses;
}

export const mockTeacherFiltersProvider = {
  getClassTeacherAssignments,
  getClassTeacherIds,
  isClassTeacher,
  getClassForTeacher,
  assignTeacherToClass,
  removeClassTeacherAssignment,
  getAvailableClasses,
  getAllClasses,
};
