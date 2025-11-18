// src/services/queries/dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';
import { isDemoMode, mockDashboardProvider } from '../../mockDataProviders';

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
      // DEMO MODE: Return mock data
      if (isDemoMode()) {
        const mockData = await mockDashboardProvider.getDashboardMetrics();
        return {
          total_students: mockData.total_students,
          total_teachers: mockData.total_teachers,
          total_classes: mockData.total_classes,
          pending_fees: mockData.revenue.pending,
          announcements_count: mockData.pending_announcements,
          attendance_percentage: mockData.attendance_today.percentage,
          student_growth_percentage: 8.5,
          fee_collection_percentage: ((mockData.revenue.collected_this_month / mockData.revenue.total) * 100),
          admission_growth_percentage: 5.2,
          announcement_growth_percentage: 12.3,
        };
      }

      const response = await http.get<DashboardMetrics>(
        `/schools/${schoolId}/dashboard/metrics`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!schoolId,
    retry: 2,
  });
}

export function useRevenueData(schoolId: number, months: number = 8) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', schoolId, months],
    queryFn: async () => {
      // DEMO MODE: Return mock data
      if (isDemoMode()) {
        const mockData = await mockDashboardProvider.getRevenueByMonth();
        return mockData.map(d => ({
          month: d.month,
          fees: d.revenue,
          expenses: Math.floor(d.revenue * 0.6),
          admissions: Math.floor(d.revenue * 0.15),
        }));
      }

      const response = await http.get<RevenueDataPoint[]>(
        `/schools/${schoolId}/dashboard/revenue`,
        { params: { months } }
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!schoolId,
    retry: 2,
  });
}

export function useStudentDistribution(schoolId: number) {
  return useQuery({
    queryKey: ['dashboard', 'students', 'distribution', schoolId],
    queryFn: async () => {
      // DEMO MODE: Return mock data
      if (isDemoMode()) {
        return [
          { grade_range: "Grade 1-2", count: 152, percentage: 19 },
          { grade_range: "Grade 3-4", count: 160, percentage: 20 },
          { grade_range: "Grade 5-6", count: 156, percentage: 19.5 },
          { grade_range: "Grade 7-8", count: 148, percentage: 18.5 },
          { grade_range: "Grade 9-10", count: 184, percentage: 23 },
        ];
      }

      const response = await http.get<StudentDistribution[]>(
        `/schools/${schoolId}/dashboard/student-distribution`
      );
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!schoolId,
    retry: 2,
  });
}

export function useAttendanceByGrade(schoolId: number, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['dashboard', 'attendance', schoolId, dateRange],
    queryFn: async () => {
      // DEMO MODE: Return mock data
      if (isDemoMode()) {
        const mockData = await mockDashboardProvider.getAttendanceByGrade();
        return mockData.map(d => ({
          grade: d.grade,
          present_percentage: d.percentage,
          absent_percentage: ((d.absent / d.total) * 100),
          total_students: d.total,
        }));
      }

      const response = await http.get<AttendanceByGrade[]>(
        `/schools/${schoolId}/dashboard/attendance-by-grade`,
        { params: dateRange }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!schoolId,
    retry: 2,
  });
}

export function useModuleUsage(schoolId: number, days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'module-usage', schoolId, days],
    queryFn: async () => {
      // DEMO MODE: Return mock data
      if (isDemoMode()) {
        const mockData = await mockDashboardProvider.getModuleUsage();
        return mockData.map(d => ({
          module_key: d.module_name.toLowerCase().replace(/\s+/g, '_'),
          module_name: d.module_name,
          usage_percentage: Math.floor((d.usage_count / 1500) * 100),
          active_users: Math.floor(d.usage_count / 35),
        }));
      }

      const response = await http.get<ModuleUsage[]>(
        `/schools/${schoolId}/dashboard/module-usage`,
        { params: { days } }
      );
      return response.data;
    },
    staleTime: 15 * 60 * 1000,
    enabled: !!schoolId,
    retry: 2,
  });
}
