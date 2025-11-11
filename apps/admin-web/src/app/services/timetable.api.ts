import { http } from "./http";
import {
  TimetableGrid, TimetableUpsert, TimetableEntry,
  KPISnapshot, ConflictCheckResponse
} from "./timetable.schema";

const BASE = "/v1/timetable";
const GEN  = "/v1/timetable_generation";

// Grid & KPIs
export async function getTimetableGrid(params: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}) {
  const { data } = await http.get<TimetableGrid>(`${BASE}/grid`, { params });
  return data;
}
export async function getTimetableKPIs(params: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}) {
  const { data } = await http.get<KPISnapshot>(`${BASE}/kpis`, { params });
  return data;
}

// CRUD
export async function createEntry(payload: TimetableUpsert) {
  const { data } = await http.post<TimetableEntry>(`${BASE}`, payload);
  return data;
}
export async function updateEntry(id: number, patch: Partial<TimetableUpsert>) {
  const { data } = await http.put<TimetableEntry>(`${BASE}/${id}`, patch);
  return data;
}
export async function deleteEntry(id: number) {
  await http.delete(`${BASE}/${id}`);
}

// Helpers
export async function swapEntries(payload: { a_id: number; b_id: number }) {
  const { data } = await http.post<{ ok: true }>(`${GEN}/swap`, payload);
  return data;
}
export async function checkConflict(payload: TimetableUpsert) {
  const { data } = await http.post<ConflictCheckResponse>(`${GEN}/check-conflict`, payload);
  return data;
}
export async function generateTimetable(payload: {
  academic_year_id: number; class_id: number; section: string;
}) {
  const { data } = await http.post<{ job_id?: string; entries?: TimetableEntry[] }>(`${GEN}/generate`, payload);
  return data;
}
export async function publishWeek(payload: {
  academic_year_id: number; class_id: number; section: string; week_start: string; publish: boolean;
}) {
  const { data } = await http.post<{ is_published: boolean }>(`${BASE}/publish`, payload);
  return data;
}
