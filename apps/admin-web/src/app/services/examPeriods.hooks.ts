// apps/admin-web/src/app/services/examPeriods.hooks.ts
/**
 * React Query hooks for exam period management
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./http";

const API_BASE = "/exam-periods";

// Types
export interface ExamPeriodCreate {
  school_id: number;
  academic_year_id: number;
  class_id: number;
  section: string;
  exam_period_name: string;
  exam_type_id: number;
  start_date: string;
  end_date: string;
  total_marks: number;
  state?: string;
  auto_map: boolean;
}

export interface SubjectSchedule {
  id: number;
  exam_period_id: number;
  subject_id: number;
  subject_name?: string;
  exam_date: string;
  start_time?: string;
  duration_minutes: number;
  max_marks: number;
  is_auto_mapped: boolean;
}

export interface ExamPeriod {
  id: number;
  school_id: number;
  academic_year_id: number;
  class_id: number;
  section: string;
  exam_period_name: string;
  exam_type_id: number;
  start_date: string;
  end_date: string;
  total_marks: number;
  status: string;
  created_at: string;
  subject_schedules: SubjectSchedule[];
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  holiday_type: string;
  state?: string;
  description?: string;
}

export interface HallTicket {
  id: number;
  ticket_number: string;
  exam_period_id: number;
  student_id: number;
  generated_at: string;
  pdf_url?: string;
}

// Hooks

export function useCreateExamPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExamPeriodCreate) => {
      const response = await http.post(`${API_BASE}/periods`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-periods"] });
    },
  });
}

export function useExamPeriods(filters: {
  school_id: number;
  academic_year_id?: number;
  class_id?: number;
  section?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["exam-periods", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("school_id", filters.school_id.toString());
      if (filters.academic_year_id) params.append("academic_year_id", filters.academic_year_id.toString());
      if (filters.class_id) params.append("class_id", filters.class_id.toString());
      if (filters.section) params.append("section", filters.section);
      if (filters.status) params.append("status", filters.status);

      const response = await http.get(`${API_BASE}/periods?${params.toString()}`);
      return response.data as ExamPeriod[];
    },
  });
}

export function useExamPeriod(periodId: number) {
  return useQuery({
    queryKey: ["exam-period", periodId],
    queryFn: async () => {
      const response = await http.get(`${API_BASE}/periods/${periodId}`);
      return response.data as ExamPeriod;
    },
    enabled: !!periodId,
  });
}

export function useFinalizeExamPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: number) => {
      const response = await http.post(`${API_BASE}/periods/${periodId}/finalize`);
      return response.data;
    },
    onSuccess: (_, periodId) => {
      queryClient.invalidateQueries({ queryKey: ["exam-period", periodId] });
      queryClient.invalidateQueries({ queryKey: ["exam-periods"] });
    },
  });
}

export function useUpdateSubjectSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      data,
    }: {
      scheduleId: number;
      data: {
        exam_date: string;
        start_time?: string;
        duration_minutes?: number;
        max_marks?: number;
      };
    }) => {
      const response = await http.put(`${API_BASE}/schedules/${scheduleId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-periods"] });
    },
  });
}

export function useValidExamDates(startDate: string, endDate: string, schoolId?: number, state?: string) {
  return useQuery({
    queryKey: ["valid-exam-dates", startDate, endDate, schoolId, state],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("start_date", startDate);
      params.append("end_date", endDate);
      if (schoolId) params.append("school_id", schoolId.toString());
      if (state) params.append("state", state);

      const response = await http.get(`${API_BASE}/valid-dates?${params.toString()}`);
      return response.data as string[];
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useHolidays(startDate: string, endDate: string, schoolId?: number, state?: string) {
  return useQuery({
    queryKey: ["holidays", startDate, endDate, schoolId, state],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("start_date", startDate);
      params.append("end_date", endDate);
      if (schoolId) params.append("school_id", schoolId.toString());
      if (state) params.append("state", state);

      const response = await http.get(`${API_BASE}/holidays?${params.toString()}`);
      return response.data as Holiday[];
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useGenerateHallTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: number) => {
      const response = await http.post(`${API_BASE}/periods/${periodId}/hall-tickets`);
      return response.data as HallTicket[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hall-tickets"] });
    },
  });
}

export function useHallTicket(ticketId: number) {
  return useQuery({
    queryKey: ["hall-ticket", ticketId],
    queryFn: async () => {
      const response = await http.get(`${API_BASE}/hall-tickets/${ticketId}`);
      return response.data;
    },
    enabled: !!ticketId,
  });
}

export function useStudentHallTicket(studentId: number, periodId: number) {
  return useQuery({
    queryKey: ["student-hall-ticket", studentId, periodId],
    queryFn: async () => {
      const response = await http.get(`${API_BASE}/students/${studentId}/hall-tickets/${periodId}`);
      return response.data;
    },
    enabled: !!studentId && !!periodId,
  });
}
