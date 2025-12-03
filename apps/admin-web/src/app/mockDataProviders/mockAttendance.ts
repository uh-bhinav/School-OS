// ============================================================================
// MOCK ATTENDANCE DATA PROVIDER
// ============================================================================
// Provides realistic mock attendance data for demo mode
// All CRUD operations work with in-memory storage
// ============================================================================

import type {
  AttendanceRecord,
  AttendanceCreate,
  AttendanceStatus,
  WeeklySummary,
  ClassRange,
  StudentHistory,
} from "../services/attendance.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let attendanceIdCounter = 5000;
const mockAttendanceRecords: AttendanceRecord[] = [];

// ============================================================================
// INITIALIZATION - Generate realistic demo data
// ============================================================================
function initializeMockAttendance() {
  if (mockAttendanceRecords.length > 0) return; // Already initialized

  // Generate attendance for last 30 days for student IDs 1-700 (matching mockStudents pattern)
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let studentId = 1; studentId <= 700; studentId++) {
      const classId = Math.ceil(studentId / 70); // Approx 70 students per class

      // 85% present, 5% absent, 5% late, 5% excused
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.85) status = "PRESENT";
      else if (rand < 0.90) status = "ABSENT";
      else if (rand < 0.95) status = "LATE";
      else status = "EXCUSED";

      mockAttendanceRecords.push({
        attendance_id: ++attendanceIdCounter,
        student_id: studentId,
        class_id: classId,
        date: dateStr,
        status,
        remarks: status === "ABSENT" ? "Medical leave" : null,
        marked_by: "Teacher",
        marked_at: new Date().toISOString(),
      });
    }
  }

  console.log(`[MOCK ATTENDANCE] Initialized ${mockAttendanceRecords.length} records`);
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockClassAttendanceForDate(
  classId: number,
  date: string
): Promise<AttendanceRecord[]> {
  initializeMockAttendance();
  await simulateDelay();

  const records = mockAttendanceRecords.filter(
    (r) => r.class_id === classId && r.date === date
  );

  // If no records exist for this date, generate them on the fly for students in that class
  if (records.length === 0) {
    // Get students for this class (approx 70 students per class)
    const startStudentId = (classId - 1) * 70 + 1;
    const endStudentId = classId * 70;

    for (let studentId = startStudentId; studentId <= Math.min(endStudentId, 700); studentId++) {
      // 85% present, 5% absent, 5% late, 5% excused
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.85) status = "PRESENT";
      else if (rand < 0.90) status = "ABSENT";
      else if (rand < 0.95) status = "LATE";
      else status = "EXCUSED";

      const newRecord: AttendanceRecord = {
        attendance_id: ++attendanceIdCounter,
        student_id: studentId,
        class_id: classId,
        date: date,
        status,
        remarks: status === "ABSENT" ? "Medical leave" : null,
        marked_by: "Teacher",
        marked_at: new Date().toISOString(),
      };

      mockAttendanceRecords.push(newRecord);
      records.push(newRecord);
    }
  }

  console.log(`[MOCK ATTENDANCE] getClassAttendanceForDate(${classId}, ${date}) → ${records.length} records`);
  return records;
}

export async function createMockAttendance(
  data: AttendanceCreate
): Promise<AttendanceRecord> {
  initializeMockAttendance();
  await simulateDelay();

  const newRecord: AttendanceRecord = {
    attendance_id: ++attendanceIdCounter,
    student_id: data.student_id,
    class_id: data.class_id,
    date: data.date,
    status: data.status,
    remarks: data.remarks || null,
    marked_by: "Admin",
    marked_at: new Date().toISOString(),
  };

  mockAttendanceRecords.push(newRecord);
  console.log(`[MOCK ATTENDANCE] Created record #${newRecord.attendance_id}`);
  return newRecord;
}

export async function updateMockAttendance(
  attendanceId: number,
  patch: Partial<AttendanceCreate>
): Promise<AttendanceRecord> {
  initializeMockAttendance();
  await simulateDelay();

  const record = mockAttendanceRecords.find((r) => r.attendance_id === attendanceId);
  if (!record) {
    throw new Error(`Attendance record #${attendanceId} not found`);
  }

  if (patch.status) record.status = patch.status;
  if (patch.remarks !== undefined) record.remarks = patch.remarks || null;

  console.log(`[MOCK ATTENDANCE] Updated record #${attendanceId}`);
  return record;
}

