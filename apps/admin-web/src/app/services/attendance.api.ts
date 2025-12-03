// services/attendance.api.ts
import { http } from "./http";
import {
  AttendanceCreate, AttendanceRecord,
  WeeklySummary, ClassRange, StudentHistory
} from "./attendance.schema";
import { isDemoMode, mockAttendanceProvider } from "../mockDataProviders";

const BASE = "/attendance"; // Backend uses /api/v1/attendance

/**
 * List attendance records for a student
 * Backend endpoint: GET /api/v1/attendance/?student_id={id}&start_date={date}&end_date={date}
 * Note: Backend requires student_id, not class_id
 */
export async function listAttendance(params: {
  student_id: number;
  start_date?: string;
  end_date?: string;
}) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const start = params.start_date || "";
    const end = params.end_date || new Date().toISOString().split("T")[0];
    const allRecords = await mockAttendanceProvider.getStudentHistory(params.student_id);
    return allRecords.records
      .filter(r => !start || r.date >= start)
      .filter(r => !end || r.date <= end)
      .map(r => ({
        attendance_id: 0,
        student_id: params.student_id,
        class_id: r.class_id,
        date: r.date,
        status: r.status,
        remarks: r.remarks,
        marked_by: "System",
        marked_at: r.date + "T09:00:00Z",
      }));
  }

  const { data } = await http.get<AttendanceRecord[]>(`${BASE}/`, { params });
  return data;
}

/**
 * Get attendance for a class on a specific date
 * Note: Backend doesn't have this endpoint, using class range endpoint with same start/end date
 * Returns: { items: AttendanceRecord[], total: number }
 */
export async function getClassAttendanceForDate(class_id: number, date: string) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const records = await mockAttendanceProvider.getClassAttendanceForDate(class_id, date);
    return {
      items: records,
      total: records.length,
    };
  }

  const { data } = await http.get<AttendanceRecord[]>(`${BASE}/class/${class_id}/range`, {
    params: {
      start_date: date,
      end_date: date
    }
  });

  // Wrap in expected format
  return {
    items: data,
    total: data.length,
  };
}

export async function createAttendance(payload: AttendanceCreate) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockAttendanceProvider.create(payload);
  }

  const { data } = await http.post<AttendanceRecord>(`${BASE}/`, payload);
  return data;
}

export async function updateAttendance(attendance_id: number, patch: Partial<AttendanceCreate>) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockAttendanceProvider.update(attendance_id, patch);
  }

  const { data } = await http.put<AttendanceRecord>(`${BASE}/${attendance_id}`, patch);
  return data;
}

export async function deleteAttendance(attendance_id: number) {
  // DEMO MODE: Mock delete
  if (isDemoMode()) {
    return mockAttendanceProvider.delete(attendance_id);
  }

  await http.delete(`${BASE}/${attendance_id}`);
}

export async function createBulkAttendance(rows: AttendanceCreate[]) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    await mockAttendanceProvider.createBulk(rows);
    return { inserted: rows.length, failed: 0 };
  }

  const { data } = await http.post(`${BASE}/bulk`, { rows });
  return data; // { inserted: n, failed: m }
}

export async function getClassRange(class_id: number, start_date: string, end_date: string) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockAttendanceProvider.getClassRange(class_id, start_date, end_date);
  }

  const { data } = await http.get<ClassRange>(`${BASE}/class/${class_id}/range`, {
    params: { start_date, end_date }
  });
  return data;
}

/**
 * Get weekly attendance summary for a class
 * Backend endpoint: GET /api/v1/attendance/class/{class_id}/summary?week_start_date={date}
 * Note: week_start_date is REQUIRED by backend
 */
export async function getClassWeeklySummary(class_id: number, week_start_date: string) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockAttendanceProvider.getWeeklySummary(class_id, week_start_date);
  }

  const { data } = await http.get<WeeklySummary>(`${BASE}/class/${class_id}/summary`, {
    params: { week_start_date }
  });
  return data;
}

export async function getStudentHistory(student_id: number) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockAttendanceProvider.getStudentHistory(student_id);
  }

  const { data } = await http.get<StudentHistory>(`${BASE}/students/${student_id}`);
  return data;
}
