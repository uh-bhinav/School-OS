// ============================================================================
// MOCK TASKS DATA PROVIDER
// ============================================================================
// Provides realistic mock data for Task Manager module
// Used for demo purposes - all operations work with in-memory storage
// ============================================================================

import { MOCK_TEACHERS } from "./mockTeachers";

// ============================================================================
// TYPES
// ============================================================================

export type TaskStatus = "PENDING" | "ONGOING" | "COMPLETED";
export type TaskTarget = "GENERAL" | string; // "GENERAL" or class name like "Grade 8 - A"

export interface Task {
  taskId: string;
  title: string;
  description: string;
  assignedDate: string;
  deadline: string;
  target: TaskTarget;
  status: TaskStatus;
  adminRemarks: string;
  teacherRemarks: string;
  assignedTeacherIds: number[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  viewedAt?: string;
}

export interface TaskKPIs {
  totalTasks: number;
  pendingTasks: number;
  ongoingTasks: number;
  completedTasks: number;
  tasksDueToday: number;
  overdueTask: number;
}

export interface TaskFilters {
  status?: TaskStatus | "ALL";
  target?: string;
  search?: string;
  teacherId?: number;
}

export interface TaskStatusHistory {
  timestamp: string;
  status: string;
  description: string;
  actor?: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  target: TaskTarget;
  deadline: string;
  adminRemarks?: string;
}

export interface UpdateTaskRequest {
  taskId: string;
  status?: TaskStatus;
  teacherRemarks?: string;
  adminRemarks?: string;
}

export interface TeacherTaskStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  ongoing: number;
  overdue: number;
}

// ============================================================================
// CLASS-TEACHER MAPPING
// Maps which teachers teach which classes for task assignment logic
// ============================================================================

const CLASS_TEACHER_MAPPING: Record<string, number[]> = {
  "Grade 1 - A": [1, 2],
  "Grade 1 - B": [1, 2],
  "Grade 2 - A": [3, 4],
  "Grade 2 - B": [3, 4],
  "Grade 3 - A": [5, 6],
  "Grade 3 - B": [5, 6],
  "Grade 4 - A": [7, 8],
  "Grade 4 - B": [7, 8],
  "Grade 5 - A": [9, 10],
  "Grade 5 - B": [9, 10],
  "Grade 6 - A": [11, 12],
  "Grade 6 - B": [11, 12],
  "Grade 7 - A": [1, 5, 8, 9, 15, 16],
  "Grade 7 - B": [1, 5, 6, 8, 9, 15, 16],
  "Grade 8 - A": [1, 2, 5, 6, 7, 8, 9, 15, 16, 17],
  "Grade 8 - B": [1, 2, 5, 6, 7, 8, 9, 15, 16, 17],
  "Grade 9 - A": [1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 15, 16, 17],
  "Grade 9 - B": [1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 15, 16, 17],
  "Grade 10 - A": [1, 2, 3, 4, 7, 10, 13, 17],
  "Grade 10 - B": [1, 2, 3, 4, 7, 10, 13, 17],
  "Grade 11 - A": [3, 4, 11, 12, 13, 14, 18, 19, 20],
  "Grade 11 - B": [3, 4, 11, 12, 13, 14, 18, 19, 20],
  "Grade 12 - A": [11, 12, 14, 18, 19, 20],
  "Grade 12 - B": [11, 12, 14, 18, 19, 20],
};

// All available class targets for dropdowns
export const AVAILABLE_TARGETS = [
  "General",
  "Grade 1 - A",
  "Grade 1 - B",
  "Grade 2 - A",
  "Grade 2 - B",
  "Grade 3 - A",
  "Grade 3 - B",
  "Grade 4 - A",
  "Grade 4 - B",
  "Grade 5 - A",
  "Grade 5 - B",
  "Grade 6 - A",
  "Grade 6 - B",
  "Grade 7 - A",
  "Grade 7 - B",
  "Grade 8 - A",
  "Grade 8 - B",
  "Grade 9 - A",
  "Grade 9 - B",
  "Grade 10 - A",
  "Grade 10 - B",
  "Grade 11 - A",
  "Grade 11 - B",
  "Grade 12 - A",
  "Grade 12 - B",
];

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let taskIdCounter = 100;

