// ============================================================================
// MOCK PROXY (SUBSTITUTE TEACHER) DATA PROVIDER
// ============================================================================
// Provides mock data for teacher absence and substitute teacher assignment
// Used by the proxy assignment feature in timetable management
// ============================================================================

import type { DayOfWeek } from "../services/timetable.schema";
import { MOCK_TEACHERS } from "./mockTeachers";

// ============================================================================
// TYPES
// ============================================================================

export interface AbsentTeacher {
  teacherId: number;
  teacherName: string;
  subject: string;
  subjectId: number;
  classId: number;
  section: string;
  date: string; // ISO date string
  day: DayOfWeek;
  periodNo: number;
  periodTime: string;
  reason: string;
  entryId: number;
}

export interface AvailableTeacher {
  teacherId: number;
  teacherName: string;
  employeeCode: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  primarySubject: string;
  isFreeThisPeriod: boolean;
  currentLoad: number; // Number of classes today
  maxLoad: number; // Max classes per day
}

export interface ProxyAssignmentRequest {
  absentTeacherId: number;
  substituteTeacherId: number;
  classId: number;
  section: string;
  date: string;
  day: DayOfWeek;
  periodNo: number;
  entryId: number;
  reason?: string;
}

export interface ProxyAssignmentResponse {
  success: boolean;
  assignmentId: string;
  message: string;
}

// ============================================================================
// MOCK DATA - ABSENT TEACHERS
// ============================================================================

// Define which teachers are absent on specific days
// Using teacher IDs from mockTimetable.ts (1-10 are used in timetable)
const ABSENCE_CONFIG: Record<DayOfWeek, { teacherId: number; reason: string }[]> = {
  MON: [
    { teacherId: 3, reason: "Medical Leave" }, // Ms. Patel (English in timetable)
  ],
  TUE: [
    { teacherId: 7, reason: "Personal Emergency" }, // Ms. Reddy (Computer Science)
  ],
  WED: [
    { teacherId: 2, reason: "Training Workshop" }, // Mrs. Gupta (Science)
  ],
  THU: [
    { teacherId: 1, reason: "Sick Leave" }, // Mr. Sharma (Mathematics)
  ],
  FRI: [
    { teacherId: 4, reason: "Family Function" }, // Mr. Singh (Social Studies)
  ],
  SAT: [],
  SUN: [],
};

// Map teacher IDs to their names in the timetable context
const TIMETABLE_TEACHER_NAMES: Record<number, { name: string; subject: string; subjectId: number }> = {
  1: { name: "Mr. Sharma", subject: "Mathematics", subjectId: 1 },
  2: { name: "Mrs. Gupta", subject: "Science", subjectId: 2 },
  3: { name: "Ms. Patel", subject: "English", subjectId: 3 },
  4: { name: "Mr. Singh", subject: "Social Studies", subjectId: 4 },
  5: { name: "Mrs. Verma", subject: "Hindi", subjectId: 5 },
  6: { name: "Mr. Kumar", subject: "Physical Education", subjectId: 6 },
  7: { name: "Ms. Reddy", subject: "Computer Science", subjectId: 7 },
  8: { name: "Mr. Mehta", subject: "Arts & Crafts", subjectId: 8 },
  9: { name: "Mrs. Desai", subject: "Music", subjectId: 9 },
  10: { name: "Mr. Joshi", subject: "Sanskrit", subjectId: 10 },
};

