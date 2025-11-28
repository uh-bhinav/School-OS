// ============================================================================
// MOCK CLASSES DATA PROVIDER
// ============================================================================

import type {
  Class,
  ClassDetail,
  ClassKpi,
} from "../services/classes.schema";

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

// In-memory cache for assignments
const classTeacherAssignments = new Map<number, number>();

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

// Initialize assignments from mock data
MOCK_CLASSES.forEach((cls) => {
  if (cls.class_teacher_id) {
    classTeacherAssignments.set(cls.class_id, cls.class_teacher_id);
  }
});

/**
 * Convert ClassData to Class schema
 */
function convertToClass(classData: ClassData): Class {
  const teacherId = classTeacherAssignments.get(classData.class_id) || classData.class_teacher_id || null;
  const teacherName = teacherId ? classData.class_teacher_name || `Teacher ${teacherId}` : null;

  return {
    class_id: classData.class_id,
    school_id: classData.school_id,
    class_name: classData.class_name,
    section: classData.section,
    grade: classData.grade_level,
    class_teacher_id: teacherId,
    class_teacher_name: teacherName,
    total_students: classData.current_students,
    total_subjects: 7 + Math.floor(Math.random() * 3), // 7-9 subjects
    average_performance: 65 + Math.floor(Math.random() * 25), // 65-90%
    academic_year_id: classData.academic_year_id,
    academic_year: "2024-2025",
    room_id: classData.class_id <= 8 ? classData.class_id : undefined,
    room_name: classData.class_id <= 8 ? `Room ${100 + classData.class_id}` : undefined,
    is_active: true,
    created_at: classData.created_at,
  };
}

/**
 * Convert ClassData to ClassDetail schema
 */
function convertToClassDetail(classData: ClassData): ClassDetail {
  const basicClass = convertToClass(classData);
  const teacherId = basicClass.class_teacher_id;

  return {
    ...basicClass,
    class_teacher_email: teacherId ? `teacher${teacherId}@school.com` : undefined,
    class_teacher_phone: teacherId ? `+91-9876543${String(teacherId).padStart(3, '0')}` : undefined,
    attendance_percentage: 85 + Math.floor(Math.random() * 12), // 85-97%
    floor: basicClass.room_id ? Math.floor((basicClass.room_id - 1) / 2) + 1 : undefined,
    capacity: 40,
  };
}

/**
 * Get all classes (enhanced)
 */
export async function getAllClasses(schoolId: number = 1): Promise<Class[]> {
  await simulateDelay();

  const filtered = MOCK_CLASSES.filter((c) => c.school_id === schoolId);
  const classes = filtered.map(convertToClass);

  console.log(`[MOCK CLASSES] getAllClasses → ${classes.length} classes`);
  return classes;
}

/**
 * Get class detail by ID
 */
export async function getClassDetailById(classId: number): Promise<ClassDetail | null> {
  await simulateDelay(200);

  const classData = MOCK_CLASSES.find((c) => c.class_id === classId);
  if (!classData) {
    console.log(`[MOCK CLASSES] getClassDetailById(${classId}) → not found`);
    return null;
  }

  const classDetail = convertToClassDetail(classData);
  console.log(`[MOCK CLASSES] getClassDetailById(${classId}) → found`);
  return classDetail;
}

/**
 * Assign class teacher
 */
export async function assignClassTeacher(
  classId: number,
  teacherId: number
): Promise<{ success: boolean; message: string }> {
  await simulateDelay(300);

  const classData = MOCK_CLASSES.find((c) => c.class_id === classId);
  if (!classData) {
    return { success: false, message: "Class not found" };
  }

  // Update in-memory assignment
  classTeacherAssignments.set(classId, teacherId);

  // Update the class data
  classData.class_teacher_id = teacherId;
  // Teacher name will be updated via the conversion function

  console.log(`[MOCK CLASSES] assignClassTeacher → class ${classId} assigned to teacher ${teacherId}`);
  return { success: true, message: "Class teacher assigned successfully" };
}

/**
 * Get class KPIs
 */
export async function getClassKpi(schoolId: number = 1): Promise<ClassKpi> {
  await simulateDelay(200);

  const classes = await getAllClasses(schoolId);
  const activeClasses = classes.filter((c) => c.is_active);
  const classesWithTeacher = classes.filter((c) => c.class_teacher_id !== null);
  const classesWithoutTeacher = classes.filter((c) => c.class_teacher_id === null);
  const totalStudents = classes.reduce((sum, c) => sum + c.total_students, 0);
  const avgStudents = Math.round(totalStudents / classes.length);

  return {
    total_classes: classes.length,
    active_classes: activeClasses.length,
    classes_with_teacher: classesWithTeacher.length,
    classes_without_teacher: classesWithoutTeacher.length,
    average_students_per_class: avgStudents,
    total_students: totalStudents,
  };
}

export const mockClassesProvider = {
  getClasses,
  getClassById,
  getAllClasses,
  getClassDetailById,
  assignClassTeacher,
  getClassKpi,
};
