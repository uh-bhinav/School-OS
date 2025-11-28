// ============================================================================
// MOCK CLASS TIMETABLE DATA PROVIDER
// ============================================================================

import type { ClassTimetableSlot } from "../services/classes.schema";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECTS = [
  { id: 1, name: "English", code: "ENG" },
  { id: 2, name: "Mathematics", code: "MATH" },
  { id: 3, name: "Science", code: "SCI" },
  { id: 4, name: "Social Studies", code: "SST" },
  { id: 5, name: "Hindi", code: "HIN" },
  { id: 6, name: "Physical Education", code: "PE" },
  { id: 7, name: "Computer Science", code: "CS" },
  { id: 8, name: "Art", code: "ART" },
];

const TEACHERS = [
  { id: 1, name: "Priya Sharma" },
  { id: 2, name: "Anjali Patel" },
  { id: 3, name: "Rajesh Singh" },
  { id: 4, name: "Kavita Verma" },
  { id: 5, name: "Amit Gupta" },
  { id: 6, name: "Sneha Reddy" },
  { id: 7, name: "Fatima Khan" },
  { id: 8, name: "Vikram Desai" },
];

const TIME_SLOTS = [
  { period: 1, start: "08:00", end: "08:45" },
  { period: 2, start: "08:50", end: "09:35" },
  { period: 3, start: "09:40", end: "10:25" },
  { period: 4, start: "10:45", end: "11:30" }, // After break
  { period: 5, start: "11:35", end: "12:20" },
  { period: 6, start: "12:25", end: "13:10" },
];

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate timetable for a class
 */
function generateClassTimetable(classId: number): ClassTimetableSlot[] {
  const timetable: ClassTimetableSlot[] = [];
  let slotId = classId * 1000;

  DAYS.forEach((day, dayIndex) => {
    TIME_SLOTS.forEach((timeSlot) => {
      // Randomly assign subjects and teachers
      const subjectIndex = (dayIndex + timeSlot.period + classId) % SUBJECTS.length;
      const teacherIndex = (dayIndex + timeSlot.period + classId) % TEACHERS.length;
      const subject = SUBJECTS[subjectIndex];
      const teacher = TEACHERS[teacherIndex];
      const roomId = ((classId - 1) % 8) + 1;

      timetable.push({
        slot_id: slotId++,
        period: timeSlot.period,
        day,
        subject_id: subject.id,
        subject_name: subject.name,
        subject_code: subject.code,
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        room_id: roomId,
        room_name: `Room ${100 + roomId}`,
        start_time: timeSlot.start,
        end_time: timeSlot.end,
      });
    });
  });

  return timetable;
}

// Cache timetables
const timetableCache = new Map<number, ClassTimetableSlot[]>();

/**
 * Get class timetable
 */
export async function getClassTimetable(classId: number): Promise<ClassTimetableSlot[]> {
  await simulateDelay(300);

  if (!timetableCache.has(classId)) {
    const timetable = generateClassTimetable(classId);
    timetableCache.set(classId, timetable);
  }

  const timetable = timetableCache.get(classId)!;
  console.log(`[MOCK CLASS TIMETABLE] getClassTimetable(${classId}) → ${timetable.length} slots`);
  return timetable;
}

export const mockClassTimetableProvider = {
  getClassTimetable,
};
