// ============================================================================
// MOCK STUDENT REPORT CARD DATA PROVIDER
// ============================================================================

export interface ReportCard {
  id: number;
  student_id: number;
  academic_year_id: number;
  term: "Term 1" | "Term 2" | "Annual";
  exam_id: number;
  exam_name: string;
  class_id: number;
  class_name: string;
  section: string;
  generated_date: string;
  subjects: ReportCardSubject[];
  co_scholastic: CoScholasticGrade[];
  teacher_remarks: string;
  principal_remarks?: string;
  attendance_summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    percentage: number;
  };
  overall_grade: string;
  overall_percentage: number;
  rank: number;
  total_students: number;
  promotion_status: "Promoted" | "Detained" | "Re-examination Required";
  next_class?: string;
}

export interface ReportCardSubject {
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  grade: string;
  teacher_name: string;
  remarks?: string;
}

export interface CoScholasticGrade {
  category: string;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  remarks?: string;
}

const mockReportCards: ReportCard[] = [];

function initializeMockReportCards() {
  if (mockReportCards.length > 0) return;

  const subjects = [
    { name: "Mathematics", teacher: "Mr. Sharma" },
    { name: "Science", teacher: "Ms. Patel" },
    { name: "English", teacher: "Mrs. Singh" },
    { name: "Social Studies", teacher: "Mr. Kumar" },
    { name: "Hindi", teacher: "Ms. Gupta" },
  ];

  const coScholasticCategories = [
    "Work Education",
    "Art Education",
    "Physical Education",
    "Discipline",
    "Regularity & Punctuality",
  ];

  const grades = ["A+", "A", "B+", "B", "C", "D"];
  const remarks = [
    "Excellent performance",
    "Good work, keep it up",
    "Needs improvement",
    "Very good understanding",
    "Outstanding effort",
  ];

  // Generate report cards for students 1-700 (matching mockStudents pattern)
  for (let studentId = 1; studentId <= 700; studentId++) {
    const classId = Math.ceil(studentId / 70); // Approx 70 students per class
    const term = studentId % 3 === 0 ? "Annual" : studentId % 2 === 0 ? "Term 2" : "Term 1";

    const reportCardSubjects: ReportCardSubject[] = subjects.map((subject) => {
      const maxMarks = 100;
      const obtainedMarks = Math.round(40 + Math.random() * 55); // 40-95
      const percentage = (obtainedMarks / maxMarks) * 100;
      const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C" : "D";

      return {
        subject_name: subject.name,
        marks_obtained: obtainedMarks,
        max_marks: maxMarks,
        percentage: Math.round(percentage * 10) / 10,
        grade,
        teacher_name: subject.teacher,
        remarks: percentage < 50 ? "Needs improvement" : undefined,
      };
    });

    const coScholastic: CoScholasticGrade[] = coScholasticCategories.map((category) => ({
      category,
      grade: grades[Math.floor(Math.random() * 3)] as any, // Better grades for co-scholastic
    }));

    const totalMarks = reportCardSubjects.reduce((sum, s) => sum + s.marks_obtained, 0);
    const maxTotalMarks = reportCardSubjects.reduce((sum, s) => sum + s.max_marks, 0);
    const overallPercentage = (totalMarks / maxTotalMarks) * 100;
    const overallGrade = overallPercentage >= 90 ? "A+" : overallPercentage >= 80 ? "A" : overallPercentage >= 70 ? "B+" : overallPercentage >= 60 ? "B" : overallPercentage >= 50 ? "C" : "D";

    const totalDays = 180;
    const presentDays = Math.floor(150 + Math.random() * 25);
    const absentDays = totalDays - presentDays;
    const attendancePercentage = (presentDays / totalDays) * 100;

    const promotionStatus = overallPercentage >= 40 ? "Promoted" : overallPercentage >= 33 ? "Re-examination Required" : "Detained";

    mockReportCards.push({
      id: studentId * 10,
      student_id: studentId,
      academic_year_id: 1,
      term,
      exam_id: term === "Term 1" ? 1 : term === "Term 2" ? 2 : 3,
      exam_name: term === "Term 1" ? "First Term Examination" : term === "Term 2" ? "Second Term Examination" : "Annual Examination",
      class_id: classId,
      class_name: `Grade ${classId}`,
      section: "A",
      generated_date: "2025-11-15",
      subjects: reportCardSubjects,
      co_scholastic: coScholastic,
      teacher_remarks: remarks[Math.floor(Math.random() * remarks.length)],
      principal_remarks: term === "Annual" ? "Wishing you all the best for the next academic year" : undefined,
      attendance_summary: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        percentage: Math.round(attendancePercentage * 10) / 10,
      },
      overall_grade: overallGrade,
      overall_percentage: Math.round(overallPercentage * 10) / 10,
      rank: Math.floor(Math.random() * 40) + 1,
      total_students: 40,
      promotion_status: promotionStatus as any,
      next_class: promotionStatus === "Promoted" ? `Grade ${classId + 1}` : undefined,
    });
  }

  console.log(`[MOCK REPORT CARDS] Initialized ${mockReportCards.length} report cards`);
}

export async function getStudentReportCards(studentId: number): Promise<ReportCard[]> {
  initializeMockReportCards();
  await simulateDelay();

  const reportCards = mockReportCards.filter((rc) => rc.student_id === studentId);
  console.log(`[MOCK REPORT CARDS] getStudentReportCards(${studentId}) → ${reportCards.length} cards`);
  return reportCards;
}

export async function getStudentReportCardByExam(studentId: number, examId: number): Promise<ReportCard | null> {
  initializeMockReportCards();
  await simulateDelay();

  const reportCard = mockReportCards.find((rc) => rc.student_id === studentId && rc.exam_id === examId);
  console.log(`[MOCK REPORT CARDS] getStudentReportCardByExam(${studentId}, ${examId})`);
  return reportCard || null;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockReportCardProvider = {
  getStudentReportCards,
  getStudentReportCardByExam,
};
