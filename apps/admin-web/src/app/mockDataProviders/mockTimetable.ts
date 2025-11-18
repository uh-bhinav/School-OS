// ============================================================================
// MOCK TIMETABLE DATA PROVIDER
// ============================================================================
// Provides realistic mock timetable data for demo mode
// All CRUD operations work with in-memory storage
// ============================================================================

import type {
  TimetableEntry,
  TimetableUpsert,
  TimetableGrid,
  Period,
  KPISnapshot,
  ConflictCheckResponse,
  DayOfWeek,
} from "../services/timetable.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let entryIdCounter = 10000;
const mockTimetableEntries: TimetableEntry[] = [];

// Standard periods for all classes
const standardPeriods: Period[] = [
  { period_no: 1, start_time: "08:00", end_time: "08:45" },
  { period_no: 2, start_time: "08:50", end_time: "09:35" },
  { period_no: 3, start_time: "09:40", end_time: "10:25" },
  { period_no: 4, start_time: "10:45", end_time: "11:30" }, // After break
  { period_no: 5, start_time: "11:35", end_time: "12:20" },
  { period_no: 6, start_time: "12:25", end_time: "13:10" },
  { period_no: 7, start_time: "14:00", end_time: "14:45" }, // After lunch
  { period_no: 8, start_time: "14:50", end_time: "15:35" },
];

const weekDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI"];

const subjects = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Science" },
  { id: 3, name: "English" },
  { id: 4, name: "Social Studies" },
  { id: 5, name: "Hindi" },
  { id: 6, name: "Physical Education" },
  { id: 7, name: "Computer Science" },
  { id: 8, name: "Arts" },
];

const teachers = [
  { id: 1, name: "Mr. Sharma" },
  { id: 2, name: "Mrs. Gupta" },
  { id: 3, name: "Ms. Patel" },
  { id: 4, name: "Mr. Singh" },
  { id: 5, name: "Mrs. Verma" },
  { id: 6, name: "Mr. Kumar" },
  { id: 7, name: "Ms. Reddy" },
  { id: 8, name: "Mr. Mehta" },
];

