// ============================================================================
// MOCK STUDENTS DATA PROVIDER
// ============================================================================

export interface StudentData {
  student_id: number;
  school_id: number;
  class_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  admission_date: string;
  section: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  is_active: boolean;
  created_at: string;
}

// Generate realistic student names
const firstNames = {
  male: ["Aarav", "Arjun", "Vihaan", "Aditya", "Aryan", "Shaurya", "Advaith", "Arnav", "Vedant", "Dhruv"],
  female: ["Aadhya", "Ananya", "Diya", "Isha", "Kavya", "Navya", "Saanvi", "Sara", "Kiara", "Myra"],
};

const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Verma", "Gupta", "Reddy", "Khan", "Desai", "Joshi", "Nair", "Iyer", "Menon", "Rao", "Pandey"];

function generateStudents(): StudentData[] {
  const students: StudentData[] = [];
  let studentId = 1;

  // Generate students for classes 1-10, sections A and B
  for (let grade = 1; grade <= 10; grade++) {
    for (const section of ["A", "B"]) {
      const classId = (grade - 1) * 2 + (section === "A" ? 1 : 2);
      const numStudents = 35 + Math.floor(Math.random() * 6); // 35-40 students per class

      for (let i = 0; i < numStudents; i++) {
        const gender = Math.random() > 0.5 ? "male" : "female";
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rollNumber = `${grade}${section}${String(i + 1).padStart(3, "0")}`;

        students.push({
          student_id: studentId,
          school_id: 1,
          class_id: classId,
          user_id: `student-${studentId}-uuid`,
          first_name: firstName,
          last_name: lastName,
          roll_number: rollNumber,
          date_of_birth: `${2025 - (5 + grade)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          gender,
          admission_date: "2025-04-01",
          section,
          parent_name: `Mr./Mrs. ${lastName}`,
          parent_phone: `+91-${9000000000 + Math.floor(Math.random() * 999999999)}`,
          parent_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@parent.com`,
          is_active: true,
          created_at: "2025-04-01T00:00:00Z",
        });

        studentId++;
      }
    }
  }

  return students;
}

const MOCK_STUDENTS = generateStudents();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStudents(params?: {
  school_id?: number;
  class_id?: number;
  section?: string;
  is_active?: boolean;
}): Promise<StudentData[]> {
  await simulateDelay(300);

  let filtered = [...MOCK_STUDENTS];

  if (params?.school_id) {
    filtered = filtered.filter(s => s.school_id === params.school_id);
  }

  if (params?.class_id) {
    filtered = filtered.filter(s => s.class_id === params.class_id);
  }

  if (params?.section) {
    filtered = filtered.filter(s => s.section === params.section);
  }

  if (params?.is_active !== undefined) {
    filtered = filtered.filter(s => s.is_active === params.is_active);
  }

  console.log(`[MOCK STUDENTS] getStudents → ${filtered.length} students`);
  return filtered;
}

export async function getStudentById(studentId: number): Promise<StudentData | null> {
  await simulateDelay(150);

  const found = MOCK_STUDENTS.find(s => s.student_id === studentId);
  console.log(`[MOCK STUDENTS] getStudentById(${studentId}) →`, found ? "found" : "not found");
  return found || null;
}

export async function getStudentsByClass(classId: number): Promise<StudentData[]> {
  return getStudents({ class_id: classId });
}

export const mockStudentsProvider = {
  getStudents,
  getStudentById,
  getStudentsByClass,
  allStudents: MOCK_STUDENTS,
};
