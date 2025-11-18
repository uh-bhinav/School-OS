// ============================================================================
// MOCK EXAMS DATA PROVIDER
// ============================================================================
// Provides realistic mock exam data for demo mode
// All CRUD operations work with in-memory storage
// ============================================================================

import type { Exam, ExamType, ExamKPI, ReportCard, ReportCardSummary } from "../services/exams.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let examIdCounter = 100;

const mockExamTypes: ExamType[] = [
  { id: 1, name: "Mid-Term", description: "Mid-term examination", weightage: 30, is_active: true },
  { id: 2, name: "Final", description: "Final examination", weightage: 50, is_active: true },
  { id: 3, name: "Unit Test", description: "Unit test", weightage: 10, is_active: true },
  { id: 4, name: "Monthly Test", description: "Monthly assessment", weightage: 10, is_active: true },
];

let mockExams: Exam[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockExams() {
  if (mockExams.length > 0) return;

  const subjects = ["Mathematics", "Science", "English", "Social Studies", "Hindi"];
  const sections = ["A", "B", "C"];
  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  classIds.forEach((classId) => {
    sections.forEach((section) => {
      subjects.forEach((subject, idx) => {
        // Create 2-3 exams per subject
        mockExamTypes.slice(0, 2).forEach((examType) => {
          const isPast = Math.random() > 0.3;
          const daysOffset = isPast ? -Math.floor(Math.random() * 60) : Math.floor(Math.random() * 30);

          const examDate = new Date();
          examDate.setDate(examDate.getDate() + daysOffset);

          mockExams.push({
            id: ++examIdCounter,
            school_id: 1,
            academic_year_id: 2025,
            class_id: classId,
            section,
            exam_type_id: examType.id,
            exam_type_name: examType.name,
            title: `${subject} ${examType.name} Exam`,
            date: examDate.toISOString().split("T")[0],
            total_marks: 100,
            average_score: isPast ? Math.round(60 + Math.random() * 25) : 0,
            highest_score: isPast ? Math.round(85 + Math.random() * 15) : 0,
            pass_percentage: isPast ? Math.round(70 + Math.random() * 25) : 0,
            is_published: isPast,
          });
        });
      });
    });
  });

  console.log(`[MOCK EXAMS] Initialized ${mockExams.length} exams`);
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockExams(params: {
  academic_year_id: number;
  class_id?: number;
  section?: string;
}): Promise<Exam[]> {
  initializeMockExams();
  await simulateDelay();

  let filtered = mockExams.filter((e) => e.academic_year_id === params.academic_year_id);
  if (params.class_id) filtered = filtered.filter((e) => e.class_id === params.class_id);
  if (params.section) filtered = filtered.filter((e) => e.section === params.section);

  console.log(`[MOCK EXAMS] getExams(${JSON.stringify(params)}) → ${filtered.length} exams`);
  return filtered;
}

export async function createMockExam(payload: Partial<Exam>): Promise<Exam> {
  initializeMockExams();
  await simulateDelay(300);

  const examType = mockExamTypes.find((t) => t.id === payload.exam_type_id);
  const newExam: Exam = {
    id: ++examIdCounter,
    school_id: payload.school_id || 1,
    academic_year_id: payload.academic_year_id || 2025,
    class_id: payload.class_id || 1,
    section: payload.section || "A",
    exam_type_id: payload.exam_type_id || 1,
    exam_type_name: examType?.name || "Unknown",
    title: payload.title || "Untitled Exam",
    date: payload.date || new Date().toISOString().split("T")[0],
    total_marks: payload.total_marks || 100,
    average_score: 0,
    highest_score: 0,
    pass_percentage: 0,
    is_published: false,
  };

  mockExams.push(newExam);
  console.log(`[MOCK EXAMS] Created exam #${newExam.id}`);
  return newExam;
}

export async function updateMockExam(id: number, payload: Partial<Exam>): Promise<Exam> {
  initializeMockExams();
  await simulateDelay(300);

  const exam = mockExams.find((e) => e.id === id);
  if (!exam) throw new Error(`Exam #${id} not found`);

  Object.assign(exam, payload);

  if (payload.exam_type_id) {
    const examType = mockExamTypes.find((t) => t.id === payload.exam_type_id);
    if (examType) exam.exam_type_name = examType.name;
  }

  console.log(`[MOCK EXAMS] Updated exam #${id}`);
  return exam;
}

export async function deleteMockExam(id: number): Promise<void> {
  initializeMockExams();
  await simulateDelay(200);

  const index = mockExams.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Exam #${id} not found`);

  mockExams.splice(index, 1);
  console.log(`[MOCK EXAMS] Deleted exam #${id}`);
}

export async function publishMockExam(id: number, publish: boolean): Promise<Exam> {
  initializeMockExams();
  await simulateDelay(200);

  const exam = mockExams.find((e) => e.id === id);
  if (!exam) throw new Error(`Exam #${id} not found`);

  exam.is_published = publish;
  console.log(`[MOCK EXAMS] ${publish ? "Published" : "Unpublished"} exam #${id}`);
  return exam;
}

// ============================================================================
// EXAM TYPES
// ============================================================================

export async function getMockExamTypes(schoolId: number): Promise<ExamType[]> {
  await simulateDelay(150);
  console.log(`[MOCK EXAMS] getExamTypes(${schoolId}) → ${mockExamTypes.length} types`);
  return mockExamTypes;
}

// ============================================================================
// KPI & ANALYTICS
// ============================================================================

export async function getMockExamKPI(params: {
  academic_year_id: number;
  class_id?: number;
}): Promise<ExamKPI> {
  initializeMockExams();
  await simulateDelay(200);

  let filtered = mockExams.filter((e) => e.academic_year_id === params.academic_year_id);
  if (params.class_id) filtered = filtered.filter((e) => e.class_id === params.class_id);

  const totalExams = filtered.length;
  const publishedExams = filtered.filter((e) => e.is_published);
  const publishedCount = publishedExams.length;
  const pendingResults = totalExams - publishedCount;

  const examsWithScores = publishedExams.filter((e) => (e.average_score ?? 0) > 0);
  const avgPerformance = examsWithScores.length > 0
    ? examsWithScores.reduce((sum, e) => sum + (e.average_score || 0), 0) / examsWithScores.length
    : 0;

  const passRate = examsWithScores.length > 0
    ? examsWithScores.reduce((sum, e) => sum + (e.pass_percentage || 0), 0) / examsWithScores.length
    : 0;

  const kpi: ExamKPI = {
    total_exams: totalExams,
    avg_performance: Math.round(avgPerformance * 10) / 10,
    pass_rate: Math.round(passRate * 10) / 10,
    pending_results: pendingResults,
    published_count: publishedCount,
  };

  console.log(`[MOCK EXAMS] getExamKPI → ${JSON.stringify(kpi)}`);
  return kpi;
}

// ============================================================================
// REPORT CARDS
// ============================================================================

export async function getMockReportCard(examId: number): Promise<ReportCard> {
  initializeMockExams();
  await simulateDelay(300);

  const exam = mockExams.find((e) => e.id === examId);
  if (!exam) throw new Error(`Exam #${examId} not found`);

  // Generate mock students
  const studentsPerClass = 40;
  const students: ReportCardSummary[] = [];

  for (let i = 1; i <= studentsPerClass; i++) {
    const studentId = exam.class_id * 1000 + i;
    const obtainedMarks = Math.round(35 + Math.random() * 60);
    const percentage = (obtainedMarks / exam.total_marks) * 100;

    let grade: string;
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";
    else grade = "F";

    students.push({
      student_id: studentId,
      student_name: `Student ${i}`,
      roll_no: i,
      class_id: exam.class_id,
      section: exam.section,
      total_marks: exam.total_marks,
      obtained_marks: obtainedMarks,
      grade,
      result_status: percentage >= 40 ? "PASS" : "FAIL",
    });
  }

  console.log(`[MOCK EXAMS] getReportCard(${examId}) → ${students.length} students`);
  return {
    exam_id: examId,
    exam_title: exam.title,
    students,
  };
}

export async function downloadMockReportCardPDF(examId: number): Promise<Blob> {
  await simulateDelay(500);

  const pdfContent = `Mock PDF Report Card for Exam ID: ${examId}\n\nThis is a demo mode placeholder.`;
  const blob = new Blob([pdfContent], { type: "application/pdf" });

  console.log(`[MOCK EXAMS] Downloaded PDF for exam #${examId}`);
  return blob;
}

// ============================================================================
// UTILITIES
// ============================================================================
function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// EXPORTS
// ============================================================================
export const mockExamsProvider = {
  getExams: getMockExams,
  create: createMockExam,
  update: updateMockExam,
  delete: deleteMockExam,
  publish: publishMockExam,
  getExamTypes: getMockExamTypes,
  getExamKPI: getMockExamKPI,
  getReportCard: getMockReportCard,
  downloadReportCardPDF: downloadMockReportCardPDF,
};
