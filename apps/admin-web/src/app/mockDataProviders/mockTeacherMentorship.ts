// ============================================================================
// MOCK TEACHER MENTORSHIP DATA PROVIDER
// ============================================================================

export interface MentoredStudent {
  student_id: number;
  admission_no: string;
  full_name: string;
  roll_number: string;
  class_name: string;
  section: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  attendance_percentage: number;
  average_marks: number;
  behavior_rating: "Excellent" | "Good" | "Average" | "Needs Improvement";
  needs_attention: boolean;
  recent_issues?: string[];
}

export interface MentorshipKpi {
  teacher_id: number;
  total_mentored_students: number;
  students_needing_attention: number;
  top_performers: number;
  average_attendance: number;
  average_performance: number;
  is_class_teacher: boolean;
  assigned_class?: string;
  assigned_section?: string;
}

export interface MentorshipInsight {
  category: "attention" | "top_performer" | "achievement";
  student_name: string;
  student_id: number;
  message: string;
  priority: "high" | "medium" | "low";
  date: string;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Ananya", "Pari", "Anika", "Ira", "Diya",
  "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan", "Navya", "Myra", "Sara", "Kiara", "Aditi",
  "Shaurya", "Atharva", "Advik", "Pranav", "Reyansh", "Zara", "Anvi", "Riya", "Avni", "Saanvi",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Singh", "Kumar", "Reddy", "Gupta", "Joshi", "Nair", "Iyer",
  "Mehta", "Malhotra", "Kapoor", "Chopra", "Bose", "Sen", "Das", "Roy", "Sinha", "Jain",
];

const PARENT_FIRST_NAMES = [
  "Rajesh", "Suresh", "Ramesh", "Sunita", "Meena", "Kamala", "Ravi", "Anil", "Sanjay", "Deepak"
];

const BEHAVIOR_RATINGS: ("Excellent" | "Good" | "Average" | "Needs Improvement")[] = [
  "Excellent", "Excellent", "Good", "Good", "Good", "Average", "Needs Improvement"
];

export async function getMentoredStudents(teacherId: number): Promise<MentoredStudent[]> {
  await simulateDelay();

  const isClassTeacher = teacherId % 3 === 0; // 1 in 3 teachers is a class teacher
  const numStudents = isClassTeacher ? 35 + Math.floor(Math.random() * 10) : 0;

  if (numStudents === 0) {
    console.log(`[MOCK TEACHER MENTORSHIP] getMentoredStudents(${teacherId}) → 0 students (not a class teacher)`);
    return [];
  }

  const className = `Class ${6 + (teacherId % 7)}`;
  const section = ["A", "B", "C"][teacherId % 3];
  const students: MentoredStudent[] = [];

  for (let i = 0; i < numStudents; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const parentFirstName = PARENT_FIRST_NAMES[i % PARENT_FIRST_NAMES.length];
    const attendance = 70 + Math.floor(Math.random() * 30);
    const averageMarks = 50 + Math.floor(Math.random() * 45);
    const behavior = BEHAVIOR_RATINGS[Math.floor(Math.random() * BEHAVIOR_RATINGS.length)];

    const needsAttention = attendance < 80 || averageMarks < 60 || behavior === "Needs Improvement";
    const recentIssues: string[] = [];
    if (attendance < 80) recentIssues.push("Low attendance");
    if (averageMarks < 60) recentIssues.push("Below average performance");
    if (behavior === "Needs Improvement") recentIssues.push("Behavioral concerns");

    students.push({
      student_id: teacherId * 1000 + i + 1,
      admission_no: `ADM${String(teacherId * 1000 + i + 1).padStart(5, "0")}`,
      full_name: `${firstName} ${lastName}`,
      roll_number: String(i + 1).padStart(2, "0"),
      class_name: className,
      section,
      parent_name: `${parentFirstName} ${lastName}`,
      parent_phone: `+91-98765${String(43210 + i).slice(-5)}`,
      parent_email: `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      attendance_percentage: attendance,
      average_marks: averageMarks,
      behavior_rating: behavior,
      needs_attention: needsAttention,
      recent_issues: recentIssues.length > 0 ? recentIssues : undefined,
    });
  }

  console.log(`[MOCK TEACHER MENTORSHIP] getMentoredStudents(${teacherId}) → ${students.length} students`);
  return students;
}

export async function getMentorshipKpi(teacherId: number): Promise<MentorshipKpi> {
  await simulateDelay();

  const isClassTeacher = teacherId % 3 === 0;
  const students = await getMentoredStudents(teacherId);

  if (!isClassTeacher || students.length === 0) {
    return {
      teacher_id: teacherId,
      total_mentored_students: 0,
      students_needing_attention: 0,
      top_performers: 0,
      average_attendance: 0,
      average_performance: 0,
      is_class_teacher: false,
    };
  }

  const studentsNeedingAttention = students.filter(s => s.needs_attention).length;
  const topPerformers = students.filter(s => s.average_marks >= 85 && s.attendance_percentage >= 90).length;
  const avgAttendance = Math.round(students.reduce((sum, s) => sum + s.attendance_percentage, 0) / students.length);
  const avgPerformance = Math.round(students.reduce((sum, s) => sum + s.average_marks, 0) / students.length);

  return {
    teacher_id: teacherId,
    total_mentored_students: students.length,
    students_needing_attention: studentsNeedingAttention,
    top_performers: topPerformers,
    average_attendance: avgAttendance,
    average_performance: avgPerformance,
    is_class_teacher: true,
    assigned_class: students[0]?.class_name,
    assigned_section: students[0]?.section,
  };
}

export async function getMentorshipInsights(teacherId: number): Promise<MentorshipInsight[]> {
  await simulateDelay();

  const students = await getMentoredStudents(teacherId);
  if (students.length === 0) {
    console.log(`[MOCK TEACHER MENTORSHIP] getMentorshipInsights(${teacherId}) → 0 insights`);
    return [];
  }

  const insights: MentorshipInsight[] = [];

  // Students needing attention
  students.filter(s => s.needs_attention).slice(0, 3).forEach(student => {
    insights.push({
      category: "attention",
      student_name: student.full_name,
      student_id: student.student_id,
      message: student.recent_issues?.join(", ") || "Requires attention",
      priority: "high",
      date: new Date().toISOString().split("T")[0],
    });
  });

  // Top performers
  students.filter(s => s.average_marks >= 85).slice(0, 3).forEach(student => {
    insights.push({
      category: "top_performer",
      student_name: student.full_name,
      student_id: student.student_id,
      message: `Excellent performance with ${student.average_marks}% average`,
      priority: "low",
      date: new Date().toISOString().split("T")[0],
    });
  });

  // Recent achievements
  if (students.length > 0) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    insights.push({
      category: "achievement",
      student_name: randomStudent.full_name,
      student_id: randomStudent.student_id,
      message: "Won inter-school debate competition",
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
    });
  }

  console.log(`[MOCK TEACHER MENTORSHIP] getMentorshipInsights(${teacherId}) → ${insights.length} insights`);
  return insights;
}

export const mockTeacherMentorshipProvider = {
  getMentoredStudents,
  getMentorshipKpi,
  getMentorshipInsights,
};
