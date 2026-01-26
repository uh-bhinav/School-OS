import { http, HttpResponse, delay } from "msw";
import { Mark, MarksKpi, ClassPerformance, StudentProgress } from "../services/marks.schema";

// ==============================
// Mock Data Storage
// ==============================
let markIdCounter = 200;

// Comprehensive mock marks data (using inline type to avoid schema mismatch)
const mockMarks: Array<{
  id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  section: string;
  subject_id: number;
  subject_name: string;
  exam_id: number;
  exam_name: string;
  marks_obtained: number;
  max_marks: number;
  grade?: string;
  is_published?: boolean;
}> = [
  // Mathematics - Class 8A - Mid-Term (exam_id: 5)
  { id: 1, student_id: 1001, student_name: "Rahul Verma", roll_no: "08A01", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 76, max_marks: 100, grade: "B+", is_published: true },
  { id: 2, student_id: 1002, student_name: "Priya Singh", roll_no: "08A02", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 88, max_marks: 100, grade: "A", is_published: true },
  { id: 3, student_id: 1003, student_name: "Amit Kumar", roll_no: "08A03", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 92, max_marks: 100, grade: "A+", is_published: true },
  { id: 4, student_id: 1004, student_name: "Sneha Patel", roll_no: "08A04", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 65, max_marks: 100, grade: "B", is_published: true },
  { id: 5, student_id: 1005, student_name: "Vikram Sharma", roll_no: "08A05", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 54, max_marks: 100, grade: "C+", is_published: true },
  { id: 6, student_id: 1006, student_name: "Anjali Reddy", roll_no: "08A06", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 82, max_marks: 100, grade: "A", is_published: true },
  { id: 7, student_id: 1007, student_name: "Rohan Gupta", roll_no: "08A07", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 71, max_marks: 100, grade: "B", is_published: true },
  { id: 8, student_id: 1008, student_name: "Neha Joshi", roll_no: "08A08", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 95, max_marks: 100, grade: "A+", is_published: true },

  // Science - Class 8A - Mid-Term (exam_id: 5)
  { id: 9, student_id: 1001, student_name: "Rahul Verma", roll_no: "08A01", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 68, max_marks: 100, grade: "B", is_published: true },
  { id: 10, student_id: 1002, student_name: "Priya Singh", roll_no: "08A02", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 79, max_marks: 100, grade: "B+", is_published: true },
  { id: 11, student_id: 1003, student_name: "Amit Kumar", roll_no: "08A03", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 85, max_marks: 100, grade: "A", is_published: true },
  { id: 12, student_id: 1004, student_name: "Sneha Patel", roll_no: "08A04", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 72, max_marks: 100, grade: "B+", is_published: true },
  { id: 13, student_id: 1005, student_name: "Vikram Sharma", roll_no: "08A05", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 48, max_marks: 100, grade: "D", is_published: true },
  { id: 14, student_id: 1006, student_name: "Anjali Reddy", roll_no: "08A06", class_id: 8, section: "A", subject_id: 22, subject_name: "Science", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 88, max_marks: 100, grade: "A", is_published: true },

  // English - Class 8A - Mid-Term (exam_id: 5)
  { id: 15, student_id: 1001, student_name: "Rahul Verma", roll_no: "08A01", class_id: 8, section: "A", subject_id: 23, subject_name: "English", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 81, max_marks: 100, grade: "A", is_published: true },
  { id: 16, student_id: 1002, student_name: "Priya Singh", roll_no: "08A02", class_id: 8, section: "A", subject_id: 23, subject_name: "English", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 90, max_marks: 100, grade: "A+", is_published: true },
  { id: 17, student_id: 1003, student_name: "Amit Kumar", roll_no: "08A03", class_id: 8, section: "A", subject_id: 23, subject_name: "English", exam_id: 5, exam_name: "Mid-Term", marks_obtained: 76, max_marks: 100, grade: "B+", is_published: true },

  // Final Exam data - some published, some not
  { id: 18, student_id: 1001, student_name: "Rahul Verma", roll_no: "08A01", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 6, exam_name: "Final", marks_obtained: 82, max_marks: 100, grade: "A", is_published: false },
  { id: 19, student_id: 1002, student_name: "Priya Singh", roll_no: "08A02", class_id: 8, section: "A", subject_id: 21, subject_name: "Mathematics", exam_id: 6, exam_name: "Final", marks_obtained: 91, max_marks: 100, grade: "A+", is_published: false },
];

