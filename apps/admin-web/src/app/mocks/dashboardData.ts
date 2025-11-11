// src/app/mocks/dashboardData.ts
/**
 * Mock Dashboard Data
 *
 * Realistic mock data for all dashboard charts and metrics.
 * This data can be easily replaced with real API calls later.
 *
 * Data includes:
 * - Dashboard metrics (KPIs)
 * - Revenue data (8 months)
 * - Student distribution by grade
 * - Attendance by grade (with thresholds)
 * - Module usage statistics
 * - Key insights
 */

import {
  DashboardMetrics,
  RevenueDataPoint,
  StudentDistribution,
  AttendanceByGrade,
  ModuleUsage
} from '../services/queries/dashboard';
import { Insight } from '../components/dashboard/KeyInsightsSummary';

// ==================== DASHBOARD METRICS ====================

export const mockDashboardMetrics: DashboardMetrics = {
  total_students: 1247,
  total_teachers: 68,
  total_classes: 42,
  pending_fees: 285000000, // ₹28.5 Lakhs in paisa
  announcements_count: 12,
  attendance_percentage: 92.5,
  student_growth_percentage: 5.2,
  fee_collection_percentage: 12.8,
  admission_growth_percentage: 8.3,
  announcement_growth_percentage: -2.1,
};

// ==================== REVENUE DATA (8 Months) ====================

export const mockRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', fees: 245000, expenses: 180000, admissions: 15 },
  { month: 'Feb', fees: 268000, expenses: 175000, admissions: 22 },
  { month: 'Mar', fees: 312000, expenses: 195000, admissions: 35 },
  { month: 'Apr', fees: 425000, expenses: 210000, admissions: 68 },
  { month: 'May', fees: 398000, expenses: 205000, admissions: 52 },
  { month: 'Jun', fees: 289000, expenses: 185000, admissions: 18 },
  { month: 'Jul', fees: 265000, expenses: 190000, admissions: 12 },
  { month: 'Aug', fees: 305000, expenses: 188000, admissions: 25 },
];

// ==================== STUDENT DISTRIBUTION ====================

export const mockStudentDistribution: StudentDistribution[] = [
  { grade_range: 'Grades 1-3', count: 342, percentage: 27.4 },
  { grade_range: 'Grades 4-6', count: 385, percentage: 30.9 },
  { grade_range: 'Grades 7-8', count: 246, percentage: 19.7 },
  { grade_range: 'Grades 9-10', count: 198, percentage: 15.9 },
  { grade_range: 'Grades 11-12', count: 76, percentage: 6.1 },
];

// ==================== ATTENDANCE BY GRADE (with thresholds) ====================

export const mockAttendanceByGrade: AttendanceByGrade[] = [
  { grade: 'Grade 1', present_percentage: 94.5, absent_percentage: 5.5, total_students: 128 },
  { grade: 'Grade 2', present_percentage: 93.2, absent_percentage: 6.8, total_students: 115 },
  { grade: 'Grade 3', present_percentage: 95.8, absent_percentage: 4.2, total_students: 99 },
  { grade: 'Grade 4', present_percentage: 91.5, absent_percentage: 8.5, total_students: 132 },
  { grade: 'Grade 5', present_percentage: 88.7, absent_percentage: 11.3, total_students: 125 },
  { grade: 'Grade 6', present_percentage: 92.3, absent_percentage: 7.7, total_students: 128 },
  { grade: 'Grade 7', present_percentage: 87.2, absent_percentage: 12.8, total_students: 118 },
  { grade: 'Grade 8', present_percentage: 89.5, absent_percentage: 10.5, total_students: 128 },
  { grade: 'Grade 9', present_percentage: 90.8, absent_percentage: 9.2, total_students: 102 },
  { grade: 'Grade 10', present_percentage: 93.1, absent_percentage: 6.9, total_students: 96 },
  { grade: 'Grade 11', present_percentage: 85.4, absent_percentage: 14.6, total_students: 42 },
  { grade: 'Grade 12', present_percentage: 88.9, absent_percentage: 11.1, total_students: 34 },
];

// ==================== MODULE USAGE ====================

export const mockModuleUsage: ModuleUsage[] = [
  { module_key: 'academics.attendance', module_name: 'Attendance', usage_percentage: 87, active_users: 52 },
  { module_key: 'academics.timetable', module_name: 'Timetable', usage_percentage: 72, active_users: 38 },
  { module_key: 'finance.fees', module_name: 'Fee Management', usage_percentage: 94, active_users: 18 },
  { module_key: 'academics.exams', module_name: 'Exams', usage_percentage: 65, active_users: 45 },
  { module_key: 'comms.announcements', module_name: 'Announcements', usage_percentage: 81, active_users: 28 },
  { module_key: 'media.media', module_name: 'Media Gallery', usage_percentage: 58, active_users: 22 },
];

// ==================== KEY INSIGHTS ====================

export const mockKeyInsights: Insight[] = [
  {
    type: 'success',
    category: 'Academics',
    message: 'Attendance improved by 5% this week — Grades 3 and 6 showed the biggest improvement after parent-teacher meetings.',
  },
  {
    type: 'success',
    category: 'Finance',
    message: 'Fee collection increased by 12.8% this month — automated reminders helped recover ₹4.2L in pending fees.',
  },
  {
    type: 'warning',
    category: 'Academics',
    message: 'Grade 7 attendance is at 87.2% (below 90% target) — consider investigating recurring absences in this grade.',
  },
  {
    type: 'warning',
    category: 'Administration',
    message: 'Grade 9 sections are nearing full capacity (198/210 seats) — consider opening an additional section for next term.',
  },
  {
    type: 'info',
    category: 'Communication',
    message: 'Only 68% of parents opened the last circular — consider using SMS follow-ups for important announcements.',
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get attendance status based on percentage
 */
export function getAttendanceStatus(percentage: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (percentage >= 95) return 'excellent';
  if (percentage >= 90) return 'good';
  if (percentage >= 80) return 'warning';
  return 'critical';
}

/**
 * Get color for attendance percentage
 */
export function getAttendanceColor(percentage: number): string {
  const status = getAttendanceStatus(percentage);
  switch (status) {
    case 'excellent':
    case 'good':
      return '#2e7d32'; // Green
    case 'warning':
      return '#ed6c02'; // Orange
    case 'critical':
      return '#d32f2f'; // Red
  }
}

/**
 * Format currency in Indian format (₹)
 */
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}
