// services/attendance.api.ts
import { http } from "./http";
import {
  AttendanceCreate, AttendanceListResponse, AttendanceRecord,
  WeeklySummary, ClassRange, StudentHistory
} from "./attendance.schema";

const BASE = "/v1/attendance"; // pick one prefix (/v1 or /api/v1) & be consistent

export async function listAttendance(params: {
  class_id?: number; date?: string; page?: number; page_size?: number;
}) {
  const { data } = await http.get<AttendanceListResponse>(`${BASE}/`, { params });
  return data;
}

export async function createAttendance(payload: AttendanceCreate) {
  const { data } = await http.post<AttendanceRecord>(`${BASE}/`, payload);
  return data;
}

export async function updateAttendance(attendance_id: number, patch: Partial<AttendanceCreate>) {
  const { data } = await http.put<AttendanceRecord>(`${BASE}/${attendance_id}`, patch);
  return data;
}

export async function deleteAttendance(attendance_id: number) {
  await http.delete(`${BASE}/${attendance_id}`);
}

export async function createBulkAttendance(rows: AttendanceCreate[]) {
  const { data } = await http.post(`${BASE}/bulk`, { rows });
  return data; // { inserted: n, failed: m }
}

export async function getClassRange(class_id: number, from: string, to: string) {
  const { data } = await http.get<ClassRange>(`${BASE}/class/${class_id}/range`, { params: { from, to } });
  return data;
}

export async function getClassWeeklySummary(class_id: number, week_start?: string) {
  const { data } = await http.get<WeeklySummary>(`${BASE}/class/${class_id}/summary`, { params: { week_start } });
  return data;
}

export async function getStudentHistory(student_id: number) {
  const { data } = await http.get<StudentHistory>(`${BASE}/students/${student_id}`);
  return data;
}
