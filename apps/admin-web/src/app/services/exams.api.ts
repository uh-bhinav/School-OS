import { http } from "./http";
import { Exam, ExamKPI, ExamType } from "./exams.schema";

const BASE = "/api/v1/exams";
const TYPES = "/api/v1/exam_types";
const KPI = "/api/v1/exams/kpi";

// ==============
// Exam APIs
// ==============
export async function getExams(params: {
  academic_year_id: number;
  class_id?: number;
  section?: string;
}) {
  const { data } = await http.get<Exam[]>(BASE, { params });
  return data;
}

export async function getExamTypes(school_id: number) {
  const { data } = await http.get<ExamType[]>(`${TYPES}/${school_id}`);
  return data;
}

export async function createExam(payload: Partial<Exam>) {
  const { data } = await http.post<Exam>(BASE, payload);
  return data;
}

export async function updateExam(id: number, payload: Partial<Exam>) {
  const { data } = await http.put<Exam>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteExam(id: number) {
  await http.delete(`${BASE}/${id}`);
}

export async function publishExam(id: number, publish: boolean) {
  const { data } = await http.post(`${BASE}/${id}/publish`, { publish });
  return data;
}

export async function getExamKPI(params: {
  academic_year_id: number;
  class_id?: number;
}) {
  const { data } = await http.get<ExamKPI>(KPI, { params });
  return data;
}
