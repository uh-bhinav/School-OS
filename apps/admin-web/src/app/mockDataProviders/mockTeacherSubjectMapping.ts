// ============================================================================
// MOCK TEACHER-SUBJECT MAPPING DATA PROVIDER
// ============================================================================

import { MOCK_TEACHERS } from "./mockTeachers";

export interface TeacherSubjectMapping {
  mapping_id: number;
  teacher_id: number;
  teacher_name: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  grade_levels: number[]; // Which grades this teacher teaches this subject
}

export interface SubjectInfo {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description?: string;
}

// Complete list of subjects for filtering
const MOCK_SUBJECTS_FULL: SubjectInfo[] = [
  { subject_id: 1, subject_name: "English", subject_code: "ENG", description: "English Language & Literature" },
  { subject_id: 2, subject_name: "Mathematics", subject_code: "MATH", description: "Mathematics" },
  { subject_id: 3, subject_name: "Physics", subject_code: "PHY", description: "Physics" },
  { subject_id: 4, subject_name: "Chemistry", subject_code: "CHEM", description: "Chemistry" },
  { subject_id: 5, subject_name: "Biology", subject_code: "BIO", description: "Biology" },
  { subject_id: 6, subject_name: "History", subject_code: "HIST", description: "History" },
  { subject_id: 7, subject_name: "Geography", subject_code: "GEO", description: "Geography" },
  { subject_id: 8, subject_name: "Hindi", subject_code: "HIN", description: "Hindi Language" },
  { subject_id: 9, subject_name: "Sanskrit", subject_code: "SKT", description: "Sanskrit Language" },
  { subject_id: 10, subject_name: "Physical Education", subject_code: "PE", description: "Physical Education & Sports" },
  { subject_id: 11, subject_name: "Economics", subject_code: "ECO", description: "Economics" },
  { subject_id: 12, subject_name: "Commerce", subject_code: "COM", description: "Commerce & Business Studies" },
  { subject_id: 13, subject_name: "Computer Science", subject_code: "CS", description: "Computer Science & IT" },
  { subject_id: 14, subject_name: "Political Science", subject_code: "POL", description: "Political Science" },
  { subject_id: 15, subject_name: "Arts & Crafts", subject_code: "ART", description: "Fine Arts & Crafts" },
  { subject_id: 16, subject_name: "Music", subject_code: "MUS", description: "Music" },
  { subject_id: 17, subject_name: "Environmental Science", subject_code: "EVS", description: "Environmental Science" },
  { subject_id: 18, subject_name: "Sociology", subject_code: "SOC", description: "Sociology" },
  { subject_id: 19, subject_name: "Psychology", subject_code: "PSY", description: "Psychology" },
  { subject_id: 20, subject_name: "Business Studies", subject_code: "BUS", description: "Business Studies" },
];

// Map teacher specializations to subject IDs
const SPECIALIZATION_TO_SUBJECT: Record<string, number[]> = {
  "English Literature": [1],
  "Mathematics": [2],
  "Physics": [3],
  "Chemistry": [4],
  "Biology": [5],
  "History": [6],
  "Geography": [7],
  "Hindi": [8],
  "Sanskrit": [9],
  "Physical Education": [10],
  "Economics": [11],
  "Commerce": [12],
  "Computer Science": [13],
  "Political Science": [14],
  "Arts & Crafts": [15],
  "Music": [16],
  "Environmental Science": [17],
  "Sociology": [18],
  "Psychology": [19],
  "Business Studies": [20],
};