// ==============================
// Mock Handlers
// ==============================
export const marksHandlers = [
  // GET */api/v1/marks - Get all marks with filters
  http.get("*/api/v1/marks", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/marks");
    await delay(300);
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id") ? Number(url.searchParams.get("class_id")) : null;
    const section = url.searchParams.get("section");
    const examId = url.searchParams.get("exam_id") ? Number(url.searchParams.get("exam_id")) : null;
    const subjectId = url.searchParams.get("subject_id") ? Number(url.searchParams.get("subject_id")) : null;

    console.log("🔶 MSW: Query params:", { classId, section, examId, subjectId });

    let filtered = [...mockMarks];
    if (classId) filtered = filtered.filter(m => m.class_id === classId);
    if (section) filtered = filtered.filter(m => m.section === section);
    if (examId) filtered = filtered.filter(m => m.exam_id === examId);
    if (subjectId) filtered = filtered.filter(m => m.subject_id === subjectId);

    console.log(`🔶 MSW: Returning ${filtered.length} marks`);
    return HttpResponse.json(filtered);
  }),

  // GET */api/v1/marks/kpi - Get KPI metrics
  http.get("*/api/v1/marks/kpi", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/marks/kpi");
    await delay(250);
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id") ? Number(url.searchParams.get("class_id")) : null;
    const section = url.searchParams.get("section");
    const examId = url.searchParams.get("exam_id") ? Number(url.searchParams.get("exam_id")) : null;

    console.log("🔶 MSW: KPI Query params:", { classId, section, examId });

    let filtered = [...mockMarks];
    if (classId) filtered = filtered.filter(m => m.class_id === classId);
    if (section) filtered = filtered.filter(m => m.section === section);
    if (examId) filtered = filtered.filter(m => m.exam_id === examId);

    // Calculate KPIs
    const uniqueStudents = new Set(filtered.map(m => m.student_id)).size;
    const totalMarks = filtered.reduce((sum, m) => sum + m.marks_obtained, 0);
    const avgScore = filtered.length > 0 ? totalMarks / filtered.length : 0;

    // Pass rate (assuming 40% is passing)
    const passCount = filtered.filter(m => (m.marks_obtained / m.max_marks) * 100 >= 40).length;
    const passRate = filtered.length > 0 ? (passCount / filtered.length) * 100 : 0;

    const highestScore = filtered.length > 0 ? Math.max(...filtered.map(m => m.marks_obtained)) : 0;

    const kpi: MarksKpi = {
      total_students: uniqueStudents,
      students_passed: passCount,
      failure_rate: Math.round((100 - passRate) * 10) / 10,
      class_average: Math.round(avgScore * 10) / 10,
      highest_score: highestScore,
      lowest_score: filtered.length > 0 ? Math.min(...filtered.map(m => m.marks_obtained)) : 0,
    };

    console.log("🔶 MSW: Returning KPI:", kpi);
    return HttpResponse.json(kpi);
  }),

  // GET */api/v1/marks/performance/class/:class_id/exam/:exam_id - Class performance by subject
  http.get("*/api/v1/marks/performance/class/:class_id/exam/:exam_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/marks/performance/class/:class_id/exam/:exam_id");
    await delay(300);
    const classId = Number(params.class_id);
    const examId = Number(params.exam_id);

    console.log("🔶 MSW: Performance params:", { classId, examId });

    const filtered = mockMarks.filter(m => m.class_id === classId && m.exam_id === examId);

    // Group by subject
    const subjectMap = new Map<string, { total: number; count: number; passed: number }>();

    filtered.forEach(mark => {
      if (!subjectMap.has(mark.subject_name)) {
        subjectMap.set(mark.subject_name, { total: 0, count: 0, passed: 0 });
      }
      const stats = subjectMap.get(mark.subject_name)!;
      stats.total += mark.marks_obtained;
      stats.count += 1;
      if ((mark.marks_obtained / mark.max_marks) * 100 >= 40) {
        stats.passed += 1;
      }
    });

    const performance: ClassPerformance[] = Array.from(subjectMap.entries()).map(([subject_name, stats]) => ({
      subject_name,
      average_score: Math.round((stats.total / stats.count) * 10) / 10,
      pass_rate: Math.round((stats.passed / stats.count) * 100 * 10) / 10,
    }));

    console.log(`🔶 MSW: Returning performance for ${performance.length} subjects`);
    return HttpResponse.json(performance);
  }),

  // GET */api/v1/marks/progression/student/:student_id/subject/:subject_id - Student progression
  http.get("*/api/v1/marks/progression/student/:student_id/subject/:subject_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/marks/progression/student/:student_id/subject/:subject_id");
    await delay(300);
    const studentId = Number(params.student_id);
    const subjectId = Number(params.subject_id);

    console.log("🔶 MSW: Progression params:", { studentId, subjectId });

    // Mock progression data showing improvement over time
    const progression: StudentProgress = {
      subject_name: subjectId === 21 ? "Mathematics" : subjectId === 22 ? "Science" : "English",
      exams: [
        { exam_name: "Unit Test 1", marks_obtained: 65, max_marks: 100, percentage: 65, date: "2025-08-01" },
        { exam_name: "Unit Test 2", marks_obtained: 70, max_marks: 100, percentage: 70, date: "2025-08-15" },
        { exam_name: "Mid-Term", marks_obtained: 74, max_marks: 100, percentage: 74, date: "2025-09-01" },
        { exam_name: "Unit Test 3", marks_obtained: 78, max_marks: 100, percentage: 78, date: "2025-09-15" },
        { exam_name: "Pre-Final", marks_obtained: 82, max_marks: 100, percentage: 82, date: "2025-10-01" },
      ],
    };

    console.log("🔶 MSW: Returning progression data");
    return HttpResponse.json(progression);
  }),

  // POST */api/v1/marks - Create new mark
  http.post("*/api/v1/marks", async ({ request }) => {
    console.log("🔶 MSW: Intercepted POST /api/v1/marks");
    await delay(400);
    const body = await request.json() as any;

    const newMark = {
      id: ++markIdCounter,
      student_id: body.student_id || 0,
      student_name: body.student_name || "Unknown",
      roll_no: body.roll_no || "",
      class_id: body.class_id || 8,
      section: body.section || "A",
      subject_id: body.subject_id || 21,
      subject_name: body.subject_name || "Unknown Subject",
      exam_id: body.exam_id || 5,
      exam_name: body.exam_name || "Unknown Exam",
      marks_obtained: body.marks_obtained || 0,
      max_marks: body.max_marks || 100,
      grade: body.grade,
      is_published: body.is_published ?? false,
    };

    mockMarks.push(newMark);
    console.log("🔶 MSW: Created mark:", newMark.id);
    return HttpResponse.json(newMark, { status: 201 });
  }),

  // PUT */api/v1/marks/:id - Update mark
  http.put("*/api/v1/marks/:id", async ({ params, request }) => {
    console.log("🔶 MSW: Intercepted PUT /api/v1/marks/:id", params.id);
    await delay(400);
    const id = Number(params.id);
    const body = await request.json() as Partial<Mark>;

    const index = mockMarks.findIndex(m => m.id === id);
    if (index === -1) {
      console.log("🔶 MSW: Mark not found:", id);
      return new HttpResponse(null, { status: 404 });
    }

    mockMarks[index] = {
      ...mockMarks[index],
      ...body,
    };

    console.log("🔶 MSW: Updated mark:", id);
    return HttpResponse.json(mockMarks[index]);
  }),

  // DELETE */api/v1/marks/:id - Delete mark
  http.delete("*/api/v1/marks/:id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted DELETE /api/v1/marks/:id", params.id);
    await delay(300);
    const id = Number(params.id);
    const index = mockMarks.findIndex(m => m.id === id);

    if (index === -1) {
      console.log("🔶 MSW: Mark not found:", id);
      return new HttpResponse(null, { status: 404 });
    }

    mockMarks.splice(index, 1);
    console.log("🔶 MSW: Deleted mark:", id);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST */api/v1/marks/bulk - Bulk upload marks
  http.post("*/api/v1/marks/bulk", async ({ request }) => {
    console.log("🔶 MSW: Intercepted POST /api/v1/marks/bulk");
    await delay(800); // Simulate longer processing time
    const body = await request.json() as { marks: any[] };

    const createdMarks: any[] = [];

    body.marks.forEach(markData => {
      const newMark = {
        id: ++markIdCounter,
        student_id: markData.student_id || 0,
        student_name: markData.student_name || "Unknown",
        roll_no: markData.roll_no || "",
        class_id: markData.class_id || 8,
        section: markData.section || "A",
        subject_id: markData.subject_id || 21,
        subject_name: markData.subject_name || "Unknown Subject",
        exam_id: markData.exam_id || 5,
        exam_name: markData.exam_name || "Unknown Exam",
        marks_obtained: markData.marks_obtained || 0,
        max_marks: markData.max_marks || 100,
        grade: markData.grade,
        is_published: markData.is_published ?? false,
      };
      mockMarks.push(newMark);
      createdMarks.push(newMark);
    });

    console.log(`🔶 MSW: Bulk created ${createdMarks.length} marks`);
    return HttpResponse.json({
      success: true,
      count: createdMarks.length,
      marks: createdMarks
    }, { status: 201 });
  }),

  // GET */api/v1/classes/:classId - Get single class
  http.get("*/api/v1/classes/:classId", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/classes/:classId");
    await delay(100);
    const classId = Number(params.classId);

    // Mock class data
    const mockClass = {
      id: classId,
      grade: classId,
      section: "A",
      name: `Class ${classId} A`,
      total_students: 40,
      class_teacher_id: 101,
      class_teacher_name: "Mrs. Sharma",
    };

    return HttpResponse.json(mockClass);
  }),

  // GET */api/v1/classes/:classId/students - Get students in a class
  http.get("*/api/v1/classes/:classId/students", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/classes/:classId/students");
    await delay(150);
    const classId = Number(params.classId);

    // Generate mock students for the class
    const mockStudents = [
      { id: 1001, name: "Rahul Sharma", roll_no: `${classId}A01`, class_id: classId, section: "A" },
      { id: 1002, name: "Priya Patel", roll_no: `${classId}A02`, class_id: classId, section: "A" },
      { id: 1003, name: "Amit Kumar", roll_no: `${classId}A03`, class_id: classId, section: "A" },
      { id: 1004, name: "Sneha Gupta", roll_no: `${classId}A04`, class_id: classId, section: "A" },
      { id: 1005, name: "Vikram Singh", roll_no: `${classId}A05`, class_id: classId, section: "A" },
      { id: 1006, name: "Ananya Reddy", roll_no: `${classId}A06`, class_id: classId, section: "A" },
      { id: 1007, name: "Karthik Nair", roll_no: `${classId}A07`, class_id: classId, section: "A" },
      { id: 1008, name: "Meera Joshi", roll_no: `${classId}A08`, class_id: classId, section: "A" },
      { id: 1009, name: "Arjun Menon", roll_no: `${classId}A09`, class_id: classId, section: "A" },
      { id: 1010, name: "Kavya Krishnan", roll_no: `${classId}A10`, class_id: classId, section: "A" },
    ];

    return HttpResponse.json(mockStudents);
  }),
];
