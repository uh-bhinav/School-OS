// ============================================================================
// MOCK DATA PROVIDERS - CENTRAL EXPORT
// ============================================================================
// This file exports all mock data providers for easy import
// ============================================================================

export { mockAttendanceProvider } from "./mockAttendance";
export { mockExamsProvider } from "./mockExams";
export { mockTimetableProvider } from "./mockTimetable";
export { mockMarksProvider } from "./mockMarks";
export { mockAnnouncementsProvider } from "./mockAnnouncements";
export { mockCommunicationsProvider } from "./mockCommunications";
export { mockFeesProvider } from "./mockFees";
export { mockDashboardProvider } from "./mockDashboard";
export { mockClassesProvider } from "./mockClasses";
export { mockStudentsProvider } from "./mockStudents";
export { mockTeachersProvider, mockSubjectsProvider, mockRoomsProvider, mockTeacherProvider } from "./mockTeachers";
export { mockInvoicesProvider, mockPaymentsProvider, mockFeeComponentsProvider } from "./mockInvoices";
export { mockLeaderboardProvider } from "./mockLeaderboards";
export { mockAchievementProvider } from "./mockAchievements";
export { mockClubProvider } from "./mockClubs";
export { mockFinanceProvider } from "./mockFinance";
export { mockMediaProvider } from "./mockMedia";
export { mockStudentDetailsProvider } from "./mockStudentDetails";
export { mockReportCardProvider } from "./mockStudentReportCard";
export { mockProxyProvider } from "./mockProxy";
export { mockLeaveManagementProvider } from "./mockLeaveManagement";
export { mockTasksProvider } from "./mockTasks";

// ============================================================================
// DEMO MODE UTILITIES
// ============================================================================

/**
 * Check if demo mode is enabled
 * Demo mode uses local mock data instead of backend API
 */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

/**
 * Get a label for the current mode
 */
export function getModeLabel(): string {
  return isDemoMode() ? "DEMO MODE" : "LIVE MODE";
}

/**
 * Log demo mode status on app startup
 */
export function logDemoModeStatus(): void {
  if (isDemoMode()) {
    console.log(
      "%c🎭 DEMO MODE ENABLED",
      "background: #ff9800; color: #fff; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;"
    );
    console.log(
      "%cℹ️  All post-login features are using local mock data.",
      "color: #ff9800; font-size: 12px; padding: 4px 8px;"
    );
    console.log(
      "%cℹ️  Authentication is REAL (Supabase). Only /profiles/me and /schools/{id}/config use backend.",
      "color: #ff9800; font-size: 12px; padding: 4px 8px;"
    );
    console.log(
      "%c🔧 To disable demo mode: Set VITE_DEMO_MODE=false in .env.development",
      "color: #666; font-size: 11px; padding: 4px 8px;"
    );
  } else {
    console.log(
      "%c🔴 LIVE MODE - Using Real Backend",
      "background: #4caf50; color: #fff; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
    );
  }
}
