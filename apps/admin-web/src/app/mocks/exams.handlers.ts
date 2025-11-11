import { http, HttpResponse, delay } from "msw";
import { Exam, ExamType, ExamKPI, ReportCard } from "../services/exams.schema";

// ==============================
// Mock Data Storage
// ==============================
let examIdCounter = 100;

const mockExamTypes: ExamType[] = [
  { id: 1, name: "Mid-Term", description: "Mid-term examination", weightage: 30, is_active: true },
  { id: 2, name: "Final", description: "Final examination", weightage: 50, is_active: true },
  { id: 3, name: "Unit Test", description: "Unit test", weightage: 10, is_active: true },
  { id: 4, name: "Monthly Test", description: "Monthly assessment", weightage: 10, is_active: true },
];

const mockExams: Exam[] = [
  {
    id: 1,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: 1,
    exam_type_name: "Mid-Term",
    title: "Mathematics Mid-Term Exam",
    date: "2025-09-15",
    total_marks: 100,
    average_score: 72.5,
    highest_score: 95,
    pass_percentage: 85,
    is_published: true,
  },
  {
    id: 2,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: 1,
    exam_type_name: "Mid-Term",
    title: "Science Mid-Term Exam",
    date: "2025-09-18",
    total_marks: 100,
    average_score: 68.3,
    highest_score: 92,
    pass_percentage: 78,
    is_published: true,
  },
  {
    id: 3,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: 2,
    exam_type_name: "Final",
    title: "English Final Exam",
    date: "2025-11-20",
    total_marks: 100,
    average_score: 0,
    highest_score: 0,
    pass_percentage: 0,
    is_published: false,
  },
  {
    id: 4,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: 3,
    exam_type_name: "Unit Test",
    title: "Social Studies Unit Test 1",
    date: "2025-08-10",
    total_marks: 50,
    average_score: 38.2,
    highest_score: 48,
    pass_percentage: 92,
    is_published: true,
  },
  {
    id: 5,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: 3,
    exam_type_name: "Unit Test",
    title: "Hindi Unit Test 1",
    date: "2025-08-12",
    total_marks: 50,
    average_score: 41.5,
    highest_score: 50,
    pass_percentage: 88,
    is_published: true,
  },
  {
    id: 6,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 8,
    section: "B",
    exam_type_id: 1,
    exam_type_name: "Mid-Term",
    title: "Mathematics Mid-Term Exam",
    date: "2025-09-15",
    total_marks: 100,
    average_score: 69.8,
    highest_score: 89,
    pass_percentage: 82,
    is_published: true,
  },
];

const mockReportCards: Record<number, ReportCard> = {
  1: {
    exam_id: 1,
    exam_title: "Mathematics Mid-Term Exam",
    students: [
      {
        student_id: 101,
        student_name: "Aarav Sharma",
        roll_no: 1,
        class_id: 8,
        section: "A",
        total_marks: 100,
        obtained_marks: 95,
        grade: "A+",
        result_status: "PASS",
      },
      {
        student_id: 102,
        student_name: "Ananya Gupta",
        roll_no: 2,
        class_id: 8,
        section: "A",
        total_marks: 100,
        obtained_marks: 88,
        grade: "A",
        result_status: "PASS",
      },
      {
        student_id: 103,
        student_name: "Vivaan Singh",
        roll_no: 3,
        class_id: 8,
        section: "A",
        total_marks: 100,
        obtained_marks: 72,
        grade: "B+",
        result_status: "PASS",
      },
      {
        student_id: 104,
        student_name: "Ishaan Verma",
        roll_no: 4,
        class_id: 8,
        section: "A",
        total_marks: 100,
        obtained_marks: 65,
        grade: "B",
        result_status: "PASS",
      },
      {
        student_id: 105,
        student_name: "Diya Patel",
        roll_no: 5,
        class_id: 8,
        section: "A",
        total_marks: 100,
        obtained_marks: 42,
        grade: "D",
        result_status: "FAIL",
      },
    ],
  },
};

