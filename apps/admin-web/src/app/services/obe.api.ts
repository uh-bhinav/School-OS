// ============================================================================
// OBE API SERVICE
// ============================================================================
// API functions for OBE-related data (CO, PO, Subject Exams, Questions, Attainment)
// Currently uses mock data, ready for backend integration

import { http } from "./http";
import { isDemoMode } from "../mockDataProviders";
import { getSubjectsBySchool, getSubjectDetailById, MOCK_SUBJECTS } from "../mockDataProviders/mockSubjects";
import {
  getCOsBySubjectAndGrade,
  getApprovedCOsBySubjectAndGrade,
  getCOsBySubject,
  addCourseOutcome,
  updateCourseOutcome as updateMockCO,
  deleteCourseOutcome as deleteMockCO,
  bulkApproveCOs as bulkApproveMockCOs
} from "../mockDataProviders/mockCourseOutcomes";
import { MOCK_PROGRAM_OUTCOMES } from "../mockDataProviders/mockProgramOutcomes";
import {
  getSubjectExamsByExam,
  getSubjectExamById,
  getQuestionsBySubjectExam,
  getMarksBySubjectExam,
  MOCK_EXAM_QUESTIONS,
  MOCK_QUESTION_MARKS,
} from "../mockDataProviders/mockSubjectExams";
import {
  getClassCOAttainment,
  getStudentCOAttainment,
  getCOAttainmentBySubject,
} from "../mockDataProviders/mockCOAttainment";
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
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getSubjectsBySchool(schoolId);
    }
    const response = await http.get<Subject[]>(`${BASE_URL}/subjects/school/${schoolId}`);
    return response.data;
  },

  getById: async (subjectId: number): Promise<SubjectDetail> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const subject = getSubjectDetailById(subjectId);
      if (!subject) throw new Error(`Subject ${subjectId} not found`);
      return subject;
    }
    const response = await http.get<SubjectDetail>(`${BASE_URL}/subjects/${subjectId}`);
    return response.data;
  },

  update: async (subjectId: number, data: Partial<Subject>): Promise<Subject> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const subject = MOCK_SUBJECTS.find(s => s.subject_id === subjectId);
      if (!subject) throw new Error(`Subject ${subjectId} not found`);
      return { ...subject, ...data };
    }
    const response = await http.patch<Subject>(`${BASE_URL}/subjects/${subjectId}`, data);
    return response.data;
  },
};

// ============================================================================
// COURSE OUTCOMES API
// ============================================================================
export const courseOutcomesApi = {
  getBySubjectAndGrade: async (subjectId: number, grade: number): Promise<CourseOutcome[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getCOsBySubjectAndGrade(subjectId, grade);
    }
    const response = await http.get<CourseOutcome[]>(
      `${BASE_URL}/cos/subject/${subjectId}/grade/${grade}`
    );
    return response.data;
  },

  getApprovedBySubjectAndGrade: async (
    subjectId: number,
    grade: number
  ): Promise<CourseOutcome[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getApprovedCOsBySubjectAndGrade(subjectId, grade);
    }
    const response = await http.get<CourseOutcome[]>(
      `${BASE_URL}/cos/subject/${subjectId}/grade/${grade}?status=approved`
    );
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<CourseOutcome[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getCOsBySubject(subjectId);
    }
    const response = await http.get<CourseOutcome[]>(`${BASE_URL}/cos/subject/${subjectId}`);
    return response.data;
  },

  create: async (data: CourseOutcomeCreate): Promise<CourseOutcome> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return addCourseOutcome(data as Omit<CourseOutcome, "id" | "created_at">);
    }
    const response = await http.post<CourseOutcome>(`${BASE_URL}/cos`, data);
    return response.data;
  },

  update: async (coId: number, data: CourseOutcomeUpdate): Promise<CourseOutcome> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const updated = updateMockCO(coId, data);
      if (!updated) throw new Error(`CO ${coId} not found`);
      return updated;
    }
    const response = await http.patch<CourseOutcome>(`${BASE_URL}/cos/${coId}`, data);
    return response.data;
  },

  delete: async (coId: number): Promise<void> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      deleteMockCO(coId);
      return;
    }
    await http.delete(`${BASE_URL}/cos/${coId}`);
  },

  bulkApprove: async (coIds: number[]): Promise<{ approved_count: number }> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const count = bulkApproveMockCOs(coIds);
      return { approved_count: count };
    }
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
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return MOCK_PROGRAM_OUTCOMES.filter(po => po.school_id === schoolId);
    }
    const response = await http.get<ProgramOutcome[]>(`${BASE_URL}/pos/school/${schoolId}`);
    return response.data;
  },
};

// ============================================================================
// SUBJECT EXAMS API
// ============================================================================
export const subjectExamsApi = {
  getByExam: async (examId: number): Promise<SubjectExam[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getSubjectExamsByExam(examId);
    }
    const response = await http.get<SubjectExam[]>(`${BASE_URL}/subject-exams/exam/${examId}`);
    return response.data;
  },

  getById: async (subjectExamId: number): Promise<SubjectExam> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const exam = getSubjectExamById(subjectExamId);
      if (!exam) throw new Error(`Subject exam ${subjectExamId} not found`);
      return exam;
    }
    const response = await http.get<SubjectExam>(`${BASE_URL}/subject-exams/${subjectExamId}`);
    return response.data;
  },

  expandExam: async (examId: number): Promise<SubjectExam[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getSubjectExamsByExam(examId);
    }
    const response = await http.post<SubjectExam[]>(`${BASE_URL}/subject-exams/expand/${examId}`);
    return response.data;
  },

  update: async (subjectExamId: number, data: Partial<SubjectExam>): Promise<SubjectExam> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const exam = getSubjectExamById(subjectExamId);
      if (!exam) throw new Error(`Subject exam ${subjectExamId} not found`);
      return { ...exam, ...data };
    }
    const response = await http.patch<SubjectExam>(
      `${BASE_URL}/subject-exams/${subjectExamId}`,
      data
    );
    return response.data;
  },

  publish: async (subjectExamId: number): Promise<SubjectExam> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const exam = getSubjectExamById(subjectExamId);
      if (!exam) throw new Error(`Subject exam ${subjectExamId} not found`);
      return { ...exam, status: "published" as any };
    }
    const response = await http.post<SubjectExam>(
      `${BASE_URL}/subject-exams/${subjectExamId}/publish`
    );
    return response.data;
  },
};