// Generate teacher-subject mappings based on teacher specializations
function generateTeacherSubjectMappings(): TeacherSubjectMapping[] {
  const mappings: TeacherSubjectMapping[] = [];
  let mappingId = 1;

  MOCK_TEACHERS.forEach((teacher) => {
    const subjectIds = SPECIALIZATION_TO_SUBJECT[teacher.specialization] || [];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;

    subjectIds.forEach((subjectId) => {
      const subject = MOCK_SUBJECTS_FULL.find((s) => s.subject_id === subjectId);
      if (subject) {
        // Assign random grade levels (1-3 grades per teacher)
        const numGrades = Math.floor(Math.random() * 3) + 1;
        const startGrade = Math.floor(Math.random() * 8) + 1;
        const gradeLevels: number[] = [];
        for (let i = 0; i < numGrades; i++) {
          if (startGrade + i <= 12) {
            gradeLevels.push(startGrade + i);
          }
        }

        mappings.push({
          mapping_id: mappingId++,
          teacher_id: teacher.teacher_id,
          teacher_name: teacherName,
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          subject_code: subject.subject_code,
          grade_levels: gradeLevels,
        });
      }
    });

    // Some teachers teach multiple subjects
    if (teacher.teacher_id % 3 === 0) {
      const additionalSubjectIndex = (teacher.teacher_id + 5) % MOCK_SUBJECTS_FULL.length;
      const additionalSubject = MOCK_SUBJECTS_FULL[additionalSubjectIndex];

      // Check if not already assigned
      const alreadyAssigned = mappings.some(
        (m) => m.teacher_id === teacher.teacher_id && m.subject_id === additionalSubject.subject_id
      );

      if (!alreadyAssigned) {
        mappings.push({
          mapping_id: mappingId++,
          teacher_id: teacher.teacher_id,
          teacher_name: teacherName,
          subject_id: additionalSubject.subject_id,
          subject_name: additionalSubject.subject_name,
          subject_code: additionalSubject.subject_code,
          grade_levels: [9, 10],
        });
      }
    }
  });

  return mappings;
}

const MOCK_TEACHER_SUBJECT_MAPPINGS = generateTeacherSubjectMappings();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get all available subjects for filtering
 */
export async function getAllSubjects(): Promise<SubjectInfo[]> {
  await simulateDelay(150);
  console.log(`[MOCK SUBJECTS] getAllSubjects → ${MOCK_SUBJECTS_FULL.length} subjects`);
  return [...MOCK_SUBJECTS_FULL];
}

/**
 * Get all teacher-subject mappings
 */
export async function getTeacherSubjectMappings(): Promise<TeacherSubjectMapping[]> {
  await simulateDelay(200);
  console.log(`[MOCK TEACHER-SUBJECT] getMappings → ${MOCK_TEACHER_SUBJECT_MAPPINGS.length} mappings`);
  return [...MOCK_TEACHER_SUBJECT_MAPPINGS];
}

/**
 * Get teachers by subject IDs
 * @param subjectIds - Array of subject IDs to filter by
 * @returns Array of teacher IDs who teach any of the specified subjects
 */
export async function getTeacherIdsBySubjects(subjectIds: number[]): Promise<number[]> {
  await simulateDelay(150);

  if (!subjectIds || subjectIds.length === 0) {
    return [];
  }

  const teacherIds = new Set<number>();
  MOCK_TEACHER_SUBJECT_MAPPINGS.forEach((mapping) => {
    if (subjectIds.includes(mapping.subject_id)) {
      teacherIds.add(mapping.teacher_id);
    }
  });

  const result = Array.from(teacherIds);
  console.log(`[MOCK TEACHER-SUBJECT] getTeacherIdsBySubjects(${subjectIds}) → ${result.length} teachers`);
  return result;
}

/**
 * Get subjects taught by a specific teacher
 */
export async function getSubjectsByTeacherId(teacherId: number): Promise<TeacherSubjectMapping[]> {
  await simulateDelay(150);

  const mappings = MOCK_TEACHER_SUBJECT_MAPPINGS.filter((m) => m.teacher_id === teacherId);
  console.log(`[MOCK TEACHER-SUBJECT] getSubjectsByTeacherId(${teacherId}) → ${mappings.length} subjects`);
  return mappings;
}

export const mockTeacherSubjectMappingProvider = {
  getAllSubjects,
  getTeacherSubjectMappings,
  getTeacherIdsBySubjects,
  getSubjectsByTeacherId,
  allSubjects: MOCK_SUBJECTS_FULL,
  allMappings: MOCK_TEACHER_SUBJECT_MAPPINGS,
};
