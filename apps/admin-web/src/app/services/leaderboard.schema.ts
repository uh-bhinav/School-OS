// ============================================================================
// LEADERBOARD SCHEMAS
// ============================================================================
// Type definitions matching backend endpoints for leaderboards

export interface LeaderboardStudent {
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  section: string;
  total_points: number;
  achievement_count: number;
  rank: number;
}

export interface LeaderboardClub {
  club_id: number;
  club_name: string;
  total_points: number;
  member_count: number;
  rank: number;
}

export interface LeaderboardKpi {
  total_students: number;
  total_achievements: number;
  avg_points_per_student: number;
  top_student_name: string;
  top_student_points: number;
  top_class_name: string;
  top_class_avg_points: number;
}
