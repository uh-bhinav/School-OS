// ============================================================================
// MOCK CLASS SUBJECT MAPPING DATA PROVIDER
// ============================================================================

import type { ClassSubjectMapping } from "../services/classes.schema";

const SUBJECTS_BY_GRADE = {
  1: [
    { id: 1, name: "English", code: "ENG" },
    { id: 2, name: "Mathematics", code: "MATH" },
    { id: 3, name: "Science", code: "SCI" },
    { id: 5, name: "Hindi", code: "HIN" },
    { id: 6, name: "Physical Education", code: "PE" },
    { id: 8, name: "Art", code: "ART" },
  ],
  2: [
    { id: 1, name: "English", code: "ENG" },
    { id: 2, name: "Mathematics", code: "MATH" },
    { id: 3, name: "Science", code: "SCI" },
    { id: 4, name: "Social Studies", code: "SST" },
    { id: 5, name: "Hindi", code: "HIN" },
    { id: 6, name: "Physical Education", code: "PE" },
    { id: 7, name: "Computer Science", code: "CS" },
  ],
};

// Default subjects for grades 3-10
const DEFAULT_SUBJECTS = [
  { id: 1, name: "English", code: "ENG" },
  { id: 2, name: "Mathematics", code: "MATH" },
  { id: 3, name: "Science", code: "SCI" },
  { id: 4, name: "Social Studies", code: "SST" },
  { id: 5, name: "Hindi", code: "HIN" },
  { id: 6, name: "Physical Education", code: "PE" },
  { id: 7, name: "Computer Science", code: "CS" },
];

const TEACHER_SPECIALIZATIONS: Record<number, string> = {
  1: "English",
  2: "Mathematics",
  3: "Science",
  4: "Social Studies",
  5: "Hindi",
  6: "Science",
  7: "English",
  8: "Mathematics",
  9: "Hindi",
  10: "Physical Education",
  11: "Computer Science",
  12: "Mathematics",
  13: "Computer Science",
  14: "Social Studies",
  15: "Art",
  16: "English",
  17: "Science",
  18: "Social Studies",
  19: "Hindi",
  20: "Mathematics",
};

const TEACHER_NAMES: Record<number, string> = {
  1: "Priya Sharma",
  2: "Anjali Patel",
  3: "Rajesh Singh",
  4: "Kavita Verma",
  5: "Amit Gupta",
  6: "Sneha Reddy",
  7: "Fatima Khan",
  8: "Vikram Desai",
  9: "Meera Joshi",
  10: "Suresh Nair",
  11: "Lakshmi Iyer",
  12: "Ravi Menon",
  13: "Sunita Rao",
  14: "Manoj Pandey",
  15: "Pooja Kapoor",
  16: "Arun Malik",
  17: "Divya Pillai",
  18: "Subhash Bose",
  19: "Nandini Das",
  20: "Rahul Saxena",
};

// Cache for mappings
const mappingCache = new Map<number, ClassSubjectMapping[]>();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate subject mappings for a class
 */
function generateSubjectMappings(classId: number, grade: number): ClassSubjectMapping[] {
  const subjects = (SUBJECTS_BY_GRADE[grade as keyof typeof SUBJECTS_BY_GRADE] || DEFAULT_SUBJECTS);
  const mappings: ClassSubjectMapping[] = [];

  subjects.forEach((subject, index) => {
    // Assign teacher based on specialization
    const teacherId = findTeacherForSubject(subject.name, classId + index);
    const teacherName = teacherId ? TEACHER_NAMES[teacherId] : null;

    // Periods per week varies by subject
    const periodsPerWeek = subject.code === "PE" || subject.code === "ART" ? 2 :
                           subject.code === "CS" ? 3 :
                           ["ENG", "MATH", "SCI"].includes(subject.code) ? 6 : 5;

    mappings.push({
      mapping_id: classId * 100 + index + 1,
      class_id: classId,
      subject_id: subject.id,
      subject_name: subject.name,
      subject_code: subject.code,
      teacher_id: teacherId,
      teacher_name: teacherName,
      periods_per_week: periodsPerWeek,
      academic_year_id: 1,
    });
  });

  return mappings;
}

/**
 * Find teacher for subject based on specialization
 */
function findTeacherForSubject(subjectName: string, seed: number): number {
  const matchingTeachers = Object.entries(TEACHER_SPECIALIZATIONS)
    .filter(([_, spec]) => spec === subjectName)
    .map(([id]) => parseInt(id));

  if (matchingTeachers.length > 0) {
    return matchingTeachers[seed % matchingTeachers.length];
  }

  // Fallback to any teacher
  return (seed % 20) + 1;
}

/**
 * Get class subject mappings
 */
export async function getClassSubjectMappings(classId: number): Promise<ClassSubjectMapping[]> {
  await simulateDelay(250);

  if (!mappingCache.has(classId)) {
    // Determine grade from class_id (classes 1-2 = grade 1, 3-4 = grade 2, etc.)
    const grade = Math.ceil(classId / 2);
    const mappings = generateSubjectMappings(classId, grade);
    mappingCache.set(classId, mappings);
  }

  const mappings = mappingCache.get(classId)!;
  console.log(`[MOCK CLASS MAPPING] getClassSubjectMappings(${classId}) → ${mappings.length} mappings`);
  return mappings;
}

/**
 * Update subject-teacher mapping
 */
export async function updateSubjectMapping(
  mappingId: number,
  teacherId: number
): Promise<{ success: boolean; message: string }> {
  await simulateDelay(200);

  // Find the mapping
  for (const mappings of mappingCache.values()) {
    const mapping = mappings.find((m) => m.mapping_id === mappingId);
    if (mapping) {
      mapping.teacher_id = teacherId;
      mapping.teacher_name = TEACHER_NAMES[teacherId] || `Teacher ${teacherId}`;
      console.log(`[MOCK CLASS MAPPING] updateSubjectMapping → mapping ${mappingId} updated to teacher ${teacherId}`);
      return { success: true, message: "Subject mapping updated successfully" };
    }
  }

  return { success: false, message: "Mapping not found" };
}

export const mockClassMappingProvider = {
  getClassSubjectMappings,
  updateSubjectMapping,
};
