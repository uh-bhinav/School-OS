// ============================================================================
// OBE MSW HANDLERS
// ============================================================================
// Mock Service Worker handlers for OBE API endpoints

import { http, HttpResponse, delay } from "msw";
import {
  MOCK_SUBJECTS,
  MOCK_SUBJECT_DETAILS,
} from "../mockDataProviders/mockSubjects";
import {
  getCOsBySubjectAndGrade,
  getApprovedCOsBySubjectAndGrade,
  getCOsBySubject,
  addCourseOutcome,
  updateCourseOutcome,
  deleteCourseOutcome,
  bulkApproveCOs,
} from "../mockDataProviders/mockCourseOutcomes";
import { getProgramOutcomes } from "../mockDataProviders/mockProgramOutcomes";
import {
  getSubjectExamsByExam,
  getSubjectExamById,
  updateSubjectExam,
  getQuestionsBySubjectExam,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getMarksBySubjectExam,
  saveQuestionMark,
} from "../mockDataProviders/mockSubjectExams";
import {
  getClassCOAttainment,
  getStudentCOAttainment,
  getCOAttainmentBySubject,
} from "../mockDataProviders/mockCOAttainment";

// Use wildcard prefix to match any origin (same pattern as exams.handlers.ts)
const BASE_URL = "*/api/v1/obe";

