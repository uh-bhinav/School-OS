import { http } from "./http";
import { Teacher, Subject, Room } from "./resources.schema";
import { isDemoMode, mockTeachersProvider, mockSubjectsProvider, mockRoomsProvider } from "../mockDataProviders";

/**
 * Fetch all teachers for a school
 * Backend endpoint: GET /api/v1/teachers/school/{school_id}
 */
export async function getTeachers(schoolId: number) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const mockData = await mockTeachersProvider.getTeachers(schoolId);
    // Transform to match schema
    return mockData.map(t => ({
      id: t.teacher_id,
      name: `${t.first_name} ${t.last_name}`,
      email: t.email,
      subjects: [], // Not used for now
    }));
  }

  const { data } = await http.get<Teacher[]>(`/teachers/school/${schoolId}`);
  return data;
}

/**
 * Fetch all subjects for a school
 * Backend endpoint: GET /api/v1/subjects/{school_id}/all
 */
export async function getSubjects(params: { class_id?: number; school_id?: number }) {
  if (!params.school_id) {
    return [];
  }

  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const mockData = await mockSubjectsProvider.getSubjects(params);
    // Transform to match schema
    return mockData.map(s => ({
      id: s.subject_id,
      name: s.subject_name,
      code: s.subject_code,
      class_id: s.grade_level,
    }));
  }

  // Backend uses /subjects/{school_id}/all endpoint
  const { data } = await http.get<Subject[]>(`/subjects/${params.school_id}/all`);
  return data;
}

/**
 * Fetch all rooms for a school
 * Note: Backend doesn't have a rooms endpoint yet
 * Returns empty array to avoid 404 errors
 */
export async function getRooms(schoolId: number) {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const mockData = await mockRoomsProvider.getRooms(schoolId);
    // Transform to match schema
    return mockData.map(r => ({
      id: r.room_id,
      name: `${r.room_name} (${r.room_number})`,
      capacity: r.capacity,
    }));
  }

  // Backend doesn't have rooms endpoint, return empty array
  return [] as Room[];
}
