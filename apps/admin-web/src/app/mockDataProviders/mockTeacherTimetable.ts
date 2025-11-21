// ============================================================================
// MOCK TEACHER TIMETABLE DATA PROVIDER
// ============================================================================

export interface TeacherTimetableSlot {
  slot_id: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  period: number;
  period_name: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  class_name: string;
  section: string;
  room_number: string;
  room_name: string;
  is_free_period: boolean;
}

export interface TeacherWorkloadKpi {
  teacher_id: number;
  total_periods_per_week: number;
  teaching_periods: number;
  free_periods: number;
  classes_taught: number;
  subjects_taught: number;
  timetable_coverage_percentage: number;
  workload_status: "Light" | "Moderate" | "Heavy" | "Overloaded";
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DAYS: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const PERIODS = [
  { period: 1, name: "Period 1", start: "08:00", end: "08:45" },
  { period: 2, name: "Period 2", start: "08:50", end: "09:35" },
  { period: 3, name: "Period 3", start: "09:40", end: "10:25" },
  { period: 4, name: "Period 4", start: "10:30", end: "11:15" },
  { period: 5, name: "Period 5", start: "11:45", end: "12:30" },
  { period: 6, name: "Period 6", start: "12:35", end: "13:20" },
  { period: 7, name: "Period 7", start: "13:25", end: "14:10" },
  { period: 8, name: "Period 8", start: "14:15", end: "15:00" },
];

const SUBJECTS = [
  { name: "Mathematics", code: "MATH" },
  { name: "Science", code: "SCI" },
  { name: "Physics", code: "PHY" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Biology", code: "BIO" },
  { name: "English", code: "ENG" },
  { name: "Hindi", code: "HIN" },
  { name: "Social Studies", code: "SST" },
  { name: "Computer Science", code: "CS" },
  { name: "Physical Education", code: "PE" },
];

const CLASSES = [
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
];

const SECTIONS = ["A", "B", "C"];

const ROOMS = [
  { number: "101", name: "Room 101" },
  { number: "102", name: "Room 102" },
  { number: "201", name: "Room 201" },
  { number: "202", name: "Room 202" },
  { number: "301", name: "Physics Lab" },
  { number: "302", name: "Chemistry Lab" },
  { number: "303", name: "Biology Lab" },
  { number: "304", name: "Computer Lab" },
  { number: "G01", name: "Sports Ground" },
];

export async function getTeacherTimetable(teacherId: number): Promise<TeacherTimetableSlot[]> {
  await simulateDelay();

  const timetable: TeacherTimetableSlot[] = [];
  let slotId = teacherId * 1000;

  // Each teacher teaches 25-35 periods per week
  const totalTeachingPeriods = 25 + (teacherId % 11);
  const periodsPerDay = Math.floor(totalTeachingPeriods / 6);

  DAYS.forEach((day, dayIndex) => {
    const dayPeriods = periodsPerDay + (dayIndex < (totalTeachingPeriods % 6) ? 1 : 0);
    const usedPeriods = new Set<number>();

    for (let i = 0; i < dayPeriods; i++) {
      let periodIndex;
      do {
        periodIndex = Math.floor(Math.random() * PERIODS.length);
      } while (usedPeriods.has(periodIndex));
      usedPeriods.add(periodIndex);

      const period = PERIODS[periodIndex];
      const subject = SUBJECTS[(teacherId + dayIndex + i) % SUBJECTS.length];
      const className = CLASSES[(teacherId + i) % CLASSES.length];
      const section = SECTIONS[(teacherId + dayIndex) % SECTIONS.length];
      const room = ROOMS[(teacherId + i) % ROOMS.length];

      timetable.push({
        slot_id: ++slotId,
        day,
        period: period.period,
        period_name: period.name,
        start_time: period.start,
        end_time: period.end,
        subject_name: subject.name,
        subject_code: subject.code,
        class_name: className,
        section,
        room_number: room.number,
        room_name: room.name,
        is_free_period: false,
      });
    }

    // Add free periods
    PERIODS.forEach((period, index) => {
      if (!usedPeriods.has(index)) {
        timetable.push({
          slot_id: ++slotId,
          day,
          period: period.period,
          period_name: period.name,
          start_time: period.start,
          end_time: period.end,
          subject_name: "Free Period",
          subject_code: "FREE",
          class_name: "-",
          section: "-",
          room_number: "-",
          room_name: "Staff Room",
          is_free_period: true,
        });
      }
    });
  });

  console.log(`[MOCK TEACHER TIMETABLE] getTeacherTimetable(${teacherId}) → ${timetable.length} slots`);
  return timetable.sort((a, b) => {
    const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    return dayOrder !== 0 ? dayOrder : a.period - b.period;
  });
}

export async function getTeacherWorkloadKpi(teacherId: number): Promise<TeacherWorkloadKpi> {
  await simulateDelay();

  const totalPeriodsPerWeek = DAYS.length * PERIODS.length; // 6 days * 8 periods = 48
  const teachingPeriods = 25 + (teacherId % 11);
  const freePeriods = totalPeriodsPerWeek - teachingPeriods;
  const classesTaught = 3 + (teacherId % 3);
  const subjectsTaught = 2 + (teacherId % 2);
  const coveragePercentage = Math.round((teachingPeriods / totalPeriodsPerWeek) * 100);

  let workloadStatus: "Light" | "Moderate" | "Heavy" | "Overloaded";
  if (teachingPeriods < 20) workloadStatus = "Light";
  else if (teachingPeriods < 28) workloadStatus = "Moderate";
  else if (teachingPeriods < 35) workloadStatus = "Heavy";
  else workloadStatus = "Overloaded";

  return {
    teacher_id: teacherId,
    total_periods_per_week: totalPeriodsPerWeek,
    teaching_periods: teachingPeriods,
    free_periods: freePeriods,
    classes_taught: classesTaught,
    subjects_taught: subjectsTaught,
    timetable_coverage_percentage: coveragePercentage,
    workload_status: workloadStatus,
  };
}

export const mockTeacherTimetableProvider = {
  getTeacherTimetable,
  getTeacherWorkloadKpi,
};
