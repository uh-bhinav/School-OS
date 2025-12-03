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

// Standard periods for all classes (with breaks)
const standardPeriods: Period[] = [
  { period_no: 1, start_time: "08:00", end_time: "08:45" },
  { period_no: 2, start_time: "08:50", end_time: "09:35" },
  { period_no: 3, start_time: "09:40", end_time: "10:25" },
  // SHORT BREAK: 10:25 - 10:45 (20 mins)
  { period_no: 4, start_time: "10:45", end_time: "11:30" },
  { period_no: 5, start_time: "11:35", end_time: "12:20" },
  { period_no: 6, start_time: "12:25", end_time: "13:10" },
  // LUNCH BREAK: 13:10 - 14:00 (50 mins)
  { period_no: 7, start_time: "14:00", end_time: "14:45" },
  { period_no: 8, start_time: "14:50", end_time: "15:35" },
];

const weekDays: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Core subjects (taught before lunch, high priority)
const coreSubjects = [
  { id: 1, name: "Mathematics", category: "core" },
  { id: 2, name: "Science", category: "core" },
  { id: 3, name: "English", category: "core" },
  { id: 4, name: "Social Studies", category: "core" },
];

// Secondary subjects (can be anywhere, but preferably afternoon)
const secondarySubjects = [
  { id: 5, name: "Hindi", category: "language" },
  { id: 6, name: "Physical Education", category: "activity" },
  { id: 7, name: "Computer Science", category: "lab" },
  { id: 8, name: "Arts & Crafts", category: "activity" },
  { id: 9, name: "Music", category: "activity" },
  { id: 10, name: "Sanskrit", category: "language" },
];

const allSubjects = [...coreSubjects, ...secondarySubjects];

const teachers = [
  { id: 1, name: "Mr. Sharma" },
  { id: 2, name: "Mrs. Gupta" },
  { id: 3, name: "Ms. Patel" },
  { id: 4, name: "Mr. Singh" },
  { id: 5, name: "Mrs. Verma" },
  { id: 6, name: "Mr. Kumar" },
  { id: 7, name: "Ms. Reddy" },
  { id: 8, name: "Mr. Mehta" },
  { id: 9, name: "Mrs. Desai" },
  { id: 10, name: "Mr. Joshi" },
];

const rooms = [
  { id: 1, name: "Room 101" },
  { id: 2, name: "Room 102" },
  { id: 3, name: "Room 103" },
  { id: 4, name: "Lab 1" },
  { id: 5, name: "Lab 2" },
  { id: 6, name: "Sports Hall" },
  { id: 7, name: "Music Room" },
  { id: 8, name: "Art Studio" },
];

/**
 * Generate a realistic timetable schedule with proper subject distribution
 * Rules:
 * - Core subjects (Math, Science, English, Social) in periods 1-6 (before lunch)
 * - Each core subject appears daily
 * - One core subject has 2 periods on one day (block period)
 * - Languages and activities (PE, Music, Arts) after lunch (periods 7-8)
 * - Computer Science lab on one day (block period)
 */
