// ============================================================================
// ACHIEVEMENT SCHEMAS
// ============================================================================
// Type definitions matching backend endpoints for achievements

export enum AchievementType {
  academic = "academic",
  sports = "sports",
  cultural = "cultural",
  leadership = "leadership",
  community_service = "community_service"
}

export enum AchievementVisibility {
  public = "public",
  school_only = "school_only",
  private = "private"
}

export interface AchievementPointRule {
  id: number;
  school_id: number;
  achievement_type: AchievementType;
  category_name: string;
  base_points: number;
  level_multiplier: Record<string, number>;
  is_active: boolean;
  created_at: string;
}

export interface AchievementPointRuleCreate {
  achievement_type: AchievementType;
  category_name: string;
  base_points: number;
  level_multiplier?: Record<string, number>;
  is_active?: boolean;
}

export interface AchievementPointRuleUpdate {
  achievement_type?: AchievementType;
  category_name?: string;
  base_points?: number;
  level_multiplier?: Record<string, number>;
  is_active?: boolean;
}

export interface StudentAchievement {
  id: number;
  school_id: number;
  student_id: number;
  academic_year_id: number;
  achievement_type: AchievementType;
  title: string;
  description?: string;
  achievement_category: string;
  date_awarded: string;
  certificate_url?: string;
  evidence_urls?: string[];
  visibility: AchievementVisibility;
  awarded_by_user_id: string;
  verified_by_user_id?: string;
  points_awarded: number;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAchievementCreate {
  student_id: number;
  academic_year_id: number;
  achievement_type: AchievementType;
  title: string;
  description?: string;
  achievement_category: string;
  date_awarded: string;
  certificate_url?: string;
  evidence_urls?: string[];
  visibility?: AchievementVisibility;
}

export interface StudentAchievementUpdate {
  achievement_type?: AchievementType;
  title?: string;
  description?: string;
  achievement_category?: string;
  date_awarded?: string;
  certificate_url?: string;
  evidence_urls?: string[];
  visibility?: AchievementVisibility;
}

export interface LeaderboardStudent {
  student_id: number;
  student_name: string;
  class_id?: number;
  class_name?: string;
  total_points: number;
  achievement_points: number;
  exam_points: number;
  club_points: number;
}

export interface LeaderboardClub {
  club_id: number;
  club_name: string;
  total_points: number;
}

export interface AchievementKpi {
  total_achievements: number;
  students_recognized: number;
  avg_points_per_student: number;
  pending_verifications: number;
  total_points_awarded: number;
}