export async function deleteMockAttendance(attendanceId: number): Promise<void> {
  initializeMockAttendance();
  await simulateDelay();

  const index = mockAttendanceRecords.findIndex((r) => r.attendance_id === attendanceId);
  if (index === -1) {
    throw new Error(`Attendance record #${attendanceId} not found`);
  }

  mockAttendanceRecords.splice(index, 1);
  console.log(`[MOCK ATTENDANCE] Deleted record #${attendanceId}`);
}

export async function createMockBulkAttendance(
  records: AttendanceCreate[]
): Promise<AttendanceRecord[]> {
  initializeMockAttendance();
  await simulateDelay(500);

  const newRecords = records.map((data) => ({
    attendance_id: ++attendanceIdCounter,
    student_id: data.student_id,
    class_id: data.class_id,
    date: data.date,
    status: data.status,
    remarks: data.remarks || null,
    marked_by: "Admin",
    marked_at: new Date().toISOString(),
  }));

  mockAttendanceRecords.push(...newRecords);
  console.log(`[MOCK ATTENDANCE] Bulk created ${newRecords.length} records`);
  return newRecords;
}

// ============================================================================
// ANALYTICS & SUMMARIES
// ============================================================================

export async function getMockClassRange(
  classId: number,
  startDate: string,
  endDate: string
): Promise<ClassRange> {
  initializeMockAttendance();
  await simulateDelay();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const series: ClassRange["series"] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = mockAttendanceRecords.filter(
      (r) => r.class_id === classId && r.date === dateStr
    );

    series.push({
      date: dateStr,
      present_count: dayRecords.filter((r) => r.status === "PRESENT").length,
      absent_count: dayRecords.filter((r) => r.status === "ABSENT").length,
      late_count: dayRecords.filter((r) => r.status === "LATE").length,
    });
  }

  console.log(`[MOCK ATTENDANCE] getClassRange(${classId}, ${startDate}, ${endDate}) → ${series.length} days`);
  return {
    class_id: classId,
    from: startDate,
    to: endDate,
    series,
  };
}

export async function getMockWeeklySummary(
  classId: number,
  weekStartDate: string
): Promise<WeeklySummary> {
  initializeMockAttendance();
  await simulateDelay();

  // Calculate week range
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekRecords = mockAttendanceRecords.filter((r) => {
    if (r.class_id !== classId) return false;
    const rDate = new Date(r.date);
    return rDate >= weekStart && rDate <= weekEnd;
  });

  // Group by section (mock sections A, B, C)
  const sections = ["Section A", "Section B", "Section C"];
  const buckets = sections.map((sectionLabel, idx) => {
    // Distribute students across sections
    const sectionRecords = weekRecords.filter((r) => {
      const studentNum = r.student_id % 1000;
      return Math.floor((studentNum - 1) / 13) === idx; // ~13 students per section
    });

    const presentCount = sectionRecords.filter((r) => r.status === "PRESENT").length;
    const presentPct = sectionRecords.length > 0
      ? Math.round((presentCount / sectionRecords.length) * 100)
      : 0;

    return {
      grade_label: sectionLabel,
      present_pct: presentPct,
    };
  });

  console.log(`[MOCK ATTENDANCE] getWeeklySummary(${classId}, ${weekStartDate}) → ${buckets.length} sections`);
  return {
    class_id: classId,
    week_start: weekStartDate,
    buckets,
  };
}

export async function getMockStudentHistory(studentId: number): Promise<StudentHistory> {
  initializeMockAttendance();
  await simulateDelay();

  const studentRecords = mockAttendanceRecords
    .filter((r) => r.student_id === studentId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30); // Last 30 records

  const records = studentRecords.map((r) => ({
    date: r.date,
    status: r.status,
    class_id: r.class_id,
    remarks: r.remarks,
  }));

  console.log(`[MOCK ATTENDANCE] getStudentHistory(${studentId}) → ${records.length} records`);
  return {
    student_id: studentId,
    records,
  };
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
export const mockAttendanceProvider = {
  getClassAttendanceForDate: getMockClassAttendanceForDate,
  create: createMockAttendance,
  update: updateMockAttendance,
  delete: deleteMockAttendance,
  createBulk: createMockBulkAttendance,
  getClassRange: getMockClassRange,
  getWeeklySummary: getMockWeeklySummary,
  getStudentHistory: getMockStudentHistory,
};