function generateRealisticSchedule(
  classId: number,
  section: string,
  weekStart: string,
  academicYearId: number
): TimetableEntry[] {
  const entries: TimetableEntry[] = [];

  // Define weekly schedule template (what subject goes where)
  const weeklySchedule: Record<DayOfWeek, { period: number; subjectId: number; teacherId: number; roomId?: number }[]> = {
    MON: [
      { period: 1, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      { period: 2, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      { period: 3, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      // SHORT BREAK
      { period: 4, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics (double period)
      { period: 5, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies
      { period: 6, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      // LUNCH BREAK
      { period: 7, subjectId: 5, teacherId: 5, roomId: 2 }, // Hindi
      { period: 8, subjectId: 6, teacherId: 6, roomId: 6 }, // PE
    ],
    TUE: [
      { period: 1, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      { period: 2, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      { period: 3, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      // SHORT BREAK
      { period: 4, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies
      { period: 5, subjectId: 7, teacherId: 7, roomId: 4 }, // Computer Science (block period)
      { period: 6, subjectId: 7, teacherId: 7, roomId: 4 }, // Computer Science (block period)
      // LUNCH BREAK
      { period: 7, subjectId: 10, teacherId: 10, roomId: 2 }, // Sanskrit
      { period: 8, subjectId: 8, teacherId: 8, roomId: 8 }, // Arts & Crafts
    ],
    WED: [
      { period: 1, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      { period: 2, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      { period: 3, subjectId: 2, teacherId: 2, roomId: 1 }, // Science (double period)
      // SHORT BREAK
      { period: 4, subjectId: 2, teacherId: 2, roomId: 5 }, // Science Lab (block period)
      { period: 5, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies
      { period: 6, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      // LUNCH BREAK
      { period: 7, subjectId: 5, teacherId: 5, roomId: 2 }, // Hindi
      { period: 8, subjectId: 9, teacherId: 9, roomId: 7 }, // Music
    ],
    THU: [
      { period: 1, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      { period: 2, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      { period: 3, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies
      // SHORT BREAK
      { period: 4, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      { period: 5, subjectId: 3, teacherId: 3, roomId: 1 }, // English (double period)
      { period: 6, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      // LUNCH BREAK
      { period: 7, subjectId: 6, teacherId: 6, roomId: 6 }, // PE
      { period: 8, subjectId: 10, teacherId: 10, roomId: 2 }, // Sanskrit
    ],
    FRI: [
      { period: 1, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      { period: 2, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      { period: 3, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      // SHORT BREAK
      { period: 4, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies (double period)
      { period: 5, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies (double period)
      { period: 6, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      // LUNCH BREAK
      { period: 7, subjectId: 5, teacherId: 5, roomId: 2 }, // Hindi
      { period: 8, subjectId: 8, teacherId: 8, roomId: 8 }, // Arts & Crafts
    ],
    SAT: [
      { period: 1, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      { period: 2, subjectId: 3, teacherId: 3, roomId: 1 }, // English
      { period: 3, subjectId: 2, teacherId: 2, roomId: 1 }, // Science
      // SHORT BREAK
      { period: 4, subjectId: 7, teacherId: 7, roomId: 4 }, // Computer Science
      { period: 5, subjectId: 4, teacherId: 4, roomId: 1 }, // Social Studies
      { period: 6, subjectId: 1, teacherId: 1, roomId: 1 }, // Mathematics
      // LUNCH BREAK
      { period: 7, subjectId: 6, teacherId: 6, roomId: 6 }, // PE
      { period: 8, subjectId: 9, teacherId: 9, roomId: 7 }, // Music
    ],
    SUN: [], // No classes on Sunday
  };

  // Generate entries from the schedule
  weekDays.forEach((day) => {
    const daySchedule = weeklySchedule[day];
    daySchedule.forEach((slot) => {
      const subject = allSubjects.find((s) => s.id === slot.subjectId);
      const teacher = teachers.find((t) => t.id === slot.teacherId);
      const room = slot.roomId ? rooms.find((r) => r.id === slot.roomId) : null;

      if (subject && teacher) {
        entries.push({
          id: ++entryIdCounter,
          academic_year_id: academicYearId,
          school_id: 1,
          class_id: classId,
          section,
          week_start: weekStart,
          day,
          period_no: slot.period,
          subject_id: subject.id,
          subject_name: subject.name,
          teacher_id: teacher.id,
          teacher_name: teacher.name,
          room_id: room?.id || null,
          room_name: room?.name || null,
          is_published: false,
          is_editable: true,
        });
      }
    });
  });

  return entries;
}

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockTimetable() {
  if (mockTimetableEntries.length > 0) return;

  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sections = ["A", "B"];

  // Get current week's Monday (same calculation as in component)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  const weekStart = monday.toISOString().split("T")[0];

  classIds.forEach((classId) => {
    sections.forEach((section) => {
      // Use the realistic schedule generator with academic_year_id: 1 to match component
      const entries = generateRealisticSchedule(classId, section, weekStart, 1);
      mockTimetableEntries.push(...entries);
    });
  });

  console.log(`[MOCK TIMETABLE] Initialized ${mockTimetableEntries.length} entries for week ${weekStart}`);
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

  console.log(`[MOCK TIMETABLE] getTimetableGrid called with:`, params);
  console.log(`[MOCK TIMETABLE] Total entries in memory:`, mockTimetableEntries.length);

  const entries = mockTimetableEntries.filter(
    (e) =>
      e.academic_year_id === params.academic_year_id &&
      e.class_id === params.class_id &&
      e.section === params.section &&
      e.week_start === params.week_start
  );

  console.log(`[MOCK TIMETABLE] getTimetableGrid → ${entries.length} entries found for class ${params.class_id}, section ${params.section}, week ${params.week_start}`);

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

  const subject = allSubjects.find((s) => s.id === payload.subject_id);
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
    const subject = allSubjects.find((s) => s.id === patch.subject_id);
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
  await simulateDelay(1500); // Longer delay for realistic generation

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

  // Generate realistic schedule
  const newEntries = generateRealisticSchedule(
    payload.class_id,
    payload.section,
    weekStart,
    payload.academic_year_id
  );

  mockTimetableEntries.push(...newEntries);

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