// Generate all active teacher IDs for "General" tasks
const allTeacherIds = MOCK_TEACHERS.filter(t => t.is_active).map(t => t.teacher_id);

// Mock tasks with realistic data - at least 20 tasks
const MOCK_TASKS: Task[] = [
  {
    taskId: "TK001",
    title: "Prepare Lesson Plan for Chapter 4",
    description: "Prepare a comprehensive lesson plan with worksheets and interactive activities for Chapter 4 - Algebra. Include group activities, homework assignments, and assessment criteria. The plan should cover at least 5 class periods and align with the NEP 2020 guidelines for experiential learning.",
    assignedDate: "2025-11-20",
    deadline: "2025-11-24",
    target: "Grade 8 - A",
    status: "PENDING",
    adminRemarks: "Ensure you align with NEP guidelines. Focus on practical applications.",
    teacherRemarks: "",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 8 - A"] || [],
    createdAt: "2025-11-20T09:00:00Z",
    updatedAt: "2025-11-20T09:00:00Z",
  },
  {
    taskId: "TK002",
    title: "Complete Mid-Term Progress Reports",
    description: "Complete and submit mid-term progress reports for all students. Include detailed observations on academic performance, areas of improvement, participation in class activities, and behavioral observations. Reports should be ready for parent-teacher meeting scheduled next week.",
    assignedDate: "2025-11-18",
    deadline: "2025-11-25",
    target: "General",
    status: "ONGOING",
    adminRemarks: "Prioritize students who need additional support. Be specific in recommendations.",
    teacherRemarks: "Working on compiling the data. Will complete by deadline.",
    assignedTeacherIds: allTeacherIds,
    createdAt: "2025-11-18T10:30:00Z",
    updatedAt: "2025-11-22T14:00:00Z",
    viewedAt: "2025-11-19T08:15:00Z",
  },
  {
    taskId: "TK003",
    title: "Science Fair Project Mentorship",
    description: "Guide and mentor students participating in the upcoming Inter-School Science Fair. Help them with project selection, hypothesis formation, experiment design, and presentation preparation. Each teacher should mentor at least 2-3 student groups.",
    assignedDate: "2025-11-15",
    deadline: "2025-12-05",
    target: "Grade 9 - A",
    status: "ONGOING",
    adminRemarks: "Focus on innovative and socially relevant projects. Document progress weekly.",
    teacherRemarks: "Students have finalized their topics. Experiments are underway. Will submit progress report by Friday.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 9 - A"] || [],
    createdAt: "2025-11-15T08:00:00Z",
    updatedAt: "2025-11-23T11:30:00Z",
    viewedAt: "2025-11-15T09:00:00Z",
  },
  {
    taskId: "TK004",
    title: "Update Question Bank for Final Exams",
    description: "Update and expand the question bank for final examinations. Add at least 50 new questions per subject covering all chapters. Include a mix of MCQs, short answers, long answers, and application-based questions following CBSE pattern.",
    assignedDate: "2025-11-10",
    deadline: "2025-11-22",
    target: "General",
    status: "COMPLETED",
    adminRemarks: "Ensure questions cover all learning outcomes. Include HOTs questions.",
    teacherRemarks: "Question bank updated with 65 new questions. Reviewed and categorized by difficulty level. Ready for moderation.",
    assignedTeacherIds: allTeacherIds,
    createdAt: "2025-11-10T09:00:00Z",
    updatedAt: "2025-11-21T16:45:00Z",
    viewedAt: "2025-11-10T10:00:00Z",
    completedAt: "2025-11-21T16:45:00Z",
  },
  {
    taskId: "TK005",
    title: "Organize Math Olympiad Practice Sessions",
    description: "Conduct special coaching sessions for students selected for the Regional Mathematics Olympiad. Prepare practice papers, solve previous year questions, and conduct mock tests. Sessions should be held after school hours.",
    assignedDate: "2025-11-22",
    deadline: "2025-12-10",
    target: "Grade 10 - A",
    status: "PENDING",
    adminRemarks: "Coordinate with parents for extended hours. Ensure all selected students attend.",
    teacherRemarks: "",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 10 - A"] || [],
    createdAt: "2025-11-22T11:00:00Z",
    updatedAt: "2025-11-22T11:00:00Z",
  },
  {
    taskId: "TK006",
    title: "Conduct Remedial Classes for Weak Students",
    description: "Identify students scoring below 40% in unit tests and conduct remedial classes for them. Focus on fundamental concepts, provide additional worksheets, and track improvement. Submit weekly progress report.",
    assignedDate: "2025-11-19",
    deadline: "2025-12-15",
    target: "Grade 7 - B",
    status: "ONGOING",
    adminRemarks: "Work closely with parents. Consider peer tutoring as well.",
    teacherRemarks: "Identified 8 students for remedial support. First batch of classes completed. Seeing improvement in 5 students.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 7 - B"] || [],
    createdAt: "2025-11-19T08:30:00Z",
    updatedAt: "2025-11-25T10:00:00Z",
    viewedAt: "2025-11-19T09:00:00Z",
  },
  {
    taskId: "TK007",
    title: "Annual Day Performance Coordination",
    description: "Coordinate with students for Annual Day performances. This includes script writing, rehearsals, costume arrangements, and stage management. Work with the cultural committee and submit a detailed plan by the deadline.",
    assignedDate: "2025-11-05",
    deadline: "2025-11-20",
    target: "General",
    status: "COMPLETED",
    adminRemarks: "Ensure inclusive participation. Budget for costumes approved - Rs. 50,000.",
    teacherRemarks: "All performances finalized. Rehearsals completed. Costume distribution done. Ready for Annual Day on 25th November.",
    assignedTeacherIds: [15, 16, 1, 8],
    createdAt: "2025-11-05T10:00:00Z",
    updatedAt: "2025-11-19T17:30:00Z",
    viewedAt: "2025-11-05T11:00:00Z",
    completedAt: "2025-11-19T17:30:00Z",
  },
  {
    taskId: "TK008",
    title: "Laboratory Equipment Inventory Check",
    description: "Conduct a comprehensive inventory check of all laboratory equipment. Document the condition of each item, identify items needing repair or replacement, and submit a requisition for new equipment. Update the digital inventory system.",
    assignedDate: "2025-11-23",
    deadline: "2025-11-30",
    target: "General",
    status: "PENDING",
    adminRemarks: "Be thorough. Safety equipment should be given priority.",
    teacherRemarks: "",
    assignedTeacherIds: [3, 4, 7, 13],
    createdAt: "2025-11-23T09:00:00Z",
    updatedAt: "2025-11-23T09:00:00Z",
  },
  {
    taskId: "TK009",
    title: "Parent-Teacher Meeting Preparation",
    description: "Prepare individual student progress cards, identify talking points for each student, and prepare visual presentations showing class performance trends. Arrange seating for parents and ensure refreshments are ordered.",
    assignedDate: "2025-11-21",
    deadline: "2025-11-26",
    target: "Grade 8 - B",
    status: "ONGOING",
    adminRemarks: "Focus on constructive feedback. Have action plans ready for underperforming students.",
    teacherRemarks: "Progress cards prepared for 30 out of 35 students. Working on remaining 5.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 8 - B"] || [],
    createdAt: "2025-11-21T14:00:00Z",
    updatedAt: "2025-11-24T16:00:00Z",
    viewedAt: "2025-11-21T15:00:00Z",
  },
  {
    taskId: "TK010",
    title: "Create Digital Learning Resources",
    description: "Develop digital learning resources including video lectures, interactive quizzes, and downloadable study materials. Upload all resources to the school's learning management system. Create at least 5 resources per subject.",
    assignedDate: "2025-11-01",
    deadline: "2025-11-15",
    target: "General",
    status: "COMPLETED",
    adminRemarks: "Ensure accessibility features. Resources should work on mobile devices.",
    teacherRemarks: "All digital resources uploaded. Created 8 video lectures, 15 quizzes, and 20 study guides. Student feedback has been positive.",
    assignedTeacherIds: allTeacherIds,
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2025-11-14T18:00:00Z",
    viewedAt: "2025-11-01T09:30:00Z",
    completedAt: "2025-11-14T18:00:00Z",
  },
  {
    taskId: "TK011",
    title: "Sports Day Event Planning",
    description: "Plan and organize the upcoming Sports Day event. This includes creating event schedules, arranging equipment, coordinating with the PE department, organizing refreshments, and ensuring safety measures are in place.",
    assignedDate: "2025-11-20",
    deadline: "2025-12-01",
    target: "General",
    status: "PENDING",
    adminRemarks: "Coordinate with local hospitals for medical emergency preparedness.",
    teacherRemarks: "",
    assignedTeacherIds: [10, 1, 5, 8],
    createdAt: "2025-11-20T11:30:00Z",
    updatedAt: "2025-11-20T11:30:00Z",
  },
  {
    taskId: "TK012",
    title: "Curriculum Review and Feedback",
    description: "Review the current curriculum implementation and provide detailed feedback on what's working and what needs improvement. Include student performance data, teaching challenges faced, and suggestions for next academic year.",
    assignedDate: "2025-11-18",
    deadline: "2025-11-28",
    target: "Grade 11 - A",
    status: "ONGOING",
    adminRemarks: "Be specific with examples. Include comparison with previous years if available.",
    teacherRemarks: "Reviewed Physics and Chemistry curriculum. Working on student feedback compilation.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 11 - A"] || [],
    createdAt: "2025-11-18T09:00:00Z",
    updatedAt: "2025-11-23T15:00:00Z",
    viewedAt: "2025-11-18T10:30:00Z",
  },
  {
    taskId: "TK013",
    title: "Update Attendance Records",
    description: "Reconcile and update all attendance records for the month. Ensure digital records match physical registers. Identify students with attendance below 75% and prepare letters for parents.",
    assignedDate: "2025-11-24",
    deadline: "2025-11-26",
    target: "General",
    status: "PENDING",
    adminRemarks: "This is urgent. Deadline is strict.",
    teacherRemarks: "",
    assignedTeacherIds: allTeacherIds,
    createdAt: "2025-11-24T08:00:00Z",
    updatedAt: "2025-11-24T08:00:00Z",
  },
  {
    taskId: "TK014",
    title: "Prepare Board Exam Practice Papers",
    description: "Create comprehensive practice papers for Class 10 and 12 board examinations. Papers should follow CBSE marking scheme and include all types of questions. Prepare 3 sets of practice papers with answer keys and marking guidelines.",
    assignedDate: "2025-11-15",
    deadline: "2025-11-25",
    target: "Grade 10 - B",
    status: "ONGOING",
    adminRemarks: "Prioritize frequently asked topics. Include sample answers for subjective questions.",
    teacherRemarks: "Completed 2 sets. Working on the third set. Answer keys ready for first two sets.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 10 - B"] || [],
    createdAt: "2025-11-15T10:00:00Z",
    updatedAt: "2025-11-24T11:00:00Z",
    viewedAt: "2025-11-15T11:00:00Z",
  },
  {
    taskId: "TK015",
    title: "Organize Career Counseling Session",
    description: "Organize a career counseling session for Class 11 and 12 students. Invite professionals from different fields, prepare presentation materials, and create handouts about various career paths. Coordinate with alumni who can share their experiences.",
    assignedDate: "2025-11-22",
    deadline: "2025-12-08",
    target: "Grade 12 - A",
    status: "PENDING",
    adminRemarks: "Include information about scholarships and entrance exams.",
    teacherRemarks: "",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 12 - A"] || [],
    createdAt: "2025-11-22T14:00:00Z",
    updatedAt: "2025-11-22T14:00:00Z",
  },
  {
    taskId: "TK016",
    title: "Library Book Recommendation List",
    description: "Prepare a curated list of book recommendations for the school library. Include age-appropriate fiction and non-fiction books, reference materials, and subject-specific resources. The list should cover all grade levels.",
    assignedDate: "2025-11-08",
    deadline: "2025-11-18",
    target: "General",
    status: "COMPLETED",
    adminRemarks: "Include diverse authors and perspectives. Budget is Rs. 2 lakhs for new acquisitions.",
    teacherRemarks: "Submitted list of 150 recommended books across all categories. List has been reviewed and approved by the library committee.",
    assignedTeacherIds: [1, 5, 8, 9, 11],
    createdAt: "2025-11-08T09:00:00Z",
    updatedAt: "2025-11-17T16:00:00Z",
    viewedAt: "2025-11-08T10:00:00Z",
    completedAt: "2025-11-17T16:00:00Z",
  },
  {
    taskId: "TK017",
    title: "Student Club Activity Reports",
    description: "Submit detailed activity reports for all student clubs and extracurricular activities. Include membership numbers, activities conducted, achievements, budget utilization, and plans for next semester.",
    assignedDate: "2025-11-20",
    deadline: "2025-11-27",
    target: "General",
    status: "PENDING",
    adminRemarks: "Include photos and testimonials where possible.",
    teacherRemarks: "",
    assignedTeacherIds: [15, 16, 10, 13],
    createdAt: "2025-11-20T15:00:00Z",
    updatedAt: "2025-11-20T15:00:00Z",
  },
  {
    taskId: "TK018",
    title: "Special Needs Student Support Plan",
    description: "Develop individualized education plans (IEPs) for students with special learning needs. Collaborate with the school counselor and special educator. Plans should include specific goals, accommodations, and progress monitoring methods.",
    assignedDate: "2025-11-12",
    deadline: "2025-11-22",
    target: "Grade 6 - A",
    status: "COMPLETED",
    adminRemarks: "Maintain confidentiality. Share plans only with relevant staff and parents.",
    teacherRemarks: "IEPs completed for 4 identified students. Parent meetings conducted. Support staff briefed. Implementation begins next week.",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 6 - A"] || [],
    createdAt: "2025-11-12T10:00:00Z",
    updatedAt: "2025-11-21T14:30:00Z",
    viewedAt: "2025-11-12T11:00:00Z",
    completedAt: "2025-11-21T14:30:00Z",
  },
  {
    taskId: "TK019",
    title: "Safety Drill Documentation",
    description: "Document the recent fire safety drill conducted. Include timing records, evacuation routes used, areas of concern identified, and recommendations for improvement. Prepare a brief for the management committee.",
    assignedDate: "2025-11-23",
    deadline: "2025-11-25",
    target: "General",
    status: "ONGOING",
    adminRemarks: "Urgent - Board meeting on 26th requires this report.",
    teacherRemarks: "Evacuation timing documented. Identified 2 bottleneck areas. Report 70% complete.",
    assignedTeacherIds: [10, 3, 7],
    createdAt: "2025-11-23T11:00:00Z",
    updatedAt: "2025-11-24T09:00:00Z",
    viewedAt: "2025-11-23T12:00:00Z",
  },
  {
    taskId: "TK020",
    title: "Eco Club Green Initiative",
    description: "Lead the Eco Club's green initiative for reducing plastic usage in school. Organize awareness campaigns, install water refilling stations, and create a sustainability report. Target: 50% reduction in single-use plastic by end of term.",
    assignedDate: "2025-11-10",
    deadline: "2025-12-20",
    target: "General",
    status: "ONGOING",
    adminRemarks: "Great initiative! Management has approved Rs. 25,000 for this project.",
    teacherRemarks: "Awareness posters displayed. Student volunteers recruited. Water stations ordered - delivery expected next week.",
    assignedTeacherIds: [17, 7, 13],
    createdAt: "2025-11-10T14:00:00Z",
    updatedAt: "2025-11-23T10:00:00Z",
    viewedAt: "2025-11-10T15:00:00Z",
  },
  {
    taskId: "TK021",
    title: "Monthly Newsletter Content",
    description: "Collect and compile content for the monthly school newsletter. Include student achievements, upcoming events, teacher spotlight, and educational tips for parents. Submit content with photos to the communications team.",
    assignedDate: "2025-11-22",
    deadline: "2025-11-28",
    target: "General",
    status: "PENDING",
    adminRemarks: "Theme this month: Gratitude and Thanksgiving.",
    teacherRemarks: "",
    assignedTeacherIds: [1, 5, 15],
    createdAt: "2025-11-22T10:00:00Z",
    updatedAt: "2025-11-22T10:00:00Z",
  },
  {
    taskId: "TK022",
    title: "Grade 9 Science Project Evaluation",
    description: "Evaluate and grade the science projects submitted by Grade 9 students. Use the provided rubric covering research quality, presentation, innovation, and practical application. Submit grades and feedback by deadline.",
    assignedDate: "2025-11-19",
    deadline: "2025-11-26",
    target: "Grade 9 - B",
    status: "PENDING",
    adminRemarks: "Be constructive in feedback. Top 3 projects will be displayed in the school exhibition.",
    teacherRemarks: "",
    assignedTeacherIds: CLASS_TEACHER_MAPPING["Grade 9 - B"] || [],
    createdAt: "2025-11-19T09:30:00Z",
    updatedAt: "2025-11-19T09:30:00Z",
  },
  {
    taskId: "TK023",
    title: "Hindi Diwas Celebration Report",
    description: "Submit a comprehensive report on the Hindi Diwas celebration held on 14th September. Include photos, list of activities, student participation data, winning entries from competitions, and feedback received.",
    assignedDate: "2025-09-20",
    deadline: "2025-09-30",
    target: "General",
    status: "COMPLETED",
    adminRemarks: "Include this in the annual report compilation.",
    teacherRemarks: "Report submitted with 50+ photos and complete documentation. Event was a great success with 100% student participation.",
    assignedTeacherIds: [8, 9],
    createdAt: "2025-09-20T08:00:00Z",
    updatedAt: "2025-09-28T17:00:00Z",
    viewedAt: "2025-09-20T09:00:00Z",
    completedAt: "2025-09-28T17:00:00Z",
  },
  {
    taskId: "TK024",
    title: "CBSE Circular Implementation",
    description: "Review the latest CBSE circular regarding revised assessment patterns and implement necessary changes in internal examination structure. Brief all subject teachers and update the examination schedule accordingly.",
    assignedDate: "2025-11-24",
    deadline: "2025-12-01",
    target: "General",
    status: "PENDING",
    adminRemarks: "This is mandatory compliance. Circular reference: CBSE/EXAM/2025-26/001",
    teacherRemarks: "",
    assignedTeacherIds: allTeacherIds,
    createdAt: "2025-11-24T10:00:00Z",
    updatedAt: "2025-11-24T10:00:00Z",
  },
  {
    taskId: "TK025",
    title: "Student Mental Health Workshop",
    description: "Organize a workshop on student mental health and stress management. Collaborate with the school counselor to develop content. Include interactive sessions, coping strategies, and information about available support resources.",
    assignedDate: "2025-11-18",
    deadline: "2025-12-05",
    target: "Grade 12 - B",
    status: "ONGOING",
    adminRemarks: "Very important given exam stress. Coordinate with Class 12 homeroom teachers.",
    teacherRemarks: "Workshop content prepared. Guest speaker confirmed. Date finalized for December 3rd.",
    assignedTeacherIds: [19, ...CLASS_TEACHER_MAPPING["Grade 12 - B"]],
    createdAt: "2025-11-18T11:00:00Z",
    updatedAt: "2025-11-24T14:00:00Z",
    viewedAt: "2025-11-18T12:00:00Z",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTeachersForTarget(target: TaskTarget): number[] {
  if (target === "General" || target === "GENERAL") {
    return allTeacherIds;
  }
  return CLASS_TEACHER_MAPPING[target] || [];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all tasks with optional filters
 */
export async function getMockTasks(filters?: TaskFilters): Promise<Task[]> {
  await simulateDelay(300);

  let results = [...MOCK_TASKS];

  // Filter by status
  if (filters?.status && filters.status !== "ALL") {
    results = results.filter((t) => t.status === filters.status);
  }

  // Filter by target (class)
  if (filters?.target && filters.target !== "ALL") {
    results = results.filter((t) => t.target === filters.target || t.target === "General");
  }

  // Filter by search query
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
    );
  }

  // Filter by teacher ID (for teacher-specific views)
  if (filters?.teacherId) {
    results = results.filter((t) => t.assignedTeacherIds.includes(filters.teacherId!));
  }

  // Sort by created date descending
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  console.log(`[MOCK TASKS] getTasks → ${results.length} tasks`);
  return results;
}

