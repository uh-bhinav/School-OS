/**
 * Teacher Details API Service
 * Provides comprehensive teacher detail functions with demo mode support
 */

import { mockTeacherDetailsProvider } from "../mockDataProviders/mockTeacherDetails";
import { mockTeacherPerformanceProvider } from "../mockDataProviders/mockTeacherPerformance";
import { mockTeacherTimetableProvider } from "../mockDataProviders/mockTeacherTimetable";
import { mockTeacherMentorshipProvider } from "../mockDataProviders/mockTeacherMentorship";
import { mockTeacherClubsProvider } from "../mockDataProviders/mockTeacherClubs";
import { mockTeacherCommunicationsProvider } from "../mockDataProviders/mockTeacherCommunications";
import { mockTeacherAchievementsProvider } from "../mockDataProviders/mockTeacherAchievements";

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

// ============================================================================
// TEACHER DETAILS
// ============================================================================

export async function getTeacherDetails(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherDetailsProvider.getTeacherDetailById(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER PERFORMANCE
// ============================================================================

export async function getTeacherPerformanceKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherPerformanceProvider.getTeacherPerformanceKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getClassWisePerformance(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherPerformanceProvider.getClassWisePerformance(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getSubjectWisePerformance(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherPerformanceProvider.getSubjectWisePerformance(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getStudentProgressOverTime(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherPerformanceProvider.getStudentProgressOverTime(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER TIMETABLE
// ============================================================================

export async function getTeacherTimetable(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherTimetableProvider.getTeacherTimetable(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getTeacherWorkloadKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherTimetableProvider.getTeacherWorkloadKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER MENTORSHIP
// ============================================================================

export async function getMentoredStudents(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherMentorshipProvider.getMentoredStudents(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getMentorshipKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherMentorshipProvider.getMentorshipKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getMentorshipInsights(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherMentorshipProvider.getMentorshipInsights(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER CLUBS
// ============================================================================

export async function getTeacherClubs(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherClubsProvider.getTeacherClubs(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getTeacherClubActivities(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherClubsProvider.getTeacherClubActivities(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getClubParticipationLogs(teacherId: number, limit?: number) {
  if (isDemoMode()) {
    return await mockTeacherClubsProvider.getClubParticipationLogs(teacherId, limit);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getTeacherClubKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherClubsProvider.getTeacherClubKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER COMMUNICATIONS
// ============================================================================

export async function getTeacherCommunications(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherCommunicationsProvider.getTeacherCommunications(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getConversationThreads(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherCommunicationsProvider.getConversationThreads(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getAnnouncementsCreated(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherCommunicationsProvider.getAnnouncementsCreated(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getTeacherCommunicationKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherCommunicationsProvider.getTeacherCommunicationKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

// ============================================================================
// TEACHER ACHIEVEMENTS
// ============================================================================

export async function getTeacherAchievements(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherAchievementsProvider.getTeacherAchievements(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getTeacherAchievementKpi(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherAchievementsProvider.getTeacherAchievementKpi(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

export async function getAchievementBadges(teacherId: number) {
  if (isDemoMode()) {
    return await mockTeacherAchievementsProvider.getAchievementBadges(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}
