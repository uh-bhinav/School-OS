// ============================================================================
// MOCK SUBJECT EXAMS DATA
// ============================================================================
// Subject-level expansion of exam events
// Links exam events to specific subjects within classes

import { SubjectExam, ExamQuestion, QuestionMark } from "../services/obe.schema";

// Subject Exams - Expansion of exam events to subjects
export const MOCK_SUBJECT_EXAMS: SubjectExam[] = [
  // Mid-Term Examination - Class 10A - Mathematics
  {
    id: 1,
    exam_id: 1, // Assuming exam_id 1 is "Mid-Term Examination 2025"
    exam_title: "Mid-Term Examination 2025",
    class_id: 6, // Class 10A
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    total_marks: 80,
    questions_count: 6,
    questions_mapped: 6,
    status: "cos_mapped",
    date: "2025-10-15",
    created_at: "2025-09-01T00:00:00Z",
  },
  // Mid-Term Examination - Class 10A - Physics
  {
    id: 2,
    exam_id: 1,
    exam_title: "Mid-Term Examination 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    total_marks: 80,
    questions_count: 5,
    questions_mapped: 5,
    status: "cos_mapped",
    date: "2025-10-16",
    created_at: "2025-09-01T00:00:00Z",
  },
  // Mid-Term Examination - Class 10A - Chemistry
  {
    id: 3,
    exam_id: 1,
    exam_title: "Mid-Term Examination 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 3,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    total_marks: 80,
    questions_count: 4,
    questions_mapped: 4,
    status: "cos_mapped",
    date: "2025-10-17",
    created_at: "2025-09-01T00:00:00Z",
  },
  // Mid-Term Examination - Class 10A - Biology
  {
    id: 4,
    exam_id: 1,
    exam_title: "Mid-Term Examination 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 4,
    subject_name: "Biology",
    subject_code: "BIO",
    total_marks: 80,
    questions_count: 4,
    questions_mapped: 3,
    status: "questions_defined",
    date: "2025-10-18",
    created_at: "2025-09-01T00:00:00Z",
  },
  // Mid-Term Examination - Class 10A - English
  {
    id: 5,
    exam_id: 1,
    exam_title: "Mid-Term Examination 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    total_marks: 80,
    questions_count: 5,
    questions_mapped: 5,
    status: "cos_mapped",
    date: "2025-10-19",
    created_at: "2025-09-01T00:00:00Z",
  },
  // Unit Test 1 - Class 10A - Mathematics
  {
    id: 6,
    exam_id: 2, // Unit Test 1
    exam_title: "Unit Test 1 - 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    total_marks: 25,
    questions_count: 0,
    questions_mapped: 0,
    status: "draft",
    date: "2025-08-20",
    created_at: "2025-08-01T00:00:00Z",
  },
  // Unit Test 1 - Class 10A - Physics
  {
    id: 7,
    exam_id: 2,
    exam_title: "Unit Test 1 - 2025",
    class_id: 6,
    class_name: "Class 10",
    section: "A",
    grade: 10,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    total_marks: 25,
    questions_count: 0,
    questions_mapped: 0,
    status: "draft",
    date: "2025-08-21",
    created_at: "2025-08-01T00:00:00Z",
  },
];

