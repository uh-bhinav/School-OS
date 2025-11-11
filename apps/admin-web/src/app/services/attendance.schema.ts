// services/attendance.schema.ts
import { z } from "zod";

export const AttendanceStatus = z.enum(["PRESENT","ABSENT","LATE","EXCUSED"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

export const AttendanceRecord = z.object({
  attendance_id: z.number(),
  student_id: z.number(),
  class_id: z.number(),
  date: z.string(), // ISO (YYYY-MM-DD)
  status: AttendanceStatus,
  remarks: z.string().nullable(),
  marked_by: z.string(),
  marked_at: z.string(), // ISO
});
export type AttendanceRecord = z.infer<typeof AttendanceRecord>;

export const AttendanceCreate = z.object({
  student_id: z.number(),
  class_id: z.number(),
  date: z.string(),
  status: AttendanceStatus,
  remarks: z.string().optional(),
});
export type AttendanceCreate = z.infer<typeof AttendanceCreate>;

export const AttendanceListResponse = z.object({
  items: z.array(AttendanceRecord),
  total: z.number(),
});
export type AttendanceListResponse = z.infer<typeof AttendanceListResponse>;

// /class/{class_id}/summary (weekly)
export const WeeklySummary = z.object({
  class_id: z.number(),
  week_start: z.string(), // Monday ISO date
  buckets: z.array(z.object({
    grade_label: z.string(), // or section label
    present_pct: z.number(), // 0..100
  })),
});
export type WeeklySummary = z.infer<typeof WeeklySummary>;

// /class/{class_id}/range
export const ClassRange = z.object({
  class_id: z.number(),
  from: z.string(),
  to: z.string(),
  series: z.array(z.object({
    date: z.string(),
    present_count: z.number(),
    absent_count: z.number(),
    late_count: z.number(),
  })),
});
export type ClassRange = z.infer<typeof ClassRange>;

// /students/{student_id}
export const StudentHistory = z.object({
  student_id: z.number(),
  records: z.array(z.object({
    date: z.string(),
    status: AttendanceStatus,
    class_id: z.number(),
    remarks: z.string().nullable(),
  }))
});
export type StudentHistory = z.infer<typeof StudentHistory>;
