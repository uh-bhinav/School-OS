// ============================================================================
// LEADERBOARD API
// ============================================================================

import { isDemoMode, mockLeaderboardProvider } from "../mockDataProviders";
import type {
  LeaderboardStudent,
  LeaderboardClub,
  LeaderboardKpi,
} from "./leaderboard.schema";

/**
 * Get school-wide leaderboard
 */
export async function getSchoolLeaderboard(
  academicYearId: number
): Promise<LeaderboardStudent[]> {
  if (isDemoMode()) {
    return mockLeaderboardProvider.getSchoolLeaderboard(academicYearId);
  }

  // TODO: Implement real backend call
  throw new Error("Live mode not yet implemented for leaderboards");
}

/**
 * Get class-specific leaderboard
 */
export async function getClassLeaderboard(
  classId: number,
  academicYearId: number
): Promise<LeaderboardStudent[]> {
  if (isDemoMode()) {
    return mockLeaderboardProvider.getClassLeaderboard(classId, academicYearId);
  }

  // TODO: Implement real backend call
  throw new Error("Live mode not yet implemented for leaderboards");
}

/**
 * Get club leaderboard
 */
export async function getClubLeaderboard(
  academicYearId: number
): Promise<LeaderboardClub[]> {
  if (isDemoMode()) {
    return mockLeaderboardProvider.getClubLeaderboard(academicYearId);
  }

  // TODO: Implement real backend call
  throw new Error("Live mode not yet implemented for leaderboards");
}

/**
 * Get leaderboard KPI metrics
 */
export async function getLeaderboardKpi(
  academicYearId: number
): Promise<LeaderboardKpi> {
  if (isDemoMode()) {
    return mockLeaderboardProvider.getLeaderboardKpi(academicYearId);
  }

  // TODO: Implement real backend call
  throw new Error("Live mode not yet implemented for leaderboards");
}
