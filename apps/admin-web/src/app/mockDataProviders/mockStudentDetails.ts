// ============================================================================
// MOCK STUDENT DETAILS DATA PROVIDER
// ============================================================================

import { MOCK_STUDENTS, type StudentData } from "./mockStudents";

export interface StudentDetail extends StudentData {
  full_name: string;
  house?: string;
  emergency_contact?: string;
  emergency_contact_relation?: string;
  enrollment_status: "Active" | "Inactive" | "Transferred" | "Graduated";
  class_teacher_id?: number;
  class_teacher_name?: string;
  mentor_id?: number;
  mentor_name?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_email?: string;
  mother_occupation?: string;
  father_name?: string;
  father_phone?: string;
  father_email?: string;
  father_occupation?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relation?: string;
  previous_school?: string;
  transfer_certificate_no?: string;
  medical_conditions?: string[];
  allergies?: string[];
  special_needs?: string;
  profile_image_url?: string;
}

export interface StudentKpi {
  attendance_percentage: number;
  average_marks_percentage: number;
  subjects_enrolled: number;
  exams_appeared: number;
  achievements_earned: number;
  fees_pending: number;
  clubs_participated: number;
  rank_in_class?: number;
  total_students_in_class?: number;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStudentDetailById(studentId: number): Promise<StudentDetail | null> {
  await simulateDelay();

  const student = MOCK_STUDENTS.find((s) => s.student_id === studentId);
  if (!student) return null;

  const houses = ["Red House", "Blue House", "Green House", "Yellow House"];
  const occupations = ["Engineer", "Doctor", "Teacher", "Business", "Government Service", "Private Sector"];
  const medicalConditions = [
    ["Asthma"],
    [],
    ["Diabetes"],
    [],
    [],
    ["Seasonal Allergies"],
    [],
  ];
  const allergies = [
    ["Peanuts"],
    [],
    ["Dust"],
    [],
    ["Pollen"],
    [],
  ];

  const detail: StudentDetail = {
    ...student,
    full_name: `${student.first_name} ${student.last_name}`,
    house: houses[studentId % houses.length],
    emergency_contact: `+91-${9700000000 + studentId}`,
    emergency_contact_relation: "Grandfather",
    enrollment_status: student.is_active ? "Active" : "Inactive",
    class_teacher_id: student.class_id,
    class_teacher_name: `Teacher ${student.class_id}`,
    mentor_id: student.class_id,
    mentor_name: `Mentor ${student.class_id}`,

    // Parent details
    mother_name: `Mother of ${student.first_name}`,
    mother_phone: `+91-${9900000000 + studentId}`,
    mother_email: `mother.${student.last_name.toLowerCase()}@parent.com`,
    mother_occupation: occupations[studentId % occupations.length],

    father_name: student.parent_name || `Father of ${student.first_name}`,
    father_phone: student.parent_phone,
    father_email: student.parent_email,
    father_occupation: occupations[(studentId + 1) % occupations.length],

    guardian_name: studentId % 10 === 0 ? `Guardian of ${student.first_name}` : undefined,
    guardian_phone: studentId % 10 === 0 ? `+91-${9600000000 + studentId}` : undefined,
    guardian_email: studentId % 10 === 0 ? `guardian.${student.last_name.toLowerCase()}@guardian.com` : undefined,
    guardian_relation: studentId % 10 === 0 ? "Uncle" : undefined,

    previous_school: studentId % 5 === 0 ? "Previous School Name" : undefined,
    transfer_certificate_no: studentId % 5 === 0 ? `TC-${studentId}` : undefined,

    medical_conditions: medicalConditions[studentId % medicalConditions.length],
    allergies: allergies[studentId % allergies.length],
    special_needs: studentId % 20 === 0 ? "Requires extra time for exams" : undefined,
  };

  console.log(`[MOCK STUDENT DETAILS] getStudentDetailById(${studentId})`);
  return detail;
}

export async function getStudentKpi(studentId: number): Promise<StudentKpi> {
  await simulateDelay();

  // Generate realistic KPIs
  const attendanceBase = 75 + Math.random() * 20; // 75-95%
  const marksBase = 60 + Math.random() * 35; // 60-95%
  const subjectsCount = 5 + Math.floor(Math.random() * 3); // 5-7 subjects
  const examsCount = 3 + Math.floor(Math.random() * 3); // 3-5 exams
  const achievementsCount = Math.floor(Math.random() * 8); // 0-7 achievements
  const feesPending = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
  const clubsCount = Math.floor(Math.random() * 4); // 0-3 clubs

  const kpi: StudentKpi = {
    attendance_percentage: Math.round(attendanceBase * 10) / 10,
    average_marks_percentage: Math.round(marksBase * 10) / 10,
    subjects_enrolled: subjectsCount,
    exams_appeared: examsCount,
    achievements_earned: achievementsCount,
    fees_pending: feesPending,
    clubs_participated: clubsCount,
    rank_in_class: Math.floor(Math.random() * 40) + 1,
    total_students_in_class: 40,
  };

  console.log(`[MOCK STUDENT DETAILS] getStudentKpi(${studentId})`);
  return kpi;
}

export const mockStudentDetailsProvider = {
  getStudentDetailById,
  getStudentKpi,
};
