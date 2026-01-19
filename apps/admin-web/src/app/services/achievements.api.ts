/**
 * Achievements API Service
 * Provides achievement management, leaderboards with demo mode support
 */

import type {
  AchievementPointRule,
  StudentAchievement,
  AchievementKpi,
  LeaderboardStudent,
  LeaderboardClub,
} from './achievement.schema';
import { mockAchievementProvider } from '../mockDataProviders/mockAchievements';

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

/**
 * Get achievement point rules for a school
 */
export async function getAchievementRules(schoolId: number): Promise<AchievementPointRule[]> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getAchievementRules(schoolId);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get achievements for a specific student
 */
export async function getStudentAchievements(
  studentId: number,
  onlyVerified = true
): Promise<StudentAchievement[]> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getStudentAchievements(studentId, onlyVerified);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get all student achievements for a school
 */
export async function getAllStudentAchievements(
  schoolId: number,
  onlyVerified = true
): Promise<StudentAchievement[]> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getAllStudentAchievements(schoolId, onlyVerified);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get achievement KPIs
 */
export async function getAchievementKpi(): Promise<AchievementKpi> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getAchievementKpi();
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get school-wide leaderboard
 */
export async function getSchoolLeaderboard(
  schoolId: number,
  academicYearId: number
): Promise<LeaderboardStudent[]> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getSchoolLeaderboard(schoolId, academicYearId);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get club leaderboard
 */
export async function getClubLeaderboard(
  schoolId: number,
  academicYearId: number
): Promise<LeaderboardClub[]> {
  if (isDemoMode()) {
    return await mockAchievementProvider.getClubLeaderboard(schoolId, academicYearId);
  }
  throw new Error('Real API not implemented yet');
}
