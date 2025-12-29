// ============================================================================
// OBE API SERVICE
// ============================================================================
// API functions for OBE-related data (CO, PO, Subject Exams, Questions, Attainment)
// Currently uses mock data, ready for backend integration

import { http } from "./http";
import {
  Subject,
  SubjectDetail,
  CourseOutcome,
  CourseOutcomeCreate,
  CourseOutcomeUpdate,
  ProgramOutcome,
  SubjectExam,
  ExamQuestion,
  ExamQuestionCreate,
  ExamQuestionUpdate,
  QuestionMark,
  COAttainment,
  ClassCOAttainment,
  StudentCOAttainment,
} from "./obe.schema";

// Note: http client already has baseURL set to http://localhost:8000/api/v1
// So we only need /obe here (not /api/v1/obe)
const BASE_URL = "/obe";

// ============================================================================
// SUBJECTS API
// ============================================================================
export const subjectsApi = {
  getAll: async (schoolId: number): Promise<Subject[]> => {
    const response = await http.get<Subject[]>(`${BASE_URL}/subjects/school/${schoolId}`);
    return response.data;
  },

  getById: async (subjectId: number): Promise<SubjectDetail> => {
    const response = await http.get<SubjectDetail>(`${BASE_URL}/subjects/${subjectId}`);
    return response.data;
  },

  update: async (subjectId: number, data: Partial<Subject>): Promise<Subject> => {
    const response = await http.patch<Subject>(`${BASE_URL}/subjects/${subjectId}`, data);
    return response.data;
  },
};

