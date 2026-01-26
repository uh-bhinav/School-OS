// ============================================================================
// MOCK CO ATTAINMENT DATA
// ============================================================================
// Pre-computed CO attainment data for reports and analytics

import {
  COAttainment,
  ClassCOAttainment,
  StudentCOAttainment,
  calculateAttainmentPercentage,
} from "../services/obe.schema";

// Class 10A Math Mid-Term CO Attainment (class-level)
export const MOCK_CLASS_CO_ATTAINMENT: ClassCOAttainment[] = [
  {
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subject_id: 1,
    subject_name: "Mathematics",
    total_students: 10,
    cos: [
      { co_id: 100, co_code: "CO1", co_description: "Apply algebraic techniques", average_attainment: 78.5, students_attained: 8, target_attainment: 60 },
      { co_id: 101, co_code: "CO2", co_description: "Analyze geometric properties", average_attainment: 72.0, students_attained: 7, target_attainment: 60 },
      { co_id: 102, co_code: "CO3", co_description: "Apply trigonometric ratios", average_attainment: 80.0, students_attained: 9, target_attainment: 60 },
      { co_id: 103, co_code: "CO4", co_description: "Evaluate statistical data", average_attainment: 68.5, students_attained: 6, target_attainment: 60 },
      { co_id: 104, co_code: "CO5", co_description: "Coordinate geometry", average_attainment: 82.0, students_attained: 9, target_attainment: 60 },
    ],
  },
  {
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subject_id: 2,
    subject_name: "Physics",
    total_students: 10,
    cos: [
      { co_id: 106, co_code: "CO1", co_description: "Apply Newton's laws", average_attainment: 75.0, students_attained: 8, target_attainment: 60 },
      { co_id: 107, co_code: "CO2", co_description: "Work, energy, power", average_attainment: 70.0, students_attained: 7, target_attainment: 60 },
      { co_id: 108, co_code: "CO3", co_description: "Light phenomena", average_attainment: 77.5, students_attained: 8, target_attainment: 60 },
      { co_id: 109, co_code: "CO4", co_description: "Electrical circuits", average_attainment: 72.0, students_attained: 7, target_attainment: 60 },
      { co_id: 110, co_code: "CO5", co_description: "Magnetic effects", average_attainment: 65.0, students_attained: 6, target_attainment: 60 },
    ],
  },
  {
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subject_id: 3,
    subject_name: "Chemistry",
    total_students: 10,
    cos: [
      { co_id: 111, co_code: "CO1", co_description: "Chemical reactions", average_attainment: 74.0, students_attained: 7, target_attainment: 60 },
      { co_id: 112, co_code: "CO2", co_description: "Periodic table", average_attainment: 80.5, students_attained: 9, target_attainment: 60 },
      { co_id: 113, co_code: "CO3", co_description: "Acid-base reactions", average_attainment: 71.0, students_attained: 7, target_attainment: 60 },
      { co_id: 114, co_code: "CO4", co_description: "Carbon compounds", average_attainment: 68.0, students_attained: 6, target_attainment: 60 },
    ],
  },
];

