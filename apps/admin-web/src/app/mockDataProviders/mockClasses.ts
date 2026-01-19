// ============================================================================
// MOCK CLASSES DATA PROVIDER
// ============================================================================

export interface ClassData {
  class_id: number;
  school_id: number;
  class_name: string;
  section: string;
  academic_year_id: number;
  grade_level: number;
  max_students: number;
  current_students: number;
  class_teacher_id?: number;
  class_teacher_name?: string;
  created_at: string;
}

const MOCK_CLASSES: ClassData[] = [
  {
    class_id: 1,
    school_id: 1,
    class_name: "Class 1",
    section: "A",
    academic_year_id: 1,
    grade_level: 1,
    max_students: 40,
    current_students: 38,
    class_teacher_id: 1,
    class_teacher_name: "Mrs. Sharma",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 2,
    school_id: 1,
    class_name: "Class 1",
    section: "B",
    academic_year_id: 1,
    grade_level: 1,
    max_students: 40,
    current_students: 35,
    class_teacher_id: 2,
    class_teacher_name: "Ms. Patel",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 3,
    school_id: 1,
    class_name: "Class 2",
    section: "A",
    academic_year_id: 1,
    grade_level: 2,
    max_students: 40,
    current_students: 39,
    class_teacher_id: 3,
    class_teacher_name: "Mr. Singh",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 4,
    school_id: 1,
    class_name: "Class 2",
    section: "B",
    academic_year_id: 1,
    grade_level: 2,
    max_students: 40,
    current_students: 37,
    class_teacher_id: 4,
    class_teacher_name: "Mrs. Verma",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 5,
    school_id: 1,
    class_name: "Class 3",
    section: "A",
    academic_year_id: 1,
    grade_level: 3,
    max_students: 40,
    current_students: 40,
    class_teacher_id: 5,
    class_teacher_name: "Mr. Gupta",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 6,
    school_id: 1,
    class_name: "Class 3",
    section: "B",
    academic_year_id: 1,
    grade_level: 3,
    max_students: 40,
    current_students: 36,
    class_teacher_id: 6,
    class_teacher_name: "Ms. Reddy",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 7,
    school_id: 1,
    class_name: "Class 4",
    section: "A",
    academic_year_id: 1,
    grade_level: 4,
    max_students: 40,
    current_students: 38,
    class_teacher_id: 7,
    class_teacher_name: "Mrs. Khan",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 8,
    school_id: 1,
    class_name: "Class 4",
    section: "B",
    academic_year_id: 1,
    grade_level: 4,
    max_students: 40,
    current_students: 34,
    class_teacher_id: 8,
    class_teacher_name: "Mr. Desai",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 9,
    school_id: 1,
    class_name: "Class 5",
    section: "A",
    academic_year_id: 1,
    grade_level: 5,
    max_students: 40,
    current_students: 39,
    class_teacher_id: 9,
    class_teacher_name: "Mrs. Joshi",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 10,
    school_id: 1,
    class_name: "Class 5",
    section: "B",
    academic_year_id: 1,
    grade_level: 5,
    max_students: 40,
    current_students: 37,
    class_teacher_id: 10,
    class_teacher_name: "Mr. Nair",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 11,
    school_id: 1,
    class_name: "Class 6",
    section: "A",
    academic_year_id: 1,
    grade_level: 6,
    max_students: 40,
    current_students: 40,
    class_teacher_id: 11,
    class_teacher_name: "Ms. Iyer",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 12,
    school_id: 1,
    class_name: "Class 6",
    section: "B",
    academic_year_id: 1,
    grade_level: 6,
    max_students: 40,
    current_students: 38,
    class_teacher_id: 12,
    class_teacher_name: "Mr. Menon",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 13,
    school_id: 1,
    class_name: "Class 7",
    section: "A",
    academic_year_id: 1,
    grade_level: 7,
    max_students: 40,
    current_students: 36,
    class_teacher_id: 13,
    class_teacher_name: "Mrs. Rao",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 14,
    school_id: 1,
    class_name: "Class 7",
    section: "B",
    academic_year_id: 1,
    grade_level: 7,
    max_students: 40,
    current_students: 32,
    class_teacher_id: 14,
    class_teacher_name: "Mr. Pandey",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 15,
    school_id: 1,
    class_name: "Class 8",
    section: "A",
    academic_year_id: 1,
    grade_level: 8,
    max_students: 40,
    current_students: 39,
    class_teacher_id: 15,
    class_teacher_name: "Ms. Kapoor",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 16,
    school_id: 1,
    class_name: "Class 8",
    section: "B",
    academic_year_id: 1,
    grade_level: 8,
    max_students: 40,
    current_students: 35,
    class_teacher_id: 16,
    class_teacher_name: "Mr. Malik",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 17,
    school_id: 1,
    class_name: "Class 9",
    section: "A",
    academic_year_id: 1,
    grade_level: 9,
    max_students: 40,
    current_students: 38,
    class_teacher_id: 17,
    class_teacher_name: "Mrs. Pillai",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 18,
    school_id: 1,
    class_name: "Class 9",
    section: "B",
    academic_year_id: 1,
    grade_level: 9,
    max_students: 40,
    current_students: 37,
    class_teacher_id: 18,
    class_teacher_name: "Mr. Bose",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 19,
    school_id: 1,
    class_name: "Class 10",
    section: "A",
    academic_year_id: 1,
    grade_level: 10,
    max_students: 40,
    current_students: 40,
    class_teacher_id: 19,
    class_teacher_name: "Ms. Das",
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    class_id: 20,
    school_id: 1,
    class_name: "Class 10",
    section: "B",
    academic_year_id: 1,
    grade_level: 10,
    max_students: 40,
    current_students: 39,
    class_teacher_id: 20,
    class_teacher_name: "Mr. Saxena",
    created_at: "2025-04-01T00:00:00Z",
  },
];

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getClasses(params?: { school_id?: number; grade_level?: number }): Promise<ClassData[]> {
  await simulateDelay(250);

  let filtered = [...MOCK_CLASSES];

  if (params?.school_id) {
    filtered = filtered.filter(c => c.school_id === params.school_id);
  }

  if (params?.grade_level) {
    filtered = filtered.filter(c => c.grade_level === params.grade_level);
  }

  console.log(`[MOCK CLASSES] getClasses → ${filtered.length} classes`);
  return filtered;
}

export async function getClassById(classId: number): Promise<ClassData | null> {
  await simulateDelay(150);

  const found = MOCK_CLASSES.find(c => c.class_id === classId);
  console.log(`[MOCK CLASSES] getClassById(${classId}) →`, found ? "found" : "not found");
  return found || null;
}

export const mockClassesProvider = {
  getClasses,
  getClassById,
};
