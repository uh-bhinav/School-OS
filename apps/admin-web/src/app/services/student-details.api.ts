// ============================================================================
// STUDENT DETAILS API SERVICE
// ============================================================================

import { isDemoMode } from "../mockDataProviders";
import {
  mockStudentDetailsProvider,
  type StudentDetail,
  type StudentKpi,
} from "../mockDataProviders/mockStudentDetails";
import { mockReportCardProvider, type ReportCard } from "../mockDataProviders/mockStudentReportCard";

/**
 * Get detailed student information by ID
 */
export async function getStudentDetails(studentId: number): Promise<StudentDetail | null> {
  if (isDemoMode()) {
    return mockStudentDetailsProvider.getStudentDetailById(studentId);
  }

  // Real API call would go here
  const response = await fetch(`/api/v1/students/${studentId}/details`);
  if (!response.ok) return null;
  return response.json();
}

/**
 * Get student KPI metrics
 */
export async function getStudentKpi(studentId: number): Promise<StudentKpi> {
  if (isDemoMode()) {
    return mockStudentDetailsProvider.getStudentKpi(studentId);
  }

  // Real API call would go here
  const response = await fetch(`/api/v1/students/${studentId}/kpi`);
  if (!response.ok) throw new Error("Failed to fetch student KPI");
  return response.json();
}

/**
 * Get student report cards
 */
export async function getStudentReportCards(studentId: number): Promise<ReportCard[]> {
  if (isDemoMode()) {
    return mockReportCardProvider.getStudentReportCards(studentId);
  }

  // Real API call would go here
  const response = await fetch(`/api/v1/students/${studentId}/report-cards`);
  if (!response.ok) throw new Error("Failed to fetch report cards");
  return response.json();
}

/**
 * Get student report card by exam
 */
export async function getStudentReportCardByExam(
  studentId: number,
  examId: number
): Promise<ReportCard | null> {
  if (isDemoMode()) {
    return mockReportCardProvider.getStudentReportCardByExam(studentId, examId);
  }

  // Real API call would go here
  const response = await fetch(`/api/v1/students/${studentId}/report-cards/exam/${examId}`);
  if (!response.ok) return null;
  return response.json();
}