// Individual student CO attainment
export const MOCK_STUDENT_CO_ATTAINMENT: StudentCOAttainment[] = [
  {
    student_id: 1001,
    student_name: "Aarav Sharma",
    roll_no: "10A01",
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subjects: [
      {
        subject_id: 1,
        subject_name: "Mathematics",
        total_marks: 80,
        obtained_marks: 67,
        percentage: 83.75,
        cos: [
          { co_id: 100, co_code: "CO1", max_marks: 20, obtained_marks: 17, attainment_percentage: 85, is_attained: true },
          { co_id: 101, co_code: "CO2", max_marks: 15, obtained_marks: 12, attainment_percentage: 80, is_attained: true },
          { co_id: 102, co_code: "CO3", max_marks: 15, obtained_marks: 13, attainment_percentage: 86.67, is_attained: true },
          { co_id: 103, co_code: "CO4", max_marks: 15, obtained_marks: 11, attainment_percentage: 73.33, is_attained: true },
          { co_id: 104, co_code: "CO5", max_marks: 15, obtained_marks: 14, attainment_percentage: 93.33, is_attained: true },
        ],
      },
      {
        subject_id: 2,
        subject_name: "Physics",
        total_marks: 80,
        obtained_marks: 62,
        percentage: 77.5,
        cos: [
          { co_id: 106, co_code: "CO1", max_marks: 16, obtained_marks: 13, attainment_percentage: 81.25, is_attained: true },
          { co_id: 107, co_code: "CO2", max_marks: 16, obtained_marks: 12, attainment_percentage: 75, is_attained: true },
          { co_id: 108, co_code: "CO3", max_marks: 16, obtained_marks: 13, attainment_percentage: 81.25, is_attained: true },
          { co_id: 109, co_code: "CO4", max_marks: 16, obtained_marks: 12, attainment_percentage: 75, is_attained: true },
          { co_id: 110, co_code: "CO5", max_marks: 16, obtained_marks: 12, attainment_percentage: 75, is_attained: true },
        ],
      },
    ],
  },
  {
    student_id: 1002,
    student_name: "Priya Patel",
    roll_no: "10A02",
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subjects: [
      {
        subject_id: 1,
        subject_name: "Mathematics",
        total_marks: 80,
        obtained_marks: 75,
        percentage: 93.75,
        cos: [
          { co_id: 100, co_code: "CO1", max_marks: 20, obtained_marks: 19, attainment_percentage: 95, is_attained: true },
          { co_id: 101, co_code: "CO2", max_marks: 15, obtained_marks: 14, attainment_percentage: 93.33, is_attained: true },
          { co_id: 102, co_code: "CO3", max_marks: 15, obtained_marks: 14, attainment_percentage: 93.33, is_attained: true },
          { co_id: 103, co_code: "CO4", max_marks: 15, obtained_marks: 13, attainment_percentage: 86.67, is_attained: true },
          { co_id: 104, co_code: "CO5", max_marks: 15, obtained_marks: 15, attainment_percentage: 100, is_attained: true },
        ],
      },
    ],
  },
  {
    student_id: 1003,
    student_name: "Rohan Gupta",
    roll_no: "10A03",
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    subjects: [
      {
        subject_id: 1,
        subject_name: "Mathematics",
        total_marks: 80,
        obtained_marks: 50,
        percentage: 62.5,
        cos: [
          { co_id: 100, co_code: "CO1", max_marks: 20, obtained_marks: 13, attainment_percentage: 65, is_attained: true },
          { co_id: 101, co_code: "CO2", max_marks: 15, obtained_marks: 10, attainment_percentage: 66.67, is_attained: true },
          { co_id: 102, co_code: "CO3", max_marks: 15, obtained_marks: 9, attainment_percentage: 60, is_attained: true },
          { co_id: 103, co_code: "CO4", max_marks: 15, obtained_marks: 8, attainment_percentage: 53.33, is_attained: false },
          { co_id: 104, co_code: "CO5", max_marks: 15, obtained_marks: 10, attainment_percentage: 66.67, is_attained: true },
        ],
      },
    ],
  },
];

// Individual CO Attainment records (granular)
export const MOCK_CO_ATTAINMENT: COAttainment[] = [
  // Mathematics - Student 1001
  {
    co_id: 100,
    co_code: "CO1",
    co_description: "Apply algebraic techniques to solve linear and quadratic equations",
    bloom_level: "Apply",
    subject_id: 1,
    subject_name: "Mathematics",
    student_id: 1001,
    student_name: "Aarav Sharma",
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    max_marks: 20,
    obtained_marks: 17,
    attainment_percentage: 85,
    target_attainment: 60,
    is_attained: true,
  },
  {
    co_id: 101,
    co_code: "CO2",
    co_description: "Analyze geometric properties of circles and construct proofs",
    bloom_level: "Analyze",
    subject_id: 1,
    subject_name: "Mathematics",
    student_id: 1001,
    student_name: "Aarav Sharma",
    class_id: 6,
    class_name: "Class 10 A",
    exam_id: 1,
    exam_name: "Mid-Term Examination 2025",
    max_marks: 15,
    obtained_marks: 12,
    attainment_percentage: 80,
    target_attainment: 60,
    is_attained: true,
  },
];