// ============================================================================
// EXAM QUESTIONS API
// ============================================================================
let questionIdCounter = 1000;

export const examQuestionsApi = {
  getBySubjectExam: async (subjectExamId: number): Promise<ExamQuestion[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getQuestionsBySubjectExam(subjectExamId);
    }
    const response = await http.get<ExamQuestion[]>(
      `${BASE_URL}/questions/subject-exam/${subjectExamId}`
    );
    return response.data;
  },

  create: async (data: ExamQuestionCreate): Promise<ExamQuestion> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const newQuestion: ExamQuestion = {
        id: ++questionIdCounter,
        ...data,
        co_code: data.co_id ? `CO${data.co_id}` : undefined,
        co_description: undefined,
      };
      MOCK_EXAM_QUESTIONS.push(newQuestion);
      return newQuestion;
    }
    const response = await http.post<ExamQuestion>(`${BASE_URL}/questions`, data);
    return response.data;
  },

  update: async (questionId: number, data: ExamQuestionUpdate): Promise<ExamQuestion> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const idx = MOCK_EXAM_QUESTIONS.findIndex(q => q.id === questionId);
      if (idx === -1) throw new Error(`Question ${questionId} not found`);
      MOCK_EXAM_QUESTIONS[idx] = { ...MOCK_EXAM_QUESTIONS[idx], ...data };
      return MOCK_EXAM_QUESTIONS[idx];
    }
    const response = await http.patch<ExamQuestion>(`${BASE_URL}/questions/${questionId}`, data);
    return response.data;
  },

  delete: async (questionId: number): Promise<void> => {
    // DEMO MODE: Remove from mock data
    if (isDemoMode()) {
      const idx = MOCK_EXAM_QUESTIONS.findIndex(q => q.id === questionId);
      if (idx !== -1) MOCK_EXAM_QUESTIONS.splice(idx, 1);
      return;
    }
    await http.delete(`${BASE_URL}/questions/${questionId}`);
  },

  bulkUpdateCOs: async (
    updates: Array<{ question_id: number; co_id: number }>
  ): Promise<ExamQuestion[]> => {
    // DEMO MODE: Update mock data
    if (isDemoMode()) {
      return updates.map(u => {
        const idx = MOCK_EXAM_QUESTIONS.findIndex(q => q.id === u.question_id);
        if (idx !== -1) {
          MOCK_EXAM_QUESTIONS[idx].co_id = u.co_id;
        }
        return MOCK_EXAM_QUESTIONS[idx];
      }).filter(Boolean);
    }
    const response = await http.post<ExamQuestion[]>(`${BASE_URL}/questions/bulk-update-cos`, {
      updates,
    });
    return response.data;
  },
};

// ============================================================================
// QUESTION MARKS API
// ============================================================================
let markIdCounter = 5000;

export const questionMarksApi = {
  getBySubjectExam: async (subjectExamId: number): Promise<QuestionMark[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getMarksBySubjectExam(subjectExamId);
    }
    const response = await http.get<QuestionMark[]>(
      `${BASE_URL}/question-marks/subject-exam/${subjectExamId}`
    );
    return response.data;
  },

  saveMarks: async (
    subjectExamId: number,
    marks: Array<{ question_id: number; student_id: number; marks_obtained: number }>
  ): Promise<QuestionMark[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      const result: QuestionMark[] = marks.map(m => {
        const existingIdx = MOCK_QUESTION_MARKS.findIndex(
          qm => qm.question_id === m.question_id && qm.student_id === m.student_id
        );
        if (existingIdx !== -1) {
          MOCK_QUESTION_MARKS[existingIdx].marks_obtained = m.marks_obtained;
          return MOCK_QUESTION_MARKS[existingIdx];
        } else {
          const question = MOCK_EXAM_QUESTIONS.find(q => q.id === m.question_id);
          const newMark: QuestionMark = {
            id: ++markIdCounter,
            question_id: m.question_id,
            student_id: m.student_id,
            marks_obtained: m.marks_obtained,
            max_marks: question?.max_marks || 10,
          };
          MOCK_QUESTION_MARKS.push(newMark);
          return newMark;
        }
      });
      return result;
    }
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
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getStudentCOAttainment(studentId, examId);
    }
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
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getClassCOAttainment(classId, examId, subjectId);
    }
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
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getCOAttainmentBySubject(subjectId, examId, classId);
    }
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/subject/${subjectId}/exam/${examId}/class/${classId}`
    );
    return response.data;
  },

  // CO-based attainment for dashboard
  getCOAttainmentBySubject: async (subjectId: number): Promise<COAttainment[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getCOAttainmentBySubject(subjectId, 0, 0);
    }
    const response = await http.get<COAttainment[]>(
      `${BASE_URL}/attainment/co/subject/${subjectId}`
    );
    return response.data;
  },

  getCOAttainmentByClass: async (
    subjectId: number,
    classId: number
  ): Promise<COAttainment[]> => {
    // DEMO MODE: Return mock data
    if (isDemoMode()) {
      return getCOAttainmentBySubject(subjectId, 0, classId);
    }
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
