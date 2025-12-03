import { z } from "zod";

export const DayOfWeek = z.enum(["MON","TUE","WED","THU","FRI","SAT","SUN"]);
export type DayOfWeek = z.infer<typeof DayOfWeek>;

export const Period = z.object({
  period_no: z.number().int().min(1),
  start_time: z.string(), // "09:00"
  end_time: z.string(),   // "09:45"
});
export type Period = z.infer<typeof Period>;

export const TimetableEntry = z.object({
  id: z.number(),
  academic_year_id: z.number(),
  school_id: z.number(),
  class_id: z.number(),
  section: z.string(),             // "A".."D"
  week_start: z.string(),          // ISO Monday
  day: DayOfWeek,
  period_no: z.number().int(),
  subject_id: z.number(),
  subject_name: z.string(),
  teacher_id: z.number(),
  teacher_name: z.string(),
  room_id: z.number().nullable(),
  room_name: z.string().nullable(),
  is_published: z.boolean().optional(),
  is_editable: z.boolean().optional(),
});
export type TimetableEntry = z.infer<typeof TimetableEntry>;

export const TimetableGrid = z.object({
  academic_year_id: z.number(),
  class_id: z.number(),
  section: z.string(),
  week_start: z.string(),
  periods: z.array(Period),
  entries: z.array(TimetableEntry),
  conflicts: z.array(z.object({
    type: z.enum(["TEACHER","ROOM","DOUBLE_BOOK"]),
    message: z.string(),
    entry_ids: z.array(z.number()),
  })),
});
export type TimetableGrid = z.infer<typeof TimetableGrid>;

export const TimetableUpsert = z.object({
  academic_year_id: z.number(),
  class_id: z.number(),
  section: z.string(),
  week_start: z.string(),
  day: DayOfWeek,
  period_no: z.number().int(),
  subject_id: z.number(),
  teacher_id: z.number(),
  room_id: z.number().nullable().optional(),
});
export type TimetableUpsert = z.infer<typeof TimetableUpsert>;

export const KPISnapshot = z.object({
  coverage_pct: z.number(),
  conflicts_count: z.number(),
  free_periods: z.number(),
  room_util_pct: z.number(),
});
export type KPISnapshot = z.infer<typeof KPISnapshot>;

export const ConflictCheckResponse = z.object({
  ok: z.boolean(),
  conflicts: z.array(z.object({
    type: z.string(),
    message: z.string(),
  })),
});
export type ConflictCheckResponse = z.infer<typeof ConflictCheckResponse>;

// Custom constraint for timetable generation
export const CustomConstraint = z.object({
  id: z.string(),
  description: z.string(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]), // 1=High, 2=Medium, 3=Low
});
export type CustomConstraint = z.infer<typeof CustomConstraint>;

// Teacher workload constraints
export const TeacherConstraints = z.object({
  maxClassesPerDay: z.number().min(1).max(10),
  maxClassesPerWeek: z.number().min(1).max(50),
  minClassesPerDay: z.number().min(0).max(10),
  minClassesPerWeek: z.number().min(0).max(50),
  prioritizeCoreSubjects: z.boolean(),
  coreSubjectNames: z.array(z.string()),
});
export type TeacherConstraints = z.infer<typeof TeacherConstraints>;

// Request schema for timetable generation
export const TimetableGenerateRequest = z.object({
  academic_year_id: z.number(),
  class_id: z.number(),
  section: z.string(),
  week_start: z.string().optional(),
  constraints: z.array(CustomConstraint).optional(),
  teacher_constraints: TeacherConstraints.optional(),
});
export type TimetableGenerateRequest = z.infer<typeof TimetableGenerateRequest>;