export const obeHandlers = [
  // ============================================================================
  // SUBJECTS HANDLERS
  // ============================================================================

  // GET /api/v1/obe/subjects/school/:schoolId
  http.get(`${BASE_URL}/subjects/school/:schoolId`, async () => {
    await delay(100);
    // Return all subjects regardless of schoolId for demo purposes
    // In real app, subjects would be filtered by school
    return HttpResponse.json(MOCK_SUBJECTS);
  }),

  // GET /api/v1/obe/subjects/:subjectId
  http.get(`${BASE_URL}/subjects/:subjectId`, async ({ params }) => {
    await delay(100);
    const subjectId = Number(params.subjectId);
    const subject = MOCK_SUBJECT_DETAILS.find((s) => s.subject_id === subjectId);
    if (!subject) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(subject);
  }),

  // PATCH /api/v1/obe/subjects/:subjectId
  http.patch(`${BASE_URL}/subjects/:subjectId`, async ({ params, request }) => {
    await delay(100);
    const subjectId = Number(params.subjectId);
    const updates = (await request.json()) as Partial<typeof MOCK_SUBJECTS[0]>;

    const index = MOCK_SUBJECTS.findIndex((s) => s.subject_id === subjectId);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    MOCK_SUBJECTS[index] = { ...MOCK_SUBJECTS[index], ...updates };
    return HttpResponse.json(MOCK_SUBJECTS[index]);
  }),

  // ============================================================================
  // COURSE OUTCOMES HANDLERS
  // ============================================================================

  // GET /api/v1/obe/cos/subject/:subjectId/grade/:grade
  http.get(`${BASE_URL}/cos/subject/:subjectId/grade/:grade`, async ({ params, request }) => {
    await delay(100);
    const subjectId = Number(params.subjectId);
    const grade = Number(params.grade);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let cos;
    if (status === "approved") {
      cos = getApprovedCOsBySubjectAndGrade(subjectId, grade);
    } else {
      cos = getCOsBySubjectAndGrade(subjectId, grade);
    }

    return HttpResponse.json(cos);
  }),

  // GET /api/v1/obe/cos/subject/:subjectId
  http.get(`${BASE_URL}/cos/subject/:subjectId`, async ({ params }) => {
    await delay(100);
    const subjectId = Number(params.subjectId);
    const cos = getCOsBySubject(subjectId);
    return HttpResponse.json(cos);
  }),

  // POST /api/v1/obe/cos
  http.post(`${BASE_URL}/cos`, async ({ request }) => {
    await delay(150);
    const data = (await request.json()) as any;
    const newCO = addCourseOutcome(data);
    return HttpResponse.json(newCO, { status: 201 });
  }),

  // PATCH /api/v1/obe/cos/:coId
  http.patch(`${BASE_URL}/cos/:coId`, async ({ params, request }) => {
    await delay(100);
    const coId = Number(params.coId);
    const updates = (await request.json()) as any;
    const updatedCO = updateCourseOutcome(coId, updates);

    if (!updatedCO) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(updatedCO);
  }),

  // DELETE /api/v1/obe/cos/:coId
  http.delete(`${BASE_URL}/cos/:coId`, async ({ params }) => {
    await delay(100);
    const coId = Number(params.coId);
    const deleted = deleteCourseOutcome(coId);

    if (!deleted) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/v1/obe/cos/bulk-approve
  http.post(`${BASE_URL}/cos/bulk-approve`, async ({ request }) => {
    await delay(150);
    const { co_ids } = (await request.json()) as { co_ids: number[] };
    const approvedCount = bulkApproveCOs(co_ids);
    return HttpResponse.json({ approved_count: approvedCount });
  }),

  // ============================================================================
  // PROGRAM OUTCOMES HANDLERS
  // ============================================================================

  // GET /api/v1/obe/pos/school/:schoolId
  http.get(`${BASE_URL}/pos/school/:schoolId`, async ({ params }) => {
    await delay(100);
    const schoolId = Number(params.schoolId);
    const pos = getProgramOutcomes(schoolId);
    return HttpResponse.json(pos);
  }),

  // ============================================================================
  // SUBJECT EXAMS HANDLERS
  // ============================================================================

  // GET /api/v1/obe/subject-exams/exam/:examId
  http.get(`${BASE_URL}/subject-exams/exam/:examId`, async ({ params }) => {
    await delay(100);
    const examId = Number(params.examId);
    const subjectExams = getSubjectExamsByExam(examId);
    return HttpResponse.json(subjectExams);
  }),

  // GET /api/v1/obe/subject-exams/:subjectExamId
  http.get(`${BASE_URL}/subject-exams/:subjectExamId`, async ({ params }) => {
    await delay(100);
    const subjectExamId = Number(params.subjectExamId);
    const subjectExam = getSubjectExamById(subjectExamId);

    if (!subjectExam) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(subjectExam);
  }),

  // POST /api/v1/obe/subject-exams/expand/:examId
  http.post(`${BASE_URL}/subject-exams/expand/:examId`, async ({ params }) => {
    await delay(200);
    const examId = Number(params.examId);
    // In a real implementation, this would create subject exams from class subjects
    // For now, return existing subject exams for this exam
    const subjectExams = getSubjectExamsByExam(examId);
    return HttpResponse.json(subjectExams);
  }),

  // PATCH /api/v1/obe/subject-exams/:subjectExamId
  http.patch(`${BASE_URL}/subject-exams/:subjectExamId`, async ({ params, request }) => {
    await delay(100);
    const subjectExamId = Number(params.subjectExamId);
    const updates = (await request.json()) as any;
    const updated = updateSubjectExam(subjectExamId, updates);

    if (!updated) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(updated);
  }),

  // POST /api/v1/obe/subject-exams/:subjectExamId/publish
  http.post(`${BASE_URL}/subject-exams/:subjectExamId/publish`, async ({ params }) => {
    await delay(150);
    const subjectExamId = Number(params.subjectExamId);
    const subjectExam = getSubjectExamById(subjectExamId);

    if (!subjectExam) {
      return new HttpResponse(null, { status: 404 });
    }

    // Check if all questions have COs mapped
    const questions = getQuestionsBySubjectExam(subjectExamId);
    const unmappedCount = questions.filter((q) => q.co_id === null).length;

    if (unmappedCount > 0) {
      return HttpResponse.json(
        { error: `Cannot publish: ${unmappedCount} questions do not have CO mapped` },
        { status: 400 }
      );
    }

    const updated = updateSubjectExam(subjectExamId, { status: "published" });
    return HttpResponse.json(updated);
  }),

  // ============================================================================
  // EXAM QUESTIONS HANDLERS
  // ============================================================================

  // GET /api/v1/obe/questions/subject-exam/:subjectExamId
  http.get(`${BASE_URL}/questions/subject-exam/:subjectExamId`, async ({ params }) => {
    await delay(100);
    const subjectExamId = Number(params.subjectExamId);
    const questions = getQuestionsBySubjectExam(subjectExamId);
    return HttpResponse.json(questions);
  }),

  // POST /api/v1/obe/questions
  http.post(`${BASE_URL}/questions`, async ({ request }) => {
    await delay(150);
    const data = (await request.json()) as any;
    const newQuestion = addQuestion(data);
    return HttpResponse.json(newQuestion, { status: 201 });
  }),

  // PATCH /api/v1/obe/questions/:questionId
  http.patch(`${BASE_URL}/questions/:questionId`, async ({ params, request }) => {
    await delay(100);
    const questionId = Number(params.questionId);
    const updates = (await request.json()) as any;
    const updated = updateQuestion(questionId, updates);

    if (!updated) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(updated);
  }),

  // DELETE /api/v1/obe/questions/:questionId
  http.delete(`${BASE_URL}/questions/:questionId`, async ({ params }) => {
    await delay(100);
    const questionId = Number(params.questionId);
    const deleted = deleteQuestion(questionId);

    if (!deleted) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/v1/obe/questions/bulk-update-cos
  http.post(`${BASE_URL}/questions/bulk-update-cos`, async ({ request }) => {
    await delay(150);
    const { updates } = (await request.json()) as {
      updates: Array<{ question_id: number; co_id: number }>;
    };

    const updatedQuestions = updates.map(({ question_id, co_id }) => {
      return updateQuestion(question_id, { co_id });
    }).filter(Boolean);

    return HttpResponse.json(updatedQuestions);
  }),

  // ============================================================================
  // QUESTION MARKS HANDLERS
  // ============================================================================

  // GET /api/v1/obe/question-marks/subject-exam/:subjectExamId
  http.get(`${BASE_URL}/question-marks/subject-exam/:subjectExamId`, async ({ params }) => {
    await delay(100);
    const subjectExamId = Number(params.subjectExamId);
    const marks = getMarksBySubjectExam(subjectExamId);
    return HttpResponse.json(marks);
  }),

  // POST /api/v1/obe/question-marks/subject-exam/:subjectExamId
  http.post(`${BASE_URL}/question-marks/subject-exam/:subjectExamId`, async ({ request }) => {
    await delay(150);
    const { marks } = (await request.json()) as {
      marks: Array<{ question_id: number; student_id: number; marks_obtained: number }>;
    };

    const savedMarks = marks.map((m) => {
      const question = getQuestionById(m.question_id);
      return saveQuestionMark({
        question_id: m.question_id,
        student_id: m.student_id,
        marks_obtained: m.marks_obtained,
        max_marks: question?.max_marks || 0,
        student_name: "", // Would be filled from student lookup
        roll_no: "",
      });
    });

    return HttpResponse.json(savedMarks);
  }),

  // ============================================================================
  // ATTAINMENT HANDLERS
  // ============================================================================

  // GET /api/v1/obe/attainment/student/:studentId
  http.get(`${BASE_URL}/attainment/student/:studentId`, async ({ params, request }) => {
    await delay(100);
    const studentId = Number(params.studentId);
    const url = new URL(request.url);
    const examId = url.searchParams.get("exam_id");

    const attainment = getStudentCOAttainment(
      studentId,
      examId ? Number(examId) : undefined
    );

    return HttpResponse.json(attainment);
  }),

  // GET /api/v1/obe/attainment/class/:classId/exam/:examId
  http.get(`${BASE_URL}/attainment/class/:classId/exam/:examId`, async ({ params, request }) => {
    await delay(100);
    const classId = Number(params.classId);
    const examId = Number(params.examId);
    const url = new URL(request.url);
    const subjectId = url.searchParams.get("subject_id");

    const attainment = getClassCOAttainment(
      classId,
      examId,
      subjectId ? Number(subjectId) : undefined
    );

    return HttpResponse.json(attainment);
  }),

  // GET /api/v1/obe/attainment/subject/:subjectId/exam/:examId/class/:classId
  http.get(
    `${BASE_URL}/attainment/subject/:subjectId/exam/:examId/class/:classId`,
    async ({ params }) => {
      await delay(100);
      const subjectId = Number(params.subjectId);
      const examId = Number(params.examId);
      const classId = Number(params.classId);

      const attainment = getCOAttainmentBySubject(subjectId, examId, classId);
      return HttpResponse.json(attainment);
    }
  ),

  // GET /api/v1/obe/attainment/co/subject/:subjectId - CO attainment by subject
  http.get(
    `${BASE_URL}/attainment/co/subject/:subjectId`,
    async ({ params, request }) => {
      await delay(150);
      const subjectId = Number(params.subjectId);
      const url = new URL(request.url);
      const classId = url.searchParams.get("class_id");

      // Generate mock CO attainment data
      const attainment = getCOAttainmentBySubject(
        subjectId,
        1, // default exam
        classId ? Number(classId) : 1
      );
      return HttpResponse.json(attainment);
    }
  ),

  // GET /api/v1/obe/attainment/co/subject/:subjectId/student/:studentId
  http.get(
    `${BASE_URL}/attainment/co/subject/:subjectId/student/:studentId`,
    async ({ params }) => {
      await delay(150);
      const subjectId = Number(params.subjectId);
      const studentId = Number(params.studentId);

      // Generate mock student-specific CO attainment
      const attainmentData = getStudentCOAttainment(studentId, 1);
      // Extract COs from the subject matching this subjectId
      const subjectData = attainmentData[0]?.subjects?.find(
        (s) => s.subject_id === subjectId
      );

      // Transform to COAttainment format
      const coAttainment = subjectData?.cos?.map((co) => ({
        co_id: co.co_id,
        co_code: co.co_code,
        co_description: `CO ${co.co_code} Description`,
        bloom_level: "Apply" as const,
        subject_id: subjectId,
        attainment_percentage: co.attainment_percentage,
        total_marks_obtained: co.obtained_marks,
        total_max_marks: co.max_marks,
        students_met_target: co.attainment_percentage >= 70 ? 1 : 0,
        total_students: 1,
      })) || [];

      return HttpResponse.json(coAttainment);
    }
  ),
];

export default obeHandlers;
