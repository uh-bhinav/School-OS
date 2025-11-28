// ============================================================================
// MOCK CLASS RANKLIST DATA PROVIDER
// ============================================================================

import type { ClassRankListEntry } from "../services/classes.schema";
import { MOCK_STUDENTS } from "./mockStudents";

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate grade from percentage
 */
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

/**
 * Get class rank list
 */
export async function getClassRankList(classId: number): Promise<ClassRankListEntry[]> {
  await simulateDelay(300);

  // Get students for this class
  const classStudents = MOCK_STUDENTS.filter((s) => s.class_id === classId && s.is_active);

  // Generate rank list entries
  const rankList = classStudents.map((student) => {
    const totalMarks = 400 + Math.floor(Math.random() * 450); // 400-850 out of 1000
    const maxMarks = 1000;
    const percentage = (totalMarks / maxMarks) * 100;
    const average = percentage;

    return {
      rank: 0, // Will be assigned after sorting
      student_id: student.student_id,
      roll_number: student.roll_number,
      full_name: `${student.first_name} ${student.last_name}`,
      total_marks: totalMarks,
      max_marks: maxMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      grade: calculateGrade(percentage),
    };
  });

  // Sort by total_marks descending
  rankList.sort((a, b) => b.total_marks - a.total_marks);

  // Assign ranks
  rankList.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  console.log(`[MOCK CLASS RANKLIST] getClassRankList(${classId}) → ${rankList.length} entries`);
  return rankList;
}

export const mockClassRanklistProvider = {
  getClassRankList,
};
