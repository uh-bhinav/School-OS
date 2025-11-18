// ============================================================================
// MOCK DASHBOARD DATA PROVIDER
// ============================================================================

export interface DashboardMetrics {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  attendance_today: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  revenue: {
    total: number;
    pending: number;
    collected_this_month: number;
  };
  upcoming_exams: number;
  pending_announcements: number;
}

export interface AttendanceByGrade {
  grade: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  target: number;
}

export interface ModuleUsage {
  module_name: string;
  usage_count: number;
  last_used: string;
}

export interface KeyInsight {
  id: number;
  type: "WARNING" | "INFO" | "SUCCESS" | "ERROR";
  title: string;
  description: string;
  timestamp: string;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export async function getMockDashboardMetrics(): Promise<DashboardMetrics> {
  await simulateDelay(300);

  const metrics: DashboardMetrics = {
    total_students: 400,
    total_teachers: 35,
    total_classes: 30,
    attendance_today: {
      present: 365,
      absent: 25,
      late: 10,
      percentage: 91.25,
    },
    revenue: {
      total: 2600000,
      pending: 480000,
      collected_this_month: 350000,
    },
    upcoming_exams: 12,
    pending_announcements: 3,
  };

  console.log(`[MOCK DASHBOARD] getDashboardMetrics`);
  return metrics;
}

export async function getMockAttendanceByGrade(): Promise<AttendanceByGrade[]> {
  await simulateDelay(250);

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const data: AttendanceByGrade[] = grades.map((grade, idx) => {
    const total = 40 + Math.floor(Math.random() * 10);
    const present = Math.floor(total * (0.85 + Math.random() * 0.1));
    const absent = Math.floor((total - present) * 0.7);
    const late = total - present - absent;
    const percentage = (present / total) * 100;

    return {
      grade,
      present,
      absent,
      late,
      total,
      percentage: Math.round(percentage * 10) / 10,
    };
  });

  console.log(`[MOCK DASHBOARD] getAttendanceByGrade → ${data.length} grades`);
  return data;
}

export async function getMockRevenueByMonth(): Promise<RevenueByMonth[]> {
  await simulateDelay(250);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data: RevenueByMonth[] = months.slice(0, 11).map((month, idx) => ({
    month,
    revenue: 180000 + Math.floor(Math.random() * 100000),
    target: 250000,
  }));

  console.log(`[MOCK DASHBOARD] getRevenueByMonth → ${data.length} months`);
  return data;
}

export async function getMockModuleUsage(): Promise<ModuleUsage[]> {
  await simulateDelay(200);

  const data: ModuleUsage[] = [
    { module_name: "Attendance", usage_count: 1250, last_used: "2025-11-15T09:30:00Z" },
    { module_name: "Timetable", usage_count: 980, last_used: "2025-11-15T08:15:00Z" },
    { module_name: "Exams", usage_count: 650, last_used: "2025-11-14T16:45:00Z" },
    { module_name: "Marks", usage_count: 820, last_used: "2025-11-15T10:00:00Z" },
    { module_name: "Fees", usage_count: 540, last_used: "2025-11-14T14:20:00Z" },
    { module_name: "Communications", usage_count: 420, last_used: "2025-11-15T07:50:00Z" },
    { module_name: "Announcements", usage_count: 380, last_used: "2025-11-13T11:30:00Z" },
  ];

  console.log(`[MOCK DASHBOARD] getModuleUsage → ${data.length} modules`);
  return data;
}

export async function getMockKeyInsights(): Promise<KeyInsight[]> {
  await simulateDelay(200);

  const data: KeyInsight[] = [
    {
      id: 1,
      type: "WARNING",
      title: "Low Attendance in Grade 7",
      description: "Attendance in Grade 7-B has dropped below 85% this week. Immediate action required.",
      timestamp: "2025-11-15T09:00:00Z",
    },
    {
      id: 2,
      type: "INFO",
      title: "Exam Schedule Published",
      description: "Mid-term exam schedule has been published for all classes.",
      timestamp: "2025-11-14T16:30:00Z",
    },
    {
      id: 3,
      type: "SUCCESS",
      title: "Fee Collection Target Met",
      description: "Monthly fee collection target of ₹2.5L has been achieved.",
      timestamp: "2025-11-13T14:00:00Z",
    },
    {
      id: 4,
      type: "ERROR",
      title: "Pending Report Cards",
      description: "12 report cards are pending approval for Grade 10.",
      timestamp: "2025-11-12T10:15:00Z",
    },
    {
      id: 5,
      type: "INFO",
      title: "New Teachers Onboarded",
      description: "3 new teachers have been successfully onboarded this month.",
      timestamp: "2025-11-11T11:00:00Z",
    },
  ];

  console.log(`[MOCK DASHBOARD] getKeyInsights → ${data.length} insights`);
  return data;
}

export async function getMockClassPerformanceSummary(): Promise<{
  class_name: string;
  avg_attendance: number;
  avg_marks: number;
  students_count: number;
}[]> {
  await simulateDelay(250);

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
  const data = classes.map((class_name, idx) => ({
    class_name,
    avg_attendance: 85 + Math.random() * 10,
    avg_marks: 60 + Math.random() * 25,
    students_count: 35 + Math.floor(Math.random() * 10),
  }));

  console.log(`[MOCK DASHBOARD] getClassPerformanceSummary → ${data.length} classes`);
  return data;
}

export async function getMockUpcomingEvents(): Promise<{
  id: number;
  title: string;
  date: string;
  type: "EXAM" | "EVENT" | "MEETING" | "HOLIDAY";
}[]> {
  await simulateDelay(200);

  const data = [
    { id: 1, title: "Mid-term Exams Begin", date: "2025-11-25", type: "EXAM" as const },
    { id: 2, title: "Parent-Teacher Meeting", date: "2025-11-20", type: "MEETING" as const },
    { id: 3, title: "Annual Sports Day", date: "2025-12-15", type: "EVENT" as const },
    { id: 4, title: "Winter Break Begins", date: "2025-12-24", type: "HOLIDAY" as const },
    { id: 5, title: "Science Exhibition", date: "2025-12-05", type: "EVENT" as const },
  ];

  console.log(`[MOCK DASHBOARD] getUpcomingEvents → ${data.length} events`);
  return data;
}

export async function getMockTeacherPerformance(): Promise<{
  teacher_name: string;
  subjects_taught: number;
  classes_handled: number;
  avg_student_performance: number;
}[]> {
  await simulateDelay(250);

  const teachers = ["Mr. Sharma", "Mrs. Gupta", "Ms. Patel", "Mr. Singh", "Mrs. Verma"];
  const data = teachers.map((teacher_name) => ({
    teacher_name,
    subjects_taught: 1 + Math.floor(Math.random() * 3),
    classes_handled: 2 + Math.floor(Math.random() * 4),
    avg_student_performance: 65 + Math.random() * 25,
  }));

  console.log(`[MOCK DASHBOARD] getTeacherPerformance → ${data.length} teachers`);
  return data;
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
export const mockDashboardProvider = {
  getDashboardMetrics: getMockDashboardMetrics,
  getAttendanceByGrade: getMockAttendanceByGrade,
  getRevenueByMonth: getMockRevenueByMonth,
  getModuleUsage: getMockModuleUsage,
  getKeyInsights: getMockKeyInsights,
  getClassPerformanceSummary: getMockClassPerformanceSummary,
  getUpcomingEvents: getMockUpcomingEvents,
  getTeacherPerformance: getMockTeacherPerformance,
};
