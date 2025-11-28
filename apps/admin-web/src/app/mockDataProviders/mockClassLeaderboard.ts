// ============================================================================
// MOCK CLASS LEADERBOARD DATA PROVIDER
// ============================================================================

import type { ClassLeaderboardEntry } from "../services/classes.schema";
import { MOCK_STUDENTS } from "./mockStudents";

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate holistic score components
 */
function generateHolisticScores() {
  return {
    academic_score: 50 + Math.floor(Math.random() * 45), // 50-95
    achievements_count: Math.floor(Math.random() * 12), // 0-12
    attendance_score: 70 + Math.floor(Math.random() * 30), // 70-100
    behavior_score: 60 + Math.floor(Math.random() * 40), // 60-100
    sports_score: 30 + Math.floor(Math.random() * 70), // 30-100
    extracurricular_score: 40 + Math.floor(Math.random() * 60), // 40-100
  };
}

/**
 * Calculate final composite score
 */
function calculateCompositeScore(scores: ReturnType<typeof generateHolisticScores>): number {
  // Weighted average
  const weights = {
    academic: 0.35,
    attendance: 0.15,
    behavior: 0.15,
    sports: 0.15,
    extracurricular: 0.15,
    achievements: 0.05,
  };

  const achievementScore = Math.min(scores.achievements_count * 8, 100); // Max 100

  const composite =
    scores.academic_score * weights.academic +
    scores.attendance_score * weights.attendance +
    scores.behavior_score * weights.behavior +
    scores.sports_score * weights.sports +
    scores.extracurricular_score * weights.extracurricular +
    achievementScore * weights.achievements;

  return parseFloat(composite.toFixed(2));
}

/**
 * Get class holistic leaderboard
 */
export async function getClassLeaderboard(classId: number): Promise<ClassLeaderboardEntry[]> {
  await simulateDelay(300);

  // Get students for this class
  const classStudents = MOCK_STUDENTS.filter((s) => s.class_id === classId && s.is_active);

  // Generate leaderboard entries
  const leaderboard = classStudents.map((student) => {
    const scores = generateHolisticScores();
    const finalScore = calculateCompositeScore(scores);

    return {
      rank: 0, // Will be assigned after sorting
      student_id: student.student_id,
      roll_number: student.roll_number,
      full_name: `${student.first_name} ${student.last_name}`,
      holistic_score: finalScore, // Alias for final_composite_score
      academic_score: scores.academic_score,
      achievements_count: scores.achievements_count,
      attendance_score: scores.attendance_score,
      behavior_score: scores.behavior_score,
      sports_score: scores.sports_score,
      extracurricular_score: scores.extracurricular_score,
      final_composite_score: finalScore,
    };
  });

  // Sort by final_composite_score descending
  leaderboard.sort((a, b) => b.final_composite_score - a.final_composite_score);

  // Assign ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  console.log(`[MOCK CLASS LEADERBOARD] getClassLeaderboard(${classId}) → ${leaderboard.length} entries`);
  return leaderboard;
}

export const mockClassLeaderboardProvider = {
  getClassLeaderboard,
};