// Exam Questions with CO mappings
export const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
  // Mathematics Mid-Term Questions (subject_exam_id: 1)
  { id: 1, subject_exam_id: 1, question_number: 1, description: "Solve the quadratic equation", max_marks: 10, co_id: 100, co_code: "CO1", co_description: "Apply algebraic techniques to solve linear and quadratic equations" },
  { id: 2, subject_exam_id: 1, question_number: 2, description: "Prove circle theorem", max_marks: 15, co_id: 101, co_code: "CO2", co_description: "Analyze geometric properties of circles and construct proofs" },
  { id: 3, subject_exam_id: 1, question_number: 3, description: "Trigonometry word problem", max_marks: 15, co_id: 102, co_code: "CO3", co_description: "Apply trigonometric ratios to solve real-world problems" },
  { id: 4, subject_exam_id: 1, question_number: 4, description: "Statistics problem", max_marks: 15, co_id: 103, co_code: "CO4", co_description: "Evaluate statistical data and interpret probability distributions" },
  { id: 5, subject_exam_id: 1, question_number: 5, description: "Coordinate geometry", max_marks: 15, co_id: 104, co_code: "CO5", co_description: "Understand and apply coordinate geometry concepts" },
  { id: 6, subject_exam_id: 1, question_number: 6, description: "AP/GP problems", max_marks: 10, co_id: 100, co_code: "CO1", co_description: "Apply algebraic techniques to solve linear and quadratic equations" },

  // Physics Mid-Term Questions (subject_exam_id: 2)
  { id: 7, subject_exam_id: 2, question_number: 1, description: "Newton's laws application", max_marks: 16, co_id: 106, co_code: "CO1", co_description: "Apply Newton's laws of motion to analyze force and acceleration" },
  { id: 8, subject_exam_id: 2, question_number: 2, description: "Work and energy problems", max_marks: 16, co_id: 107, co_code: "CO2", co_description: "Understand the principles of work, energy, and power" },
  { id: 9, subject_exam_id: 2, question_number: 3, description: "Light reflection/refraction", max_marks: 16, co_id: 108, co_code: "CO3", co_description: "Analyze light reflection and refraction phenomena" },
  { id: 10, subject_exam_id: 2, question_number: 4, description: "Electrical circuits", max_marks: 16, co_id: 109, co_code: "CO4", co_description: "Apply Ohm's law and Kirchhoff's laws to electrical circuits" },
  { id: 11, subject_exam_id: 2, question_number: 5, description: "Magnetic effects", max_marks: 16, co_id: 110, co_code: "CO5", co_description: "Evaluate the effects of magnetic fields on current-carrying conductors" },

  // Chemistry Mid-Term Questions (subject_exam_id: 3)
  { id: 12, subject_exam_id: 3, question_number: 1, description: "Balance chemical equations", max_marks: 20, co_id: 111, co_code: "CO1", co_description: "Understand chemical reactions and balance chemical equations" },
  { id: 13, subject_exam_id: 3, question_number: 2, description: "Periodic table trends", max_marks: 20, co_id: 112, co_code: "CO2", co_description: "Apply the periodic table to predict element properties" },
  { id: 14, subject_exam_id: 3, question_number: 3, description: "Acid-base reactions", max_marks: 20, co_id: 113, co_code: "CO3", co_description: "Analyze acid-base reactions and pH concepts" },
  { id: 15, subject_exam_id: 3, question_number: 4, description: "Carbon compounds", max_marks: 20, co_id: 114, co_code: "CO4", co_description: "Understand carbon compounds and their properties" },

  // Biology Mid-Term Questions (subject_exam_id: 4) - some unmapped
  { id: 16, subject_exam_id: 4, question_number: 1, description: "Life processes", max_marks: 20, co_id: 115, co_code: "CO1", co_description: "Understand life processes including nutrition, respiration, and excretion" },
  { id: 17, subject_exam_id: 4, question_number: 2, description: "Control and coordination", max_marks: 20, co_id: 116, co_code: "CO2", co_description: "Analyze control and coordination mechanisms in living organisms" },
  { id: 18, subject_exam_id: 4, question_number: 3, description: "Heredity problems", max_marks: 20, co_id: 117, co_code: "CO3", co_description: "Apply knowledge of heredity and evolution to genetic problems" },
  { id: 19, subject_exam_id: 4, question_number: 4, description: "Environment essay", max_marks: 20, co_id: null, co_code: undefined, co_description: undefined }, // Unmapped!

  // English Mid-Term Questions (subject_exam_id: 5)
  { id: 20, subject_exam_id: 5, question_number: 1, description: "Prose comprehension", max_marks: 16, co_id: 119, co_code: "CO1", co_description: "Analyze prose and poetry for themes, literary devices, and meaning" },
  { id: 21, subject_exam_id: 5, question_number: 2, description: "Grammar section", max_marks: 16, co_id: 120, co_code: "CO2", co_description: "Apply grammar rules correctly in written and spoken communication" },
  { id: 22, subject_exam_id: 5, question_number: 3, description: "Essay writing", max_marks: 16, co_id: 121, co_code: "CO3", co_description: "Create well-structured essays and creative writing pieces" },
  { id: 23, subject_exam_id: 5, question_number: 4, description: "Unseen passage", max_marks: 16, co_id: 122, co_code: "CO4", co_description: "Understand and interpret unseen passages effectively" },
  { id: 24, subject_exam_id: 5, question_number: 5, description: "Literature analysis", max_marks: 16, co_id: 123, co_code: "CO5", co_description: "Evaluate and respond critically to literary texts" },
];

