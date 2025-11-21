import { http } from "./http";
import {
  TimetableUpsert, TimetableEntry,
  KPISnapshot, ConflictCheckResponse,
  TimetableGenerateRequest
} from "./timetable.schema";
import { isDemoMode, mockTimetableProvider } from "../mockDataProviders";

const BASE = "/timetable"; // Backend uses /api/v1/timetable
const GEN  = "/timetable-generate"; // Backend uses /api/v1/timetable-generate

// Note: The backend doesn't have /grid and /kpis endpoints
// Available endpoints are:
// POST /timetable/ - create entry
// GET /timetable/classes/{class_id} - get timetable for class
// GET /timetable/teachers/{teacher_id} - get timetable for teacher
// GET /timetable/teacher/{teacher_id}/schedule - get teacher schedule with optional date filter
// GET /timetable/schedule-for-day - get daily schedule
// PUT /timetable/{entry_id} - update entry
// DELETE /timetable/{entry_id} - delete entry

// Grid & KPIs - These endpoints don't exist in backend, returning class timetable instead
export async function getTimetableGrid(params: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}): Promise<import("./timetable.schema").TimetableGrid> {
  // DEMO MODE: Return mock grid data
  if (isDemoMode()) {
    return mockTimetableProvider.getTimetableGrid(params);
  }

  // Backend doesn't have grid endpoint, using classes endpoint instead
  // Wrap the array response in TimetableGrid structure
  const { data } = await http.get<TimetableEntry[]>(`${BASE}/classes/${params.class_id}`);

  // Default periods if backend doesn't provide them
  const defaultPeriods = [
    { period_no: 1, start_time: "08:00", end_time: "08:45" },
    { period_no: 2, start_time: "08:50", end_time: "09:35" },
    { period_no: 3, start_time: "09:40", end_time: "10:25" },
    { period_no: 4, start_time: "10:45", end_time: "11:30" },
    { period_no: 5, start_time: "11:35", end_time: "12:20" },
    { period_no: 6, start_time: "12:25", end_time: "13:10" },
    { period_no: 7, start_time: "14:00", end_time: "14:45" },
    { period_no: 8, start_time: "14:50", end_time: "15:35" },
  ];

  return {
    academic_year_id: params.academic_year_id,
    class_id: params.class_id,
    section: params.section,
    week_start: params.week_start,
    periods: defaultPeriods,
    entries: data,
    conflicts: [],
  };
}

export async function getTimetableKPIs(params: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}) {
  // DEMO MODE: Return mock KPI data
  if (isDemoMode()) {
    return mockTimetableProvider.getTimetableKPIs(params);
  }

  // Backend doesn't have KPI endpoint, return empty data with correct structure
  return {
    coverage_pct: 0,
    conflicts_count: 0,
    free_periods: 0,
    room_util_pct: 0
  } as KPISnapshot;
}

// CRUD
export async function createEntry(payload: TimetableUpsert) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.createEntry(payload);
  }

  const { data } = await http.post<TimetableEntry>(`${BASE}`, payload);
  return data;
}
export async function updateEntry(id: number, patch: Partial<TimetableUpsert>) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.updateEntry(id, patch);
  }

  const { data } = await http.put<TimetableEntry>(`${BASE}/${id}`, patch);
  return data;
}
export async function deleteEntry(id: number) {
  // DEMO MODE: Mock delete
  if (isDemoMode()) {
    return mockTimetableProvider.deleteEntry(id);
  }

  await http.delete(`${BASE}/${id}`);
}

// Helpers
export async function swapEntries(payload: { a_id: number; b_id: number }) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.swapEntries(payload);
  }

  const { data } = await http.post<{ ok: true }>(`${GEN}/swap`, payload);
  return data;
}
export async function checkConflict(payload: TimetableUpsert) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.checkConflict(payload);
  }

  const { data } = await http.post<ConflictCheckResponse>(`${GEN}/check-conflict`, payload);
  return data;
}
export async function generateTimetable(payload: TimetableGenerateRequest) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.generateTimetable(payload);
  }

  const { data } = await http.post<{ job_id?: string; entries?: TimetableEntry[] }>(`${GEN}/generate`, payload);
  return data;
}
export async function publishWeek(payload: {
  academic_year_id: number; class_id: number; section: string; week_start: string; publish: boolean;
}) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockTimetableProvider.publishWeek(payload);
  }

  const { data } = await http.post<{ is_published: boolean }>(`${BASE}/publish`, payload);
  return data;
}
