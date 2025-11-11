import { http } from "./http";
import { Teacher, Subject, Room } from "./resources.schema";

const BASE = "/v1";

/**
 * Fetch all teachers for a school
 */
export async function getTeachers(schoolId: number) {
  const { data } = await http.get<Teacher[]>(`${BASE}/schools/${schoolId}/teachers`);
  return data;
}

/**
 * Fetch all subjects for a class
 */
export async function getSubjects(params: { class_id?: number; school_id?: number }) {
  const { data } = await http.get<Subject[]>(`${BASE}/subjects`, { params });
  return data;
}

/**
 * Fetch all rooms for a school
 */
export async function getRooms(schoolId: number) {
  const { data } = await http.get<Room[]>(`${BASE}/schools/${schoolId}/rooms`);
  return data;
}
