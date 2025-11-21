// ============================================================================
// MOCK TEACHER DETAILS DATA PROVIDER
// ============================================================================

import { MOCK_TEACHERS } from "./mockTeachers";

export interface TeacherDetail {
  teacher_id: number;
  school_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  employee_id: string;
  date_of_joining: string;
  qualification: string;
  specialization: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  // Extended fields
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  blood_group: string;
  emergency_contact: string;
  emergency_contact_relation: string;
  profile_image_url?: string;
  experience_years: number;
  employment_status: "Active" | "On Leave" | "Resigned" | "Retired";
  department: string;
  salary_grade?: string;
  office_location?: string;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateExperience(joiningDate: string): number {
  const diff = new Date().getTime() - new Date(joiningDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export async function getTeacherDetailById(teacherId: number): Promise<TeacherDetail | null> {
  await simulateDelay();

  const teacher = MOCK_TEACHERS.find((t) => t.teacher_id === teacherId);
  if (!teacher) return null;

  const experienceYears = calculateExperience(teacher.date_of_joining);
  const genders: ("Male" | "Female" | "Other")[] = ["Male", "Female", "Male", "Female", "Male"];
  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Pune"];
  const departments = ["Science", "Mathematics", "Languages", "Social Studies", "Arts", "Sports"];
  const grades = ["A", "B", "C"];
  const locations = ["Main Building", "Science Block", "Arts Block", "Sports Complex"];

  const detail: TeacherDetail = {
    ...teacher,
    full_name: `${teacher.first_name} ${teacher.last_name}`,
    date_of_birth: `${1980 + (teacherId % 15)}-${String((teacherId % 12) + 1).padStart(2, "0")}-${String((teacherId % 28) + 1).padStart(2, "0")}`,
    gender: genders[teacherId % genders.length],
    address: `${Math.floor(Math.random() * 999) + 1}, Sector ${teacherId % 50 + 1}, ${cities[teacherId % cities.length]}, India`,
    blood_group: bloodGroups[teacherId % bloodGroups.length],
    emergency_contact: `+91-98765${String(43210 + teacherId).slice(-5)}`,
    emergency_contact_relation: teacherId % 2 === 0 ? "Spouse" : "Parent",
    experience_years: experienceYears,
    employment_status: teacher.is_active ? "Active" : "On Leave",
    department: departments[teacherId % departments.length],
    salary_grade: `Grade ${grades[teacherId % grades.length]}`,
    office_location: locations[teacherId % locations.length],
  };

  console.log(`[MOCK TEACHER DETAILS] getTeacherDetailById(${teacherId})`);
  return detail;
}

export const mockTeacherDetailsProvider = {
  getTeacherDetailById,
};