// Helper functions
export const getClassCOAttainment = (
  classId: number,
  examId: number,
  subjectId?: number
): ClassCOAttainment[] => {
  return MOCK_CLASS_CO_ATTAINMENT.filter(
    (a) =>
      a.class_id === classId &&
      a.exam_id === examId &&
      (subjectId === undefined || a.subject_id === subjectId)
  );
};

export const getStudentCOAttainment = (
  studentId: number,
  examId?: number
): StudentCOAttainment[] => {
  return MOCK_STUDENT_CO_ATTAINMENT.filter(
    (a) =>
      a.student_id === studentId &&
      (examId === undefined || a.exam_id === examId)
  );
};

export const getCOAttainmentBySubject = (
  subjectId: number,
  _examId: number,
  _classId: number
): COAttainment[] => {
  // Return relevant data or generate mock data if not found
  const matchingAttainment = MOCK_CO_ATTAINMENT.filter(
    (a) => a.subject_id === subjectId
  );

  // If we have data, return it
  if (matchingAttainment.length > 0) {
    return matchingAttainment;
  }

  // Generate mock attainment for subjects based on ID
  const subjectData: Record<number, { name: string; code: string }> = {
    1: { name: "Mathematics", code: "MATH" },
    2: { name: "Physics", code: "PHY" },
    3: { name: "Chemistry", code: "CHEM" },
    4: { name: "Biology", code: "BIO" },
    5: { name: "English", code: "ENG" },
  };

  const subject = subjectData[subjectId];
  if (!subject) return [];

  const bloomLevels: Array<"Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"> =
    ["Apply", "Analyze", "Evaluate", "Understand", "Apply"];

  // Generate 4-6 COs for the subject
  const numCOs = 4 + Math.floor(Math.random() * 3);
  const generatedAttainment: COAttainment[] = [];

  for (let i = 0; i < numCOs; i++) {
    const attainmentPct = 55 + Math.floor(Math.random() * 40); // 55-95%
    const maxMarks = 20;
    const obtainedMarks = Math.round((attainmentPct / 100) * maxMarks);

    generatedAttainment.push({
      co_id: subjectId * 100 + i,
      co_code: `CO${i + 1}`,
      co_description: `Course Outcome ${i + 1} for ${subject.name}`,
      bloom_level: bloomLevels[i % bloomLevels.length],
      subject_id: subjectId,
      subject_name: subject.name,
      class_id: 6, // Class 10A
      class_name: "Class 10 A",
      exam_id: 1,
      exam_name: "Mid-Term Examination 2025",
      max_marks: maxMarks,
      obtained_marks: obtainedMarks,
      attainment_percentage: attainmentPct,
      target_attainment: 60,
      is_attained: attainmentPct >= 60,
    });
  }

  return generatedAttainment;
};

// Compute attainment from marks data (utility for real-time calculation)
export const computeCOAttainmentFromMarks = (
  questionMarks: Array<{ question_id: number; marks_obtained: number; max_marks: number }>,
  questionCOMappings: Array<{ question_id: number; co_id: number; co_code: string; max_marks: number }>
): Map<number, { co_id: number; co_code: string; obtained: number; max: number; percentage: number }> => {
  const attainmentMap = new Map<
    number,
    { co_id: number; co_code: string; obtained: number; max: number; percentage: number }
  >();

  questionMarks.forEach((mark) => {
    const mapping = questionCOMappings.find((m) => m.question_id === mark.question_id);
    if (mapping && mapping.co_id) {
      const existing = attainmentMap.get(mapping.co_id);
      if (existing) {
        existing.obtained += mark.marks_obtained;
        existing.max += mark.max_marks;
        existing.percentage = calculateAttainmentPercentage(existing.obtained, existing.max);
      } else {
        attainmentMap.set(mapping.co_id, {
          co_id: mapping.co_id,
          co_code: mapping.co_code,
          obtained: mark.marks_obtained,
          max: mark.max_marks,
          percentage: calculateAttainmentPercentage(mark.marks_obtained, mark.max_marks),
        });
      }
    }
  });

  return attainmentMap;
};
