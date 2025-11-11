import { http } from "./http";
import { Mark, MarksKpi, ClassPerformance, StudentProgress } from "./marks.schema";

// API endpoints for marks module
// These will be swapped with real backend endpoints later
// Current MSW mocks use /api/v1/marks pattern

export const getMarks = async (params?: Record<string, any>) => {
  const res = await http.get<Mark[]>("/api/v1/marks", { params });
  return res.data;
};

export const getMarksKpi = async (params?: Record<string, any>) => {
  const res = await http.get<MarksKpi>("/api/v1/marks/kpi", { params });
  return res.data;
};

export const getClassPerformance = async (class_id: number, exam_id: number) => {
  const res = await http.get<ClassPerformance[]>(`/api/v1/marks/performance/class/${class_id}/exam/${exam_id}`);
  return res.data;
};

export const getStudentProgress = async (student_id: number, subject_id: number) => {
  const res = await http.get<StudentProgress>(`/api/v1/marks/progression/student/${student_id}/subject/${subject_id}`);
  return res.data;
};

export const createMark = async (payload: Partial<Mark>) => {
  const res = await http.post("/api/v1/marks", payload);
  return res.data;
};

export const updateMark = async (mark_id: number, payload: Partial<Mark>) => {
  const res = await http.put(`/api/v1/marks/${mark_id}`, payload);
  return res.data;
};

export const deleteMark = async (mark_id: number) => {
  const res = await http.delete(`/api/v1/marks/${mark_id}`);
  return res.data;
};

export const bulkUploadMarks = async (marks: Partial<Mark>[]) => {
  const res = await http.post("/api/v1/marks/bulk", { marks });
  return res.data;
};
