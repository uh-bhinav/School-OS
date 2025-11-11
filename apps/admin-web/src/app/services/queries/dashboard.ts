// src/services/queries/dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';

// Types for dashboard metrics
export interface DashboardMetrics {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  pending_fees: number;
  announcements_count: number;
  attendance_percentage: number;
  student_growth_percentage: number;
  fee_collection_percentage: number;
  admission_growth_percentage: number;
  announcement_growth_percentage: number;
}

export interface RevenueDataPoint {
  month: string;
  fees: number;
  expenses: number;
  admissions: number;
}

export interface StudentDistribution {
  grade_range: string;
  count: number;
  percentage: number;
}

export interface AttendanceByGrade {
  grade: string;
  present_percentage: number;
  absent_percentage: number;
  total_students: number;
}

export interface ModuleUsage {
  module_key: string;
  module_name: string;
  usage_percentage: number;
  active_users: number;
}

// Query hooks
export function useDashboardMetrics(schoolId: number) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', schoolId],
    queryFn: async () => {
      const response = await http.get<DashboardMetrics>(
        `/schools/${schoolId}/dashboard/metrics`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!schoolId,
  });
}

export function useRevenueData(schoolId: number, months: number = 8) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', schoolId, months],
    queryFn: async () => {
      const response = await http.get<RevenueDataPoint[]>(
        `/schools/${schoolId}/dashboard/revenue`,
        { params: { months } }
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!schoolId,
  });
}

export function useStudentDistribution(schoolId: number) {
  return useQuery({
    queryKey: ['dashboard', 'students', 'distribution', schoolId],
    queryFn: async () => {
      const response = await http.get<StudentDistribution[]>(
        `/schools/${schoolId}/dashboard/student-distribution`
      );
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!schoolId,
  });
}

export function useAttendanceByGrade(schoolId: number, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['dashboard', 'attendance', schoolId, dateRange],
    queryFn: async () => {
      const response = await http.get<AttendanceByGrade[]>(
        `/schools/${schoolId}/dashboard/attendance-by-grade`,
        { params: dateRange }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!schoolId,
  });
}

export function useModuleUsage(schoolId: number, days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'module-usage', schoolId, days],
    queryFn: async () => {
      const response = await http.get<ModuleUsage[]>(
        `/schools/${schoolId}/dashboard/module-usage`,
        { params: { days } }
      );
      return response.data;
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!schoolId,
  });
}