/**
 * Get a single task by ID
 */
export async function getMockTaskById(taskId: string): Promise<Task | null> {
  await simulateDelay(200);

  const task = MOCK_TASKS.find((t) => t.taskId === taskId);
  console.log(`[MOCK TASKS] getTaskById(${taskId}) → ${task ? "found" : "not found"}`);
  return task || null;
}

/**
 * Get task KPIs for dashboard
 */
export async function getMockTaskKPIs(): Promise<TaskKPIs> {
  await simulateDelay(200);

  const today = new Date().toISOString().split("T")[0];

  const totalTasks = MOCK_TASKS.length;
  const pendingTasks = MOCK_TASKS.filter((t) => t.status === "PENDING").length;
  const ongoingTasks = MOCK_TASKS.filter((t) => t.status === "ONGOING").length;
  const completedTasks = MOCK_TASKS.filter((t) => t.status === "COMPLETED").length;
  const tasksDueToday = MOCK_TASKS.filter((t) => t.deadline === today && t.status !== "COMPLETED").length;
  const overdueTask = MOCK_TASKS.filter(
    (t) => t.deadline < today && t.status !== "COMPLETED"
  ).length;

  const kpis: TaskKPIs = {
    totalTasks,
    pendingTasks,
    ongoingTasks,
    completedTasks,
    tasksDueToday,
    overdueTask,
  };

  console.log(`[MOCK TASKS] getKPIs →`, kpis);
  return kpis;
}

