// ============================================================================
// MOCK MARKS DATA PROVIDER
// ============================================================================

import type {
  Mark,
  MarkCreate,
  MarkUpdate,
  MarksKpi,
  ClassPerformance,
  StudentProgress,
} from "../services/marks.schema";
import { calculateGrade, calculatePercentage } from "../services/marks.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let markIdCounter = 20000;
const mockMarks: Mark[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockMarks() {
  if (mockMarks.length > 0) return;

  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const examIds = [1, 2, 3, 4, 5]; // Reference to exams
  const subjectIds = [1, 2, 3, 4, 5]; // Math, Science, English, Social, Hindi
  const subjectNames = ["Mathematics", "Science", "English", "Social Studies", "Hindi"];
  const studentsPerClass = 40;

  classIds.forEach((classId) => {
    for (let studentNum = 1; studentNum <= studentsPerClass; studentNum++) {
      const studentId = classId * 1000 + studentNum;

      examIds.forEach((examId) => {
        subjectIds.forEach((subjectId, idx) => {
          const maxMarks = 100;
          const obtainedMarks = Math.round(35 + Math.random() * 60);
          const percentage = calculatePercentage(obtainedMarks, maxMarks);
          const grade = calculateGrade(percentage);

          mockMarks.push({
            id: ++markIdCounter,
            school_id: 1,
            student_id: studentId,
            exam_id: examId,
            subject_id: subjectId,
            marks_obtained: obtainedMarks,
            max_marks: maxMarks,
            remarks: percentage < 40 ? "Needs improvement" : null,
            entered_by_teacher_id: 1,
            student_name: `Student ${studentNum}`,
            roll_no: String(studentNum),
            class_id: classId,
            section: "A",
            subject_name: subjectNames[idx],
            exam_name: `Exam ${examId}`,
            exam_date: `2025-${String(examId + 7).padStart(2, "0")}-15`,
            grade,
            percentage,
          });
        });
      });
    }
  });

  console.log(`[MOCK MARKS] Initialized ${mockMarks.length} marks`);
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockMarks(filters: {
  exam_id?: number;
  student_id?: number;
  subject_id?: number;
  class_id?: number;
}): Promise<Mark[]> {
  initializeMockMarks();
  await simulateDelay();

  let filtered = mockMarks;
  if (filters.exam_id) filtered = filtered.filter((m) => m.exam_id === filters.exam_id);
  if (filters.student_id) filtered = filtered.filter((m) => m.student_id === filters.student_id);
  if (filters.subject_id) filtered = filtered.filter((m) => m.subject_id === filters.subject_id);
  if (filters.class_id) filtered = filtered.filter((m) => m.class_id === filters.class_id);

  console.log(`[MOCK MARKS] getMarks → ${filtered.length} marks`);
  return filtered;
}

export async function createMockMark(data: MarkCreate): Promise<Mark> {
  initializeMockMarks();
  await simulateDelay(250);

  const percentage = calculatePercentage(data.marks_obtained, data.max_marks);
  const grade = calculateGrade(percentage);

  const newMark: Mark = {
    id: ++markIdCounter,
    school_id: data.school_id,
    student_id: data.student_id,
    exam_id: data.exam_id,
    subject_id: data.subject_id,
    marks_obtained: data.marks_obtained,
    max_marks: data.max_marks,
    remarks: data.remarks || null,
    entered_by_teacher_id: 1,
    grade,
    percentage,
  };

  mockMarks.push(newMark);
  console.log(`[MOCK MARKS] Created mark #${newMark.id}`);
  return newMark;
}

export async function updateMockMark(id: number, patch: MarkUpdate): Promise<Mark> {
  initializeMockMarks();
  await simulateDelay(250);

  const mark = mockMarks.find((m) => m.id === id);
  if (!mark) throw new Error(`Mark #${id} not found`);

  if (patch.marks_obtained !== undefined) {
    mark.marks_obtained = patch.marks_obtained;
    mark.percentage = calculatePercentage(mark.marks_obtained, mark.max_marks);
    mark.grade = calculateGrade(mark.percentage);
  }

  if (patch.remarks !== undefined) mark.remarks = patch.remarks;

  console.log(`[MOCK MARKS] Updated mark #${id}`);
  return mark;
}

export async function deleteMockMark(id: number): Promise<void> {
  initializeMockMarks();
  await simulateDelay(200);

  const index = mockMarks.findIndex((m) => m.id === id);
  if (index === -1) throw new Error(`Mark #${id} not found`);

  mockMarks.splice(index, 1);
  console.log(`[MOCK MARKS] Deleted mark #${id}`);
}

// ============================================================================
// KPIs & ANALYTICS
// ============================================================================

export async function getMockMarksKPI(filters: { exam_id: number; class_id: number }): Promise<MarksKpi> {
  initializeMockMarks();
  await simulateDelay();

  const filtered = mockMarks.filter(
    (m) => m.exam_id === filters.exam_id && m.class_id === filters.class_id
  );

  if (filtered.length === 0) {
    return {
      class_average: null,
      highest_score: null,
      lowest_score: null,
      total_students: 0,
      students_passed: 0,
      failure_rate: 0,
    };
  }

  // Get unique students
  const uniqueStudents = new Set(filtered.map((m) => m.student_id));
  const totalStudents = uniqueStudents.size;

  // Calculate overall metrics
  const scores = filtered.map((m) => m.marks_obtained);
  const classAverage = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Calculate pass count per student (passed if avg >= 40%)
  const studentScores = new Map<number, { total: number; count: number }>();
  filtered.forEach((m) => {
    if (!studentScores.has(m.student_id)) {
      studentScores.set(m.student_id, { total: 0, count: 0 });
    }
    const stats = studentScores.get(m.student_id)!;
    stats.total += (m.percentage || 0);
    stats.count += 1;
  });

  let studentsPassed = 0;
  studentScores.forEach((stats) => {
    const avgPercentage = stats.total / stats.count;
    if (avgPercentage >= 40) {
      studentsPassed++;
    }
  });

  const failureRate = totalStudents > 0 ? ((totalStudents - studentsPassed) / totalStudents) * 100 : 0;

  const kpi: MarksKpi = {
    class_average: Math.round(classAverage * 10) / 10,
    highest_score: highestScore,
    lowest_score: lowestScore,
    total_students: totalStudents,
    students_passed: studentsPassed,
    failure_rate: Math.round(failureRate * 10) / 10,
  };

  console.log(`[MOCK MARKS] getKPI → total_students: ${totalStudents}, avg: ${classAverage.toFixed(2)}`);
  return kpi;
}

export async function getMockClassPerformance(filters: {
  exam_id: number;
  class_id: number;
}): Promise<ClassPerformance[]> {
  initializeMockMarks();
  await simulateDelay();

  const filtered = mockMarks.filter(
    (m) => m.exam_id === filters.exam_id && m.class_id === filters.class_id
  );

  const bySubject: Record<string, number[]> = {};
  filtered.forEach((m) => {
    if (!bySubject[m.subject_name!]) bySubject[m.subject_name!] = [];
    bySubject[m.subject_name!].push(m.percentage || 0);
  });

  const performance: ClassPerformance[] = Object.entries(bySubject).map(([subject_name, percentages]) => {
    const avgScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const passRate = (percentages.filter((p) => p >= 40).length / percentages.length) * 100;

    return {
      subject_name,
      average_score: Math.round(avgScore * 10) / 10,
      pass_rate: Math.round(passRate * 10) / 10,
    };
  });

  console.log(`[MOCK MARKS] getClassPerformance → ${performance.length} subjects`);
  return performance;
}

export async function getMockStudentProgress(studentId: number): Promise<StudentProgress[]> {
  initializeMockMarks();
  await simulateDelay();

  const filtered = mockMarks.filter((m) => m.student_id === studentId);

  const bySubject: Record<string, Mark[]> = {};
  filtered.forEach((m) => {
    if (!bySubject[m.subject_name!]) bySubject[m.subject_name!] = [];
    bySubject[m.subject_name!].push(m);
  });

  const progress: StudentProgress[] = Object.entries(bySubject).map(([subject_name, marks]) => ({
    subject_name,
    exams: marks
      .sort((a, b) => (a.exam_date || "").localeCompare(b.exam_date || ""))
      .map((m) => ({
        exam_name: m.exam_name!,
        marks_obtained: m.marks_obtained,
        max_marks: m.max_marks,
        percentage: m.percentage || 0,
        date: m.exam_date!,
      })),
  }));

  console.log(`[MOCK MARKS] getStudentProgress(${studentId}) → ${progress.length} subjects`);
  return progress;
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
export const mockMarksProvider = {
  getMarks: getMockMarks,
  create: createMockMark,
  update: updateMockMark,
  delete: deleteMockMark,
  getMarksKPI: getMockMarksKPI,
  getClassPerformance: getMockClassPerformance,
  getStudentProgress: getMockStudentProgress,
};
