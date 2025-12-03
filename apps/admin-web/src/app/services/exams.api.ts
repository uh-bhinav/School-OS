import { http } from "./http";
import { Exam, ExamKPI, ExamType } from "./exams.schema";
import { useAuthStore } from "../stores/useAuthStore";
import { isDemoMode, mockExamsProvider } from "../mockDataProviders";

const BASE = "/exams";

// ==============
// Exam APIs
// ==============
export async function getExams(params: {
  academic_year_id: number;
  class_id?: number;
  section?: string;
}) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.getExams(params);
  }

  // Backend only has /exams/all/{school_id} endpoint
  // Get school_id from auth store
  const school_id = useAuthStore.getState().schoolId;

  if (!school_id) {
    console.error("[EXAMS API] No school_id in auth store - cannot fetch exams");
    return [];
  }

  const { data } = await http.get<Exam[]>(`${BASE}/all/${school_id}`);
  return data;
}

export async function getExamTypes(school_id: number) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.getExamTypes(school_id);
  }

  // Backend doesn't have exam types by school endpoint
  // The endpoint is /exam-types/{exam_type_id} for getting a single exam type
  // Return empty array for now until backend implements list endpoint
  return [] as ExamType[];
}

export async function createExam(payload: Partial<Exam>) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.create(payload);
  }

  const { data } = await http.post<Exam>(`${BASE}/`, payload);
  return data;
}

export async function updateExam(id: number, payload: Partial<Exam>) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.update(id, payload);
  }

  const { data } = await http.put<Exam>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteExam(id: number) {
  // DEMO MODE: Mock delete
  if (isDemoMode()) {
    return mockExamsProvider.delete(id);
  }

  await http.delete(`${BASE}/${id}`);
}

export async function publishExam(id: number, publish: boolean) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.publish(id, publish);
  }

  // Backend doesn't have publish endpoint, use update instead
  const { data } = await http.put(`${BASE}/${id}`, { is_published: publish });
  return data;
}

export async function getExamKPI(params: {
  academic_year_id: number;
  class_id?: number;
}) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockExamsProvider.getExamKPI(params);
  }

  // Backend doesn't have KPI endpoint, return mock data with correct structure
  return {
    total_exams: 0,
    avg_performance: 0,
    pass_rate: 0,
    pending_results: 0,
    published_count: 0
  } as ExamKPI;
}