// ==============================
// Mock Handlers
// ==============================
export const examsHandlers = [
  // GET */api/v1/exams - Get all exams with filters
  http.get("*/api/v1/exams", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/exams");
    await delay(300);
    const url = new URL(request.url);
    const academicYearId = Number(url.searchParams.get("academic_year_id"));
    const classId = url.searchParams.get("class_id") ? Number(url.searchParams.get("class_id")) : null;
    const section = url.searchParams.get("section");

    console.log("🔶 MSW: Query params:", { academicYearId, classId, section });

    let filtered = mockExams.filter(e => e.academic_year_id === academicYearId);
    if (classId) filtered = filtered.filter(e => e.class_id === classId);
    if (section) filtered = filtered.filter(e => e.section === section);

    console.log(`🔶 MSW: Returning ${filtered.length} exams`);
    return HttpResponse.json(filtered);
  }),

  // GET */api/v1/exam_types/:school_id - Get exam types
  http.get("*/api/v1/exam_types/:school_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/exam_types/:school_id", params.school_id);
    await delay(200);
    console.log(`🔶 MSW: Returning ${mockExamTypes.length} exam types`);
    return HttpResponse.json(mockExamTypes);
  }),

  // GET */api/v1/exams/kpi - Get KPI metrics
  http.get("*/api/v1/exams/kpi", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/exams/kpi");
    await delay(250);
    const url = new URL(request.url);
    const academicYearId = Number(url.searchParams.get("academic_year_id"));
    const classId = url.searchParams.get("class_id") ? Number(url.searchParams.get("class_id")) : null;

    console.log("🔶 MSW: KPI Query params:", { academicYearId, classId });

    let filtered = mockExams.filter(e => e.academic_year_id === academicYearId);
    if (classId) filtered = filtered.filter(e => e.class_id === classId);

    const totalExams = filtered.length;
    const publishedCount = filtered.filter(e => e.is_published).length;
    const pendingResults = totalExams - publishedCount;

    const publishedExams = filtered.filter(e => e.is_published && (e.average_score ?? 0) > 0);
    const avgPerformance = publishedExams.length > 0
      ? publishedExams.reduce((sum, e) => sum + (e.average_score || 0), 0) / publishedExams.length
      : 0;

    const passRate = publishedExams.length > 0
      ? publishedExams.reduce((sum, e) => sum + (e.pass_percentage || 0), 0) / publishedExams.length
      : 0;

    const kpi: ExamKPI = {
      total_exams: totalExams,
      avg_performance: Math.round(avgPerformance * 10) / 10,
      pass_rate: Math.round(passRate * 10) / 10,
      pending_results: pendingResults,
      published_count: publishedCount,
    };

    console.log("🔶 MSW: Returning KPI:", kpi);
    return HttpResponse.json(kpi);
  }),

  // POST */api/v1/exams - Create new exam
  http.post("*/api/v1/exams", async ({ request }) => {
    console.log("🔶 MSW: Intercepted POST /api/v1/exams");
    await delay(400);
    const body = await request.json() as Partial<Exam>;

    const examType = mockExamTypes.find(t => t.id === body.exam_type_id);
    const newExam: Exam = {
      id: ++examIdCounter,
      school_id: body.school_id || 2,
      academic_year_id: body.academic_year_id || 2025,
      class_id: body.class_id || 8,
      section: body.section || "A",
      exam_type_id: body.exam_type_id || 1,
      exam_type_name: examType?.name || "Unknown",
      title: body.title || "Untitled Exam",
      date: body.date || new Date().toISOString().split("T")[0],
      total_marks: body.total_marks || 100,
      average_score: 0,
      highest_score: 0,
      pass_percentage: 0,
      is_published: false,
    };

    mockExams.push(newExam);
    console.log("🔶 MSW: Created exam:", newExam.id);
    return HttpResponse.json(newExam, { status: 201 });
  }),

  // PUT */api/v1/exams/:id - Update exam
  http.put("*/api/v1/exams/:id", async ({ params, request }) => {
    console.log("🔶 MSW: Intercepted PUT /api/v1/exams/:id", params.id);
    await delay(400);
    const id = Number(params.id);
    const body = await request.json() as Partial<Exam>;

    const index = mockExams.findIndex(e => e.id === id);
    if (index === -1) {
      console.log("🔶 MSW: Exam not found:", id);
      return new HttpResponse(null, { status: 404 });
    }

    const examType = body.exam_type_id
      ? mockExamTypes.find(t => t.id === body.exam_type_id)
      : null;

    mockExams[index] = {
      ...mockExams[index],
      ...body,
      exam_type_name: examType?.name || mockExams[index].exam_type_name,
    };

    console.log("🔶 MSW: Updated exam:", id);
    return HttpResponse.json(mockExams[index]);
  }),

  // DELETE */api/v1/exams/:id - Delete exam
  http.delete("*/api/v1/exams/:id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted DELETE /api/v1/exams/:id", params.id);
    await delay(300);
    const id = Number(params.id);
    const index = mockExams.findIndex(e => e.id === id);

    if (index === -1) {
      console.log("🔶 MSW: Exam not found:", id);
      return new HttpResponse(null, { status: 404 });
    }

    mockExams.splice(index, 1);
    console.log("🔶 MSW: Deleted exam:", id);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST */api/v1/exams/:id/publish - Publish/unpublish exam
  http.post("*/api/v1/exams/:id/publish", async ({ params, request }) => {
    console.log("🔶 MSW: Intercepted POST /api/v1/exams/:id/publish", params.id);
    await delay(300);
    const id = Number(params.id);
    const body = await request.json() as { publish: boolean };

    const exam = mockExams.find(e => e.id === id);
    if (!exam) {
      console.log("🔶 MSW: Exam not found:", id);
      return new HttpResponse(null, { status: 404 });
    }

    exam.is_published = body.publish;
    console.log("🔶 MSW: Published exam:", id, body.publish);
    return HttpResponse.json(exam);
  }),

  // GET */api/v1/report_cards/:exam_id - Get report card
  http.get("*/api/v1/report_cards/:exam_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/report_cards/:exam_id", params.exam_id);
    await delay(350);
    const examId = Number(params.exam_id);

    const reportCard = mockReportCards[examId];
    if (!reportCard) {
      // Generate a generic report card
      const exam = mockExams.find(e => e.id === examId);
      if (!exam) {
        console.log("🔶 MSW: Exam not found for report card:", examId);
        return new HttpResponse(null, { status: 404 });
      }

      console.log("🔶 MSW: Returning empty report card for exam:", examId);
      return HttpResponse.json({
        exam_id: examId,
        exam_title: exam.title,
        students: [],
      });
    }

    console.log("🔶 MSW: Returning report card for exam:", examId);
    return HttpResponse.json(reportCard);
  }),

  // GET */api/v1/pdf/report_card/:exam_id - Download report card PDF
  http.get("*/api/v1/pdf/report_card/:exam_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/pdf/report_card/:exam_id", params.exam_id);
    await delay(500);
    const examId = Number(params.exam_id);

    // Create a mock PDF blob
    const pdfContent = `Mock PDF for Exam ID: ${examId}`;
    const blob = new Blob([pdfContent], { type: "application/pdf" });

    console.log("🔶 MSW: Returning PDF for exam:", examId);
    return HttpResponse.arrayBuffer(await blob.arrayBuffer(), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report_card_${examId}.pdf"`,
      },
    });
  }),
];