// ============================================================================
// COURSE OUTCOMES API
// ============================================================================
export const courseOutcomesApi = {
  getBySubjectAndGrade: async (subjectId: number, grade: number): Promise<CourseOutcome[]> => {
    const response = await http.get<CourseOutcome[]>(
      `${BASE_URL}/cos/subject/${subjectId}/grade/${grade}`
    );
    return response.data;
  },

  getApprovedBySubjectAndGrade: async (
    subjectId: number,
    grade: number
  ): Promise<CourseOutcome[]> => {
    const response = await http.get<CourseOutcome[]>(
      `${BASE_URL}/cos/subject/${subjectId}/grade/${grade}?status=approved`
    );
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<CourseOutcome[]> => {
    const response = await http.get<CourseOutcome[]>(`${BASE_URL}/cos/subject/${subjectId}`);
    return response.data;
  },

  create: async (data: CourseOutcomeCreate): Promise<CourseOutcome> => {
    const response = await http.post<CourseOutcome>(`${BASE_URL}/cos`, data);
    return response.data;
  },

  update: async (coId: number, data: CourseOutcomeUpdate): Promise<CourseOutcome> => {
    const response = await http.patch<CourseOutcome>(`${BASE_URL}/cos/${coId}`, data);
    return response.data;
  },

  delete: async (coId: number): Promise<void> => {
    await http.delete(`${BASE_URL}/cos/${coId}`);
  },

  bulkApprove: async (coIds: number[]): Promise<{ approved_count: number }> => {
    const response = await http.post<{ approved_count: number }>(
      `${BASE_URL}/cos/bulk-approve`,
      { co_ids: coIds }
    );
    return response.data;
  },
};

// ============================================================================
// PROGRAM OUTCOMES API
// ============================================================================
export const programOutcomesApi = {
  getAll: async (schoolId: number): Promise<ProgramOutcome[]> => {
    const response = await http.get<ProgramOutcome[]>(`${BASE_URL}/pos/school/${schoolId}`);
    return response.data;
  },
};

// ============================================================================
// SUBJECT EXAMS API
// ============================================================================
export const subjectExamsApi = {
  getByExam: async (examId: number): Promise<SubjectExam[]> => {
    const response = await http.get<SubjectExam[]>(`${BASE_URL}/subject-exams/exam/${examId}`);
    return response.data;
  },

  getById: async (subjectExamId: number): Promise<SubjectExam> => {
    const response = await http.get<SubjectExam>(`${BASE_URL}/subject-exams/${subjectExamId}`);
    return response.data;
  },

  expandExam: async (examId: number): Promise<SubjectExam[]> => {
    const response = await http.post<SubjectExam[]>(`${BASE_URL}/subject-exams/expand/${examId}`);
    return response.data;
  },

  update: async (subjectExamId: number, data: Partial<SubjectExam>): Promise<SubjectExam> => {
    const response = await http.patch<SubjectExam>(
      `${BASE_URL}/subject-exams/${subjectExamId}`,
      data
    );
    return response.data;
  },

  publish: async (subjectExamId: number): Promise<SubjectExam> => {
    const response = await http.post<SubjectExam>(
      `${BASE_URL}/subject-exams/${subjectExamId}/publish`
    );
    return response.data;
  },
};

// ============================================================================
// EXAM QUESTIONS API
// ============================================================================
export const examQuestionsApi = {
  getBySubjectExam: async (subjectExamId: number): Promise<ExamQuestion[]> => {
    const response = await http.get<ExamQuestion[]>(
      `${BASE_URL}/questions/subject-exam/${subjectExamId}`
    );
    return response.data;
  },

  create: async (data: ExamQuestionCreate): Promise<ExamQuestion> => {
    const response = await http.post<ExamQuestion>(`${BASE_URL}/questions`, data);
    return response.data;
  },

  update: async (questionId: number, data: ExamQuestionUpdate): Promise<ExamQuestion> => {
    const response = await http.patch<ExamQuestion>(`${BASE_URL}/questions/${questionId}`, data);
    return response.data;
  },

  delete: async (questionId: number): Promise<void> => {
    await http.delete(`${BASE_URL}/questions/${questionId}`);
  },

  bulkUpdateCOs: async (
    updates: Array<{ question_id: number; co_id: number }>
  ): Promise<ExamQuestion[]> => {
    const response = await http.post<ExamQuestion[]>(`${BASE_URL}/questions/bulk-update-cos`, {
      updates,
    });
    return response.data;
  },
};

// ============================================================================
// QUESTION MARKS API
// ============================================================================
export const questionMarksApi = {
  getBySubjectExam: async (subjectExamId: number): Promise<QuestionMark[]> => {
    const response = await http.get<QuestionMark[]>(
      `${BASE_URL}/question-marks/subject-exam/${subjectExamId}`
    );
    return response.data;
  },

  saveMarks: async (
    subjectExamId: number,
    marks: Array<{ question_id: number; student_id: number; marks_obtained: number }>
  ): Promise<QuestionMark[]> => {
    const response = await http.post<QuestionMark[]>(
      `${BASE_URL}/question-marks/subject-exam/${subjectExamId}`,
      { marks }
    );
    return response.data;
  },
};

// ============================================================================
// ATTAINMENT API
// ============================================================================
export const attainmentApi = {
  getStudentAttainment: async (
    studentId: number,
    examId?: number
  ): Promise<StudentCOAttainment[]> => {
    const params = examId ? `?exam_id=${examId}` : "";
    const response = await http.get<StudentCOAttainment[]>(
      `${BASE_URL}/attainment/student/${studentId}${params}`
    );
    return response.data;
  },

  getClassAttainment: async (
    classId: number,
    examId: number,
    subjectId?: number
  ): Promise<ClassCOAttainment[]> => {
    const params = subjectId ? `?subject_id=${subjectId}` : "";
    const response = await http.get<ClassCOAttainment[]>(
      `${BASE_URL}/attainment/class/${classId}/exam/${examId}${params}`
    );
    return response.data;
  },

  getSubjectAttainment: async (
    subjectId: number,
    examId: number,
    classId: number
  ): Promise<COAttainment[]> => {
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/subject/${subjectId}/exam/${examId}/class/${classId}`
    );
    return response.data;
  },

  // CO-based attainment for dashboard
  getCOAttainmentBySubject: async (subjectId: number): Promise<COAttainment[]> => {
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/co/subject/${subjectId}`
    );
    return response.data;
  },

  getCOAttainmentByClass: async (
    subjectId: number,
    classId: number
  ): Promise<COAttainment[]> => {
    const params = classId ? `?class_id=${classId}` : "";
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/co/subject/${subjectId}${params}`
    );
    return response.data;
  },

  getCOAttainmentByStudent: async (
    subjectId: number,
    studentId: number
  ): Promise<COAttainment[]> => {
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/co/subject/${subjectId}/student/${studentId}`
    );
    return response.data;
  },
};