/**
 * Create a new task
 */
export async function createMockTask(request: CreateTaskRequest): Promise<Task> {
  await simulateDelay(300);

  const now = new Date().toISOString();
  const today = now.split("T")[0];
  const newTaskId = `TK${String(++taskIdCounter).padStart(3, "0")}`;

  const assignedTeacherIds = getTeachersForTarget(request.target);

  const newTask: Task = {
    taskId: newTaskId,
    title: request.title,
    description: request.description,
    assignedDate: today,
    deadline: request.deadline,
    target: request.target,
    status: "PENDING",
    adminRemarks: request.adminRemarks || "",
    teacherRemarks: "",
    assignedTeacherIds,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_TASKS.unshift(newTask);

  console.log(`[MOCK TASKS] createTask → ${newTaskId}`);
  return newTask;
}

/**
 * Update an existing task
 */
export async function updateMockTask(request: UpdateTaskRequest): Promise<Task> {
  await simulateDelay(300);

  const taskIndex = MOCK_TASKS.findIndex((t) => t.taskId === request.taskId);
  if (taskIndex === -1) {
    throw new Error(`Task ${request.taskId} not found`);
  }

  const task = MOCK_TASKS[taskIndex];
  const now = new Date().toISOString();

  if (request.status) {
    task.status = request.status;
    if (request.status === "COMPLETED") {
      task.completedAt = now;
    }
    if (request.status === "ONGOING" && !task.viewedAt) {
      task.viewedAt = now;
    }
  }

  if (request.teacherRemarks !== undefined) {
    task.teacherRemarks = request.teacherRemarks;
  }

  if (request.adminRemarks !== undefined) {
    task.adminRemarks = request.adminRemarks;
  }

  task.updatedAt = now;

  console.log(`[MOCK TASKS] updateTask(${request.taskId}) → updated`);
  return task;
}

/**
 * Get tasks for a specific teacher
 */
export async function getMockTasksForTeacher(teacherId: number): Promise<Task[]> {
  await simulateDelay(250);

  const tasks = MOCK_TASKS.filter((t) => t.assignedTeacherIds.includes(teacherId));

  console.log(`[MOCK TASKS] getTasksForTeacher(${teacherId}) → ${tasks.length} tasks`);
  return tasks;
}

/**
 * Get tasks for a specific class
 */
export async function getMockTasksForClass(classTarget: string): Promise<Task[]> {
  await simulateDelay(250);

  const tasks = MOCK_TASKS.filter((t) => t.target === classTarget || t.target === "General");

  console.log(`[MOCK TASKS] getTasksForClass(${classTarget}) → ${tasks.length} tasks`);
  return tasks;
}

/**
 * Get task statistics for a specific teacher
 */
export async function getMockTeacherTaskStats(teacherId: number): Promise<TeacherTaskStats> {
  await simulateDelay(200);

  const today = new Date().toISOString().split("T")[0];
  const teacherTasks = MOCK_TASKS.filter((t) => t.assignedTeacherIds.includes(teacherId));

  const stats: TeacherTaskStats = {
    totalAssigned: teacherTasks.length,
    completed: teacherTasks.filter((t) => t.status === "COMPLETED").length,
    pending: teacherTasks.filter((t) => t.status === "PENDING").length,
    ongoing: teacherTasks.filter((t) => t.status === "ONGOING").length,
    overdue: teacherTasks.filter((t) => t.deadline < today && t.status !== "COMPLETED").length,
  };

  console.log(`[MOCK TASKS] getTeacherTaskStats(${teacherId}) →`, stats);
  return stats;
}

/**
 * Get task status history (mocked timeline)
 */
export async function getMockTaskStatusHistory(taskId: string): Promise<TaskStatusHistory[]> {
  await simulateDelay(200);

  const task = MOCK_TASKS.find((t) => t.taskId === taskId);
  if (!task) {
    return [];
  }

  const history: TaskStatusHistory[] = [];

  // Task created/assigned
  history.push({
    timestamp: task.createdAt,
    status: "ASSIGNED",
    description: `Task assigned to ${task.target === "General" ? "all teachers" : `teachers of ${task.target}`}`,
    actor: "Admin",
  });

  // Task viewed (if applicable)
  if (task.viewedAt) {
    history.push({
      timestamp: task.viewedAt,
      status: "VIEWED",
      description: "Task viewed by assigned teacher(s)",
      actor: "Teacher",
    });
  }

  // Task in progress
  if (task.status === "ONGOING" || task.status === "COMPLETED") {
    const progressTime = task.viewedAt
      ? new Date(new Date(task.viewedAt).getTime() + 3600000).toISOString()
      : task.createdAt;
    history.push({
      timestamp: progressTime,
      status: "IN_PROGRESS",
      description: "Work started on the task",
      actor: "Teacher",
    });
  }

  // Teacher remarks added
  if (task.teacherRemarks) {
    history.push({
      timestamp: task.updatedAt,
      status: "REMARKS_ADDED",
      description: "Teacher added remarks/update",
      actor: "Teacher",
    });
  }

  // Task completed
  if (task.completedAt) {
    history.push({
      timestamp: task.completedAt,
      status: "COMPLETED",
      description: "Task marked as completed",
      actor: "Teacher",
    });
  }

  // Sort by timestamp
  history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  console.log(`[MOCK TASKS] getTaskStatusHistory(${taskId}) → ${history.length} events`);
  return history;
}

/**
 * Mark task as completed
 */
export async function markMockTaskCompleted(taskId: string): Promise<Task> {
  return updateMockTask({ taskId, status: "COMPLETED" });
}

/**
 * Add teacher remarks to a task
 */
export async function addMockTeacherRemarks(taskId: string, remarks: string): Promise<Task> {
  return updateMockTask({ taskId, teacherRemarks: remarks, status: "ONGOING" });
}

/**
 * Add admin remarks to a task
 */
export async function addMockAdminRemarks(taskId: string, remarks: string): Promise<Task> {
  return updateMockTask({ taskId, adminRemarks: remarks });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockTasksProvider = {
  getTasks: getMockTasks,
  getTaskById: getMockTaskById,
  getTaskKPIs: getMockTaskKPIs,
  createTask: createMockTask,
  updateTask: updateMockTask,
  getTasksForTeacher: getMockTasksForTeacher,
  getTasksForClass: getMockTasksForClass,
  getTeacherTaskStats: getMockTeacherTaskStats,
  getTaskStatusHistory: getMockTaskStatusHistory,
  markTaskCompleted: markMockTaskCompleted,
  addTeacherRemarks: addMockTeacherRemarks,
  addAdminRemarks: addMockAdminRemarks,
  AVAILABLE_TARGETS,
};
