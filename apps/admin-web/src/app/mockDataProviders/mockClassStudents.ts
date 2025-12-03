// ============================================================================
// MOCK CLASS STUDENTS DATA PROVIDER
// ============================================================================

import type { ClassStudent } from "../services/classes.schema";
import { MOCK_STUDENTS } from "./mockStudents";

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get students for a specific class
 */
export async function getClassStudents(classId: number): Promise<ClassStudent[]> {
  await simulateDelay(250);

  // Filter students by class_id
  const classStudents = MOCK_STUDENTS
    .filter((s) => s.class_id === classId)
    .map((student, index) => {
      const attendancePercentage = 75 + Math.floor(Math.random() * 20); // 75-95%
      const averageMarks = 60 + Math.floor(Math.random() * 35); // 60-95%

      return {
        student_id: student.student_id,
        roll_number: student.roll_number,
        full_name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        phone: student.phone,
        attendance_percentage: attendancePercentage,
        average_marks: averageMarks,
        rank: index + 1, // Will be recalculated
        is_active: student.is_active,
      };
    });

  // Sort by average_marks descending and assign ranks
  classStudents.sort((a, b) => b.average_marks - a.average_marks);
  classStudents.forEach((student, index) => {
    student.rank = index + 1;
  });

  console.log(`[MOCK CLASS STUDENTS] getClassStudents(${classId}) → ${classStudents.length} students`);
  return classStudents;
}

export const mockClassStudentsProvider = {
  getClassStudents,
};