const rooms = [
  { id: 1, name: "Room 101" },
  { id: 2, name: "Room 102" },
  { id: 3, name: "Room 103" },
  { id: 4, name: "Lab 1" },
  { id: 5, name: "Lab 2" },
  { id: 6, name: "Sports Hall" },
];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockTimetable() {
  if (mockTimetableEntries.length > 0) return;

  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sections = ["A", "B", "C"];

  // Get current week's Monday
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const weekStart = monday.toISOString().split("T")[0];

  classIds.forEach((classId) => {
    sections.forEach((section) => {
      weekDays.forEach((day, dayIndex) => {
        standardPeriods.forEach((period) => {
          // Skip lunch period (period 6-7 transition)
          if (period.period_no === 7) return;

          // Select subject cyclically
          const subjectIdx = (dayIndex * standardPeriods.length + period.period_no - 1) % subjects.length;
          const subject = subjects[subjectIdx];

          // Assign teacher based on subject
          const teacherIdx = subjectIdx % teachers.length;
          const teacher = teachers[teacherIdx];

          // Assign room
          const roomIdx = (classId + dayIndex + period.period_no) % rooms.length;
          const room = rooms[roomIdx];

          mockTimetableEntries.push({
            id: ++entryIdCounter,
            academic_year_id: 2025,
            school_id: 1,
            class_id: classId,
            section,
            week_start: weekStart,
            day,
            period_no: period.period_no,
            subject_id: subject.id,
            subject_name: subject.name,
            teacher_id: teacher.id,
            teacher_name: teacher.name,
            room_id: room.id,
            room_name: room.name,
            is_published: true,
            is_editable: true,
          });
        });
      });
    });
  });

  console.log(`[MOCK TIMETABLE] Initialized ${mockTimetableEntries.length} entries`);
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockTimetableGrid(params: {
  academic_year_id: number;
  class_id: number;
  section: string;
  week_start: string;
}): Promise<TimetableGrid> {
  initializeMockTimetable();
  await simulateDelay();

  const entries = mockTimetableEntries.filter(
    (e) =>
      e.academic_year_id === params.academic_year_id &&
      e.class_id === params.class_id &&
      e.section === params.section &&
      e.week_start === params.week_start
  );

  console.log(`[MOCK TIMETABLE] getTimetableGrid → ${entries.length} entries`);

  return {
    academic_year_id: params.academic_year_id,
    class_id: params.class_id,
    section: params.section,
    week_start: params.week_start,
    periods: standardPeriods,
    entries,
    conflicts: [],
  };
}

export async function getMockTimetableEntries(classId: number): Promise<TimetableEntry[]> {
  initializeMockTimetable();
  await simulateDelay();

  const entries = mockTimetableEntries.filter((e) => e.class_id === classId);
  console.log(`[MOCK TIMETABLE] getTimetableEntries(${classId}) → ${entries.length} entries`);
  return entries;
}

export async function createMockEntry(payload: TimetableUpsert): Promise<TimetableEntry> {
  initializeMockTimetable();
  await simulateDelay(250);

  const subject = subjects.find((s) => s.id === payload.subject_id);
  const teacher = teachers.find((t) => t.id === payload.teacher_id);
  const room = payload.room_id ? rooms.find((r) => r.id === payload.room_id) : null;

  const newEntry: TimetableEntry = {
    id: ++entryIdCounter,
    academic_year_id: payload.academic_year_id,
    school_id: 1,
    class_id: payload.class_id,
    section: payload.section,
    week_start: payload.week_start,
    day: payload.day,
    period_no: payload.period_no,
    subject_id: payload.subject_id,
    subject_name: subject?.name || "Unknown Subject",
    teacher_id: payload.teacher_id,
    teacher_name: teacher?.name || "Unknown Teacher",
    room_id: room?.id || null,
    room_name: room?.name || null,
    is_published: false,
    is_editable: true,
  };

  mockTimetableEntries.push(newEntry);
  console.log(`[MOCK TIMETABLE] Created entry #${newEntry.id}`);
  return newEntry;
}

export async function updateMockEntry(id: number, patch: Partial<TimetableUpsert>): Promise<TimetableEntry> {
  initializeMockTimetable();
  await simulateDelay(250);

  const entry = mockTimetableEntries.find((e) => e.id === id);
  if (!entry) throw new Error(`Timetable entry #${id} not found`);

  if (patch.subject_id !== undefined) {
    const subject = subjects.find((s) => s.id === patch.subject_id);
    entry.subject_id = patch.subject_id;
    entry.subject_name = subject?.name || "Unknown Subject";
  }

  if (patch.teacher_id !== undefined) {
    const teacher = teachers.find((t) => t.id === patch.teacher_id);
    entry.teacher_id = patch.teacher_id;
    entry.teacher_name = teacher?.name || "Unknown Teacher";
  }

  if (patch.room_id !== undefined) {
    const room = patch.room_id ? rooms.find((r) => r.id === patch.room_id) : null;
    entry.room_id = room?.id || null;
    entry.room_name = room?.name || null;
  }

  if (patch.day) entry.day = patch.day;
  if (patch.period_no) entry.period_no = patch.period_no;

  console.log(`[MOCK TIMETABLE] Updated entry #${id}`);
  return entry;
}

export async function deleteMockEntry(id: number): Promise<void> {
  initializeMockTimetable();
  await simulateDelay(200);

  const index = mockTimetableEntries.findIndex((e) => e.id === id);
  if (index === -1) throw new Error(`Timetable entry #${id} not found`);

  mockTimetableEntries.splice(index, 1);
  console.log(`[MOCK TIMETABLE] Deleted entry #${id}`);
}

// ============================================================================
// OPERATIONS
// ============================================================================

export async function swapMockEntries(payload: { a_id: number; b_id: number }): Promise<{ ok: true }> {
  initializeMockTimetable();
  await simulateDelay(300);

  const entryA = mockTimetableEntries.find((e) => e.id === payload.a_id);
  const entryB = mockTimetableEntries.find((e) => e.id === payload.b_id);

  if (!entryA || !entryB) {
    throw new Error("One or both entries not found");
  }

  // Swap day and period
  [entryA.day, entryB.day] = [entryB.day, entryA.day];
  [entryA.period_no, entryB.period_no] = [entryB.period_no, entryA.period_no];

  console.log(`[MOCK TIMETABLE] Swapped entries #${payload.a_id} and #${payload.b_id}`);
  return { ok: true };
}

export async function checkMockConflict(payload: TimetableUpsert): Promise<ConflictCheckResponse> {
  initializeMockTimetable();
  await simulateDelay(150);

  const conflicts = mockTimetableEntries.filter(
    (e) =>
      e.week_start === payload.week_start &&
      e.day === payload.day &&
      e.period_no === payload.period_no &&
      (e.teacher_id === payload.teacher_id || e.room_id === payload.room_id)
  );

  const conflictMessages = conflicts.map((c) => ({
    type: c.teacher_id === payload.teacher_id ? "TEACHER" : "ROOM",
    message: c.teacher_id === payload.teacher_id
      ? `Teacher ${c.teacher_name} is already scheduled`
      : `Room ${c.room_name} is already booked`,
  }));

  console.log(`[MOCK TIMETABLE] checkConflict → ${conflictMessages.length} conflicts`);
  return {
    ok: conflictMessages.length === 0,
    conflicts: conflictMessages,
  };
}

export async function generateMockTimetable(payload: {
  academic_year_id: number;
  class_id: number;
  section: string;
  week_start?: string;
}): Promise<{ entries: TimetableEntry[] }> {
  initializeMockTimetable();
  await simulateDelay(1000); // Longer delay for generation

  // Use provided week_start or default to current week's Monday
  let weekStart: string;
  if (payload.week_start) {
    weekStart = payload.week_start;
  } else {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    weekStart = monday.toISOString().split("T")[0];
  }

  // Remove existing entries for this class/section/week to avoid duplicates
  const existingIndices: number[] = [];
  mockTimetableEntries.forEach((entry, index) => {
    if (
      entry.academic_year_id === payload.academic_year_id &&
      entry.class_id === payload.class_id &&
      entry.section === payload.section &&
      entry.week_start === weekStart
    ) {
      existingIndices.push(index);
    }
  });

  // Remove in reverse order to maintain indices
  for (let i = existingIndices.length - 1; i >= 0; i--) {
    mockTimetableEntries.splice(existingIndices[i], 1);
  }

  const newEntries: TimetableEntry[] = [];

  weekDays.forEach((day, dayIndex) => {
    standardPeriods.forEach((period) => {
      // Generate for all periods including period 7
      const subjectIdx = (dayIndex * standardPeriods.length + period.period_no - 1) % subjects.length;
      const subject = subjects[subjectIdx];
      const teacherIdx = subjectIdx % teachers.length;
      const teacher = teachers[teacherIdx];
      const roomIdx = (payload.class_id + dayIndex + period.period_no) % rooms.length;
      const room = rooms[roomIdx];

      const entry: TimetableEntry = {
        id: ++entryIdCounter,
        academic_year_id: payload.academic_year_id,
        school_id: 1,
        class_id: payload.class_id,
        section: payload.section,
        week_start: weekStart,
        day,
        period_no: period.period_no,
        subject_id: subject.id,
        subject_name: subject.name,
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        room_id: room.id,
        room_name: room.name,
        is_published: false,
        is_editable: true,
      };

      mockTimetableEntries.push(entry);
      newEntries.push(entry);
    });
  });

  console.log(`[MOCK TIMETABLE] Generated ${newEntries.length} entries for week ${weekStart}`);
  return { entries: newEntries };
}

export async function publishMockWeek(payload: {
  academic_year_id: number;
  class_id: number;
  section: string;
  week_start: string;
  publish: boolean;
}): Promise<{ is_published: boolean }> {
  initializeMockTimetable();
  await simulateDelay(200);

  const entries = mockTimetableEntries.filter(
    (e) =>
      e.academic_year_id === payload.academic_year_id &&
      e.class_id === payload.class_id &&
      e.section === payload.section &&
      e.week_start === payload.week_start
  );

  entries.forEach((e) => {
    e.is_published = payload.publish;
  });

  console.log(`[MOCK TIMETABLE] ${payload.publish ? "Published" : "Unpublished"} ${entries.length} entries`);
  return { is_published: payload.publish };
}

// ============================================================================
// KPIs & ANALYTICS
// ============================================================================

export async function getMockTimetableKPIs(params: {
  academic_year_id: number;
  class_id: number;
  section: string;
  week_start: string;
}): Promise<KPISnapshot> {
  initializeMockTimetable();
  await simulateDelay(200);

  const entries = mockTimetableEntries.filter(
    (e) =>
      e.academic_year_id === params.academic_year_id &&
      e.class_id === params.class_id &&
      e.section === params.section &&
      e.week_start === params.week_start
  );

  // Total slots = days * periods (all 8 periods, no exclusions)
  const totalSlots = weekDays.length * standardPeriods.length; // 5 days * 8 periods = 40
  const filledSlots = entries.length;
  const coveragePct = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100 * 10) / 10 : 0;

  const freePeriods = totalSlots - filledSlots;

  // Check conflicts (simplified)
  const teacherSlots = new Map<string, number>();
  const roomSlots = new Map<string, number>();
  let conflictsCount = 0;

  entries.forEach((e) => {
    const teacherKey = `${e.teacher_id}-${e.day}-${e.period_no}`;
    const roomKey = `${e.room_id}-${e.day}-${e.period_no}`;

    // Count teacher conflicts
    if (teacherSlots.has(teacherKey)) {
      conflictsCount++;
    }
    teacherSlots.set(teacherKey, (teacherSlots.get(teacherKey) || 0) + 1);

    // Count room conflicts
    if (e.room_id && roomSlots.has(roomKey)) {
      conflictsCount++;
    }
    if (e.room_id) {
      roomSlots.set(roomKey, (roomSlots.get(roomKey) || 0) + 1);
    }
  });

  // Room utilization: unique rooms used / total available rooms
  const uniqueRoomsUsed = new Set(entries.filter(e => e.room_id).map(e => e.room_id)).size;
  const roomUtilPct = rooms.length > 0 ? Math.round((uniqueRoomsUsed / rooms.length) * 100 * 10) / 10 : 0;

  const kpi: KPISnapshot = {
    coverage_pct: coveragePct,
    conflicts_count: conflictsCount,
    free_periods: freePeriods,
    room_util_pct: roomUtilPct,
  };

  console.log(`[MOCK TIMETABLE] getKPIs → ${JSON.stringify(kpi)}`);
  return kpi;
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
export const mockTimetableProvider = {
  getTimetableGrid: getMockTimetableGrid,
  getTimetableEntries: getMockTimetableEntries,
  createEntry: createMockEntry,
  updateEntry: updateMockEntry,
  deleteEntry: deleteMockEntry,
  swapEntries: swapMockEntries,
  checkConflict: checkMockConflict,
  generateTimetable: generateMockTimetable,
  publishWeek: publishMockWeek,
  getTimetableKPIs: getMockTimetableKPIs,
};