// Period times mapping
const PERIOD_TIMES: Record<number, string> = {
  1: "08:00–08:45",
  2: "08:50–09:35",
  3: "09:40–10:25",
  4: "10:45–11:30",
  5: "11:35–12:20",
  6: "12:25–13:10",
  7: "14:00–14:45",
  8: "14:50–15:35",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDayFromDate(dateStr: string): DayOfWeek {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();
  const days: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[dayIndex];
}

function getDateForDay(weekStart: string, targetDay: DayOfWeek): string {
  const dayOffsets: Record<DayOfWeek, number> = {
    MON: 0,
    TUE: 1,
    WED: 2,
    THU: 3,
    FRI: 4,
    SAT: 5,
    SUN: 6,
  };

  const startDate = new Date(weekStart);
  startDate.setDate(startDate.getDate() + dayOffsets[targetDay]);
  return startDate.toISOString().split("T")[0];
}

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

/**
 * Get absent teachers for a specific class and date
 * This checks the timetable entries and returns teachers who are marked as absent
 */
export async function getMockAbsentTeachers(params: {
  classId: number;
  section: string;
  date: string;
  weekStart: string;
}): Promise<AbsentTeacher[]> {
  await simulateDelay(200);

  const { classId, section, date, weekStart } = params;
  const day = getDayFromDate(date);

  // Get absences for this day
  const dayAbsences = ABSENCE_CONFIG[day] || [];

  if (dayAbsences.length === 0) {
    console.log(`[MOCK PROXY] No absences for ${day}`);
    return [];
  }

  // We need to check which of these absent teachers have classes for this class/section
  // For demo purposes, we'll simulate based on the mock timetable structure
  const absentTeachers: AbsentTeacher[] = [];

  // Simplified: Check if any absent teacher has a period for this class
  // In real implementation, this would query the timetable entries

  // Mock timetable assignment (based on mockTimetable.ts structure)
  // English (teacher 3) has Period 3 on MON for all classes
  const mockSchedule: Record<DayOfWeek, { teacherId: number; periodNo: number }[]> = {
    MON: [
      { teacherId: 1, periodNo: 1 },
      { teacherId: 1, periodNo: 4 },
      { teacherId: 2, periodNo: 2 },
      { teacherId: 2, periodNo: 6 },
      { teacherId: 3, periodNo: 3 }, // English - Ms. Patel
      { teacherId: 4, periodNo: 5 },
      { teacherId: 5, periodNo: 7 },
      { teacherId: 6, periodNo: 8 },
    ],
    TUE: [
      { teacherId: 1, periodNo: 2 },
      { teacherId: 2, periodNo: 1 },
      { teacherId: 3, periodNo: 3 },
      { teacherId: 4, periodNo: 4 },
      { teacherId: 7, periodNo: 5 }, // Computer Science - Ms. Reddy
      { teacherId: 7, periodNo: 6 },
      { teacherId: 8, periodNo: 8 },
      { teacherId: 10, periodNo: 7 },
    ],
    WED: [
      { teacherId: 1, periodNo: 1 },
      { teacherId: 1, periodNo: 6 },
      { teacherId: 2, periodNo: 3 }, // Science - Mrs. Gupta
      { teacherId: 2, periodNo: 4 },
      { teacherId: 3, periodNo: 2 },
      { teacherId: 4, periodNo: 5 },
      { teacherId: 5, periodNo: 7 },
      { teacherId: 9, periodNo: 8 },
    ],
    THU: [
      { teacherId: 1, periodNo: 2 }, // Mathematics - Mr. Sharma
      { teacherId: 1, periodNo: 6 },
      { teacherId: 2, periodNo: 4 },
      { teacherId: 3, periodNo: 1 },
      { teacherId: 3, periodNo: 5 },
      { teacherId: 4, periodNo: 3 },
      { teacherId: 6, periodNo: 7 },
      { teacherId: 10, periodNo: 8 },
    ],
    FRI: [
      { teacherId: 1, periodNo: 3 },
      { teacherId: 2, periodNo: 1 },
      { teacherId: 2, periodNo: 6 },
      { teacherId: 3, periodNo: 2 },
      { teacherId: 4, periodNo: 4 }, // Social Studies - Mr. Singh
      { teacherId: 4, periodNo: 5 },
      { teacherId: 5, periodNo: 7 },
      { teacherId: 8, periodNo: 8 },
    ],
    SAT: [
      { teacherId: 1, periodNo: 1 },
      { teacherId: 1, periodNo: 6 },
      { teacherId: 2, periodNo: 3 },
      { teacherId: 3, periodNo: 2 },
      { teacherId: 4, periodNo: 5 },
      { teacherId: 6, periodNo: 7 },
      { teacherId: 7, periodNo: 4 },
      { teacherId: 9, periodNo: 8 },
    ],
    SUN: [],
  };

  const daySchedule = mockSchedule[day] || [];

  dayAbsences.forEach((absence) => {
    // Find periods where this teacher is scheduled
    const teacherPeriods = daySchedule.filter((s) => s.teacherId === absence.teacherId);
    const teacherInfo = TIMETABLE_TEACHER_NAMES[absence.teacherId];

    if (teacherInfo) {
      teacherPeriods.forEach((period) => {
        absentTeachers.push({
          teacherId: absence.teacherId,
          teacherName: teacherInfo.name,
          subject: teacherInfo.subject,
          subjectId: teacherInfo.subjectId,
          classId,
          section,
          date: getDateForDay(weekStart, day),
          day,
          periodNo: period.periodNo,
          periodTime: PERIOD_TIMES[period.periodNo] || "",
          reason: absence.reason,
          entryId: classId * 1000 + section.charCodeAt(0) * 100 + period.periodNo, // Generate unique entry ID
        });
      });
    }
  });

  console.log(`[MOCK PROXY] getAbsentTeachers for class ${classId}${section} on ${day} → ${absentTeachers.length} absences`);
  return absentTeachers;
}

/**
 * Get available teachers who can substitute for a specific period
 */
export async function getMockAvailableTeachers(params: {
  periodNo: number;
  date: string;
  day: DayOfWeek;
  classId: number;
  section: string;
  excludeTeacherId?: number; // The absent teacher to exclude
}): Promise<AvailableTeacher[]> {
  await simulateDelay(250);

  const { periodNo, day, excludeTeacherId } = params;

  // Get all teachers from mock data
  const allTeachers = MOCK_TEACHERS;

  // Determine which teachers are busy during this period
  // Based on simplified mock schedule
  const busyTeacherIds: Set<number> = new Set();

  // Simplified: Some teachers are always busy at certain periods
  // In real implementation, this would check actual timetable entries
  const busySchedule: Record<DayOfWeek, Record<number, number[]>> = {
    MON: { 1: [1, 4], 2: [2, 6], 3: [3], 4: [5], 5: [7], 6: [8] },
    TUE: { 1: [2], 2: [1], 3: [3], 4: [4], 5: [7], 6: [7], 7: [5, 6], 8: [8], 10: [7] },
    WED: { 1: [1, 6], 2: [3, 4], 3: [2], 4: [5], 5: [7], 9: [8] },
    THU: { 1: [2, 6], 2: [4], 3: [1, 5], 4: [3], 6: [7], 10: [8] },
    FRI: { 1: [3], 2: [1, 6], 3: [2], 4: [4, 5], 5: [7], 8: [8] },
    SAT: { 1: [1, 6], 2: [3], 3: [2], 4: [5], 6: [7], 7: [4], 9: [8] },
    SUN: {},
  };

  const dayBusySchedule = busySchedule[day] || {};
  Object.entries(dayBusySchedule).forEach(([teacherIdStr, periods]) => {
    const teacherId = parseInt(teacherIdStr);
    if (periods.includes(periodNo)) {
      busyTeacherIds.add(teacherId);
    }
  });

  // Map to available teachers
  const availableTeachers: AvailableTeacher[] = allTeachers
    .filter((t) => t.is_active && t.teacher_id !== excludeTeacherId)
    .map((teacher) => {
      const isFree = !busyTeacherIds.has(teacher.teacher_id);
      const experienceYears = Math.floor(
        (new Date().getTime() - new Date(teacher.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );

      // Calculate current load (number of classes the teacher has today)
      let currentLoad = 0;
      const teacherBusyPeriods = dayBusySchedule[teacher.teacher_id] || [];
      currentLoad = teacherBusyPeriods.length;

      return {
        teacherId: teacher.teacher_id,
        teacherName: `${teacher.first_name} ${teacher.last_name}`,
        employeeCode: teacher.employee_id,
        email: teacher.email,
        phone: teacher.phone,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experienceYears,
        primarySubject: teacher.specialization,
        isFreeThisPeriod: isFree,
        currentLoad,
        maxLoad: 6, // Default max 6 classes per day
      };
    })
    // Sort: free teachers first, then by experience
    .sort((a, b) => {
      if (a.isFreeThisPeriod !== b.isFreeThisPeriod) {
        return a.isFreeThisPeriod ? -1 : 1;
      }
      return b.experienceYears - a.experienceYears;
    });

  console.log(`[MOCK PROXY] getAvailableTeachers for period ${periodNo} on ${day} → ${availableTeachers.filter(t => t.isFreeThisPeriod).length} free, ${availableTeachers.length} total`);
  return availableTeachers;
}

/**
 * Assign a substitute teacher
 */
export async function assignMockProxy(
  request: ProxyAssignmentRequest
): Promise<ProxyAssignmentResponse> {
  await simulateDelay(300);

  const assignmentId = `proxy-${request.entryId}-${Date.now()}`;

  console.log(`[MOCK PROXY] Assigned proxy: Teacher ${request.substituteTeacherId} replacing Teacher ${request.absentTeacherId} for Class ${request.classId}${request.section}, Period ${request.periodNo}`);

  return {
    success: true,
    assignmentId,
    message: "Substitute teacher assigned successfully",
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockProxyProvider = {
  getAbsentTeachers: getMockAbsentTeachers,
  getAvailableTeachers: getMockAvailableTeachers,
  assignProxy: assignMockProxy,
};