// Mock students for Class 10A
const CLASS_10A_STUDENTS = [
  { student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01" },
  { student_id: 1002, student_name: "Priya Patel", roll_no: "10A02" },
  { student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03" },
  { student_id: 1004, student_name: "Ananya Singh", roll_no: "10A04" },
  { student_id: 1005, student_name: "Arjun Reddy", roll_no: "10A05" },
  { student_id: 1006, student_name: "Kavya Nair", roll_no: "10A06" },
  { student_id: 1007, student_name: "Vikram Iyer", roll_no: "10A07" },
  { student_id: 1008, student_name: "Sneha Rao", roll_no: "10A08" },
  { student_id: 1009, student_name: "Aditya Kumar", roll_no: "10A09" },
  { student_id: 1010, student_name: "Meera Krishnan", roll_no: "10A10" },
];

// Question-wise marks (sample for Mathematics Mid-Term)
export const MOCK_QUESTION_MARKS: QuestionMark[] = [
  // Student 1001 - Mathematics
  { id: 1, question_id: 1, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 8, max_marks: 10 },
  { id: 2, question_id: 2, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 12, max_marks: 15 },
  { id: 3, question_id: 3, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 13, max_marks: 15 },
  { id: 4, question_id: 4, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 11, max_marks: 15 },
  { id: 5, question_id: 5, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 14, max_marks: 15 },
  { id: 6, question_id: 6, student_id: 1001, student_name: "Aarav Sharma", roll_no: "10A01", marks_obtained: 9, max_marks: 10 },

  // Student 1002 - Mathematics
  { id: 7, question_id: 1, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 9, max_marks: 10 },
  { id: 8, question_id: 2, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 14, max_marks: 15 },
  { id: 9, question_id: 3, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 14, max_marks: 15 },
  { id: 10, question_id: 4, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 13, max_marks: 15 },
  { id: 11, question_id: 5, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 15, max_marks: 15 },
  { id: 12, question_id: 6, student_id: 1002, student_name: "Priya Patel", roll_no: "10A02", marks_obtained: 10, max_marks: 10 },

  // Student 1003 - Mathematics
  { id: 13, question_id: 1, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 6, max_marks: 10 },
  { id: 14, question_id: 2, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 10, max_marks: 15 },
  { id: 15, question_id: 3, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 9, max_marks: 15 },
  { id: 16, question_id: 4, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 8, max_marks: 15 },
  { id: 17, question_id: 5, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 10, max_marks: 15 },
  { id: 18, question_id: 6, student_id: 1003, student_name: "Rohan Gupta", roll_no: "10A03", marks_obtained: 7, max_marks: 10 },
];

// Mutable stores
let subjectExamsStore = [...MOCK_SUBJECT_EXAMS];
let examQuestionsStore = [...MOCK_EXAM_QUESTIONS];
let questionMarksStore = [...MOCK_QUESTION_MARKS];

let nextSubjectExamId = 100;
let nextQuestionId = 100;
let nextQuestionMarkId = 100;

// Subject Exam helpers
export const getSubjectExamsByExam = (examId: number): SubjectExam[] => {
  return subjectExamsStore.filter((se) => se.exam_id === examId);
};

export const getSubjectExamsByClass = (classId: number): SubjectExam[] => {
  return subjectExamsStore.filter((se) => se.class_id === classId);
};

export const getSubjectExamById = (id: number): SubjectExam | undefined => {
  return subjectExamsStore.find((se) => se.id === id);
};

export const getSubjectExamByDetails = (examId: number, classId: number, subjectId: number): SubjectExam | undefined => {
  return subjectExamsStore.find(
    (se) => se.exam_id === examId && se.class_id === classId && se.subject_id === subjectId
  );
};

export const getAllSubjectExams = (): SubjectExam[] => {
  return subjectExamsStore;
};

export const addSubjectExam = (se: Omit<SubjectExam, "id" | "created_at">): SubjectExam => {
  const newSE: SubjectExam = {
    ...se,
    id: nextSubjectExamId++,
    created_at: new Date().toISOString(),
  };
  subjectExamsStore.push(newSE);
  return newSE;
};

export const updateSubjectExam = (id: number, updates: Partial<SubjectExam>): SubjectExam | undefined => {
  const index = subjectExamsStore.findIndex((se) => se.id === id);
  if (index !== -1) {
    subjectExamsStore[index] = { ...subjectExamsStore[index], ...updates };
    return subjectExamsStore[index];
  }
  return undefined;
};

// Exam Question helpers
export const getQuestionsBySubjectExam = (subjectExamId: number): ExamQuestion[] => {
  return examQuestionsStore.filter((q) => q.subject_exam_id === subjectExamId);
};

export const getQuestionById = (id: number): ExamQuestion | undefined => {
  return examQuestionsStore.find((q) => q.id === id);
};

export const addQuestion = (q: Omit<ExamQuestion, "id">): ExamQuestion => {
  const newQ: ExamQuestion = {
    ...q,
    id: nextQuestionId++,
  };
  examQuestionsStore.push(newQ);

  // Update subject exam question count
  const se = subjectExamsStore.find((s) => s.id === q.subject_exam_id);
  if (se) {
    se.questions_count = examQuestionsStore.filter((eq) => eq.subject_exam_id === q.subject_exam_id).length;
    se.questions_mapped = examQuestionsStore.filter((eq) => eq.subject_exam_id === q.subject_exam_id && eq.co_id !== null).length;
    if (se.questions_count > 0 && se.status === "draft") {
      se.status = "questions_defined";
    }
    if (se.questions_count > 0 && se.questions_mapped === se.questions_count) {
      se.status = "cos_mapped";
    }
  }

  return newQ;
};

export const updateQuestion = (id: number, updates: Partial<ExamQuestion>): ExamQuestion | undefined => {
  const index = examQuestionsStore.findIndex((q) => q.id === id);
  if (index !== -1) {
    examQuestionsStore[index] = { ...examQuestionsStore[index], ...updates };

    // Update subject exam mapped count
    const q = examQuestionsStore[index];
    const se = subjectExamsStore.find((s) => s.id === q.subject_exam_id);
    if (se) {
      se.questions_mapped = examQuestionsStore.filter((eq) => eq.subject_exam_id === q.subject_exam_id && eq.co_id !== null).length;
      if (se.questions_count > 0 && se.questions_mapped === se.questions_count) {
        se.status = "cos_mapped";
      } else if (se.questions_count > 0) {
        se.status = "questions_defined";
      }
    }

    return examQuestionsStore[index];
  }
  return undefined;
};

export const deleteQuestion = (id: number): boolean => {
  const index = examQuestionsStore.findIndex((q) => q.id === id);
  if (index !== -1) {
    const q = examQuestionsStore[index];
    examQuestionsStore.splice(index, 1);

    // Update subject exam counts
    const se = subjectExamsStore.find((s) => s.id === q.subject_exam_id);
    if (se) {
      se.questions_count = examQuestionsStore.filter((eq) => eq.subject_exam_id === q.subject_exam_id).length;
      se.questions_mapped = examQuestionsStore.filter((eq) => eq.subject_exam_id === q.subject_exam_id && eq.co_id !== null).length;
    }

    return true;
  }
  return false;
};

// Question Marks helpers
export const getMarksByQuestion = (questionId: number): QuestionMark[] => {
  return questionMarksStore.filter((m) => m.question_id === questionId);
};

export const getMarksByStudent = (studentId: number): QuestionMark[] => {
  return questionMarksStore.filter((m) => m.student_id === studentId);
};

export const getMarksBySubjectExam = (subjectExamId: number): QuestionMark[] => {
  const questionIds = examQuestionsStore.filter((q) => q.subject_exam_id === subjectExamId).map((q) => q.id);
  return questionMarksStore.filter((m) => questionIds.includes(m.question_id));
};

export const saveQuestionMark = (mark: Omit<QuestionMark, "id">): QuestionMark => {
  // Check if exists
  const existing = questionMarksStore.find(
    (m) => m.question_id === mark.question_id && m.student_id === mark.student_id
  );

  if (existing) {
    existing.marks_obtained = mark.marks_obtained;
    return existing;
  }

  const newMark: QuestionMark = {
    ...mark,
    id: nextQuestionMarkId++,
  };
  questionMarksStore.push(newMark);
  return newMark;
};

// Get students for a class (for marks entry)
export const getStudentsForClass = (classId: number) => {
  // For now, return Class 10A students for class_id 6
  if (classId === 6) {
    return CLASS_10A_STUDENTS;
  }
  return [];
};

export const resetSubjectExamsStore = (): void => {
  subjectExamsStore = [...MOCK_SUBJECT_EXAMS];
  examQuestionsStore = [...MOCK_EXAM_QUESTIONS];
  questionMarksStore = [...MOCK_QUESTION_MARKS];
};
