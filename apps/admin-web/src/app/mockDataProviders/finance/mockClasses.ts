// ============================================================================
// MOCK CLASSES DATA FOR FINANCE MODULE
// ============================================================================

import type { ClassInfo } from '../../services/finance/types';

export const MOCK_CLASSES: ClassInfo[] = [
  { class_id: 1, class_name: 'Class 1-A', grade_level: 1, section: 'A', student_count: 38 },
  { class_id: 2, class_name: 'Class 1-B', grade_level: 1, section: 'B', student_count: 35 },
  { class_id: 3, class_name: 'Class 2-A', grade_level: 2, section: 'A', student_count: 40 },
  { class_id: 4, class_name: 'Class 2-B', grade_level: 2, section: 'B', student_count: 37 },
  { class_id: 5, class_name: 'Class 3-A', grade_level: 3, section: 'A', student_count: 42 },
  { class_id: 6, class_name: 'Class 3-B', grade_level: 3, section: 'B', student_count: 38 },
  { class_id: 7, class_name: 'Class 4-A', grade_level: 4, section: 'A', student_count: 40 },
  { class_id: 8, class_name: 'Class 4-B', grade_level: 4, section: 'B', student_count: 36 },
  { class_id: 9, class_name: 'Class 5-A', grade_level: 5, section: 'A', student_count: 39 },
  { class_id: 10, class_name: 'Class 5-B', grade_level: 5, section: 'B', student_count: 41 },
  { class_id: 11, class_name: 'Class 6-A', grade_level: 6, section: 'A', student_count: 44 },
  { class_id: 12, class_name: 'Class 6-B', grade_level: 6, section: 'B', student_count: 42 },
  { class_id: 13, class_name: 'Class 7-A', grade_level: 7, section: 'A', student_count: 40 },
  { class_id: 14, class_name: 'Class 7-B', grade_level: 7, section: 'B', student_count: 38 },
  { class_id: 15, class_name: 'Class 8-A', grade_level: 8, section: 'A', student_count: 45 },
  { class_id: 16, class_name: 'Class 8-B', grade_level: 8, section: 'B', student_count: 43 },
  { class_id: 17, class_name: 'Class 9-A', grade_level: 9, section: 'A', student_count: 42 },
  { class_id: 18, class_name: 'Class 9-B', grade_level: 9, section: 'B', student_count: 40 },
  { class_id: 19, class_name: 'Class 10-A', grade_level: 10, section: 'A', student_count: 48 },
  { class_id: 20, class_name: 'Class 10-B', grade_level: 10, section: 'B', student_count: 46 },
];

export function getClassById(classId: number): ClassInfo | undefined {
  return MOCK_CLASSES.find(c => c.class_id === classId);
}

export function getClassesByGrade(gradeLevel: number): ClassInfo[] {
  return MOCK_CLASSES.filter(c => c.grade_level === gradeLevel);
}

export function getAllClasses(): ClassInfo[] {
  return [...MOCK_CLASSES];
}
