// ============================================================================
// FILE: src/app/services/lessonPlan.api.ts
// PURPOSE: API service for lesson plan management
// ============================================================================

import { isDemoMode } from "../mockDataProviders";
import {
  mockLessonPlansProvider,
  type LessonPlan,
  type LessonPlanAttachment,
} from "../mockDataProviders/mockLessonPlans";

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface LessonPlanStats {
  total: number;
  completed: number;
  inProgress: number;
  approved: number;
  draft: number;
}

export interface LessonPlanListResponse {
  plans: LessonPlan[];
  total: number;
  stats: LessonPlanStats;
}

// Re-export types from mock providers
export type { LessonPlan, LessonPlanAttachment };

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get lesson plans for a specific teacher
 */
export async function getLessonPlansByTeacher(teacherId: number): Promise<LessonPlan[]> {
  if (isDemoMode()) {
    return mockLessonPlansProvider.getLessonPlansByTeacher(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get a specific lesson plan by ID
 */
export async function getLessonPlanById(planId: string): Promise<LessonPlan | null> {
  if (isDemoMode()) {
    return mockLessonPlansProvider.getLessonPlanById(planId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get lesson plans by subject
 */
export async function getLessonPlansBySubject(subjectId: number): Promise<LessonPlan[]> {
  if (isDemoMode()) {
    return mockLessonPlansProvider.getLessonPlansBySubject(subjectId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get lesson plan statistics for a teacher
 */
export async function getLessonPlanStats(teacherId: number): Promise<LessonPlanStats> {
  if (isDemoMode()) {
    return mockLessonPlansProvider.getLessonPlanStats(teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get lesson plans with stats for a teacher
 */
export async function getLessonPlanListForTeacher(
  teacherId: number
): Promise<LessonPlanListResponse> {
  if (isDemoMode()) {
    const plans = await mockLessonPlansProvider.getLessonPlansByTeacher(teacherId);
    const stats = await mockLessonPlansProvider.getLessonPlanStats(teacherId);
    return {
      plans,
      total: plans.length,
      stats,
    };
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}
