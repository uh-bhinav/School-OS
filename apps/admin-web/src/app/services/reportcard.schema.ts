import { z } from "zod";

/**
 * Subject performance in a report card
 */
export const SubjectPerformance = z.object({
  subject_id: z.number(),
  subject_name: z.string(),
  marks_obtained: z.number().nullable(),
  marks_total: z.number(),
  percentage: z.number().nullable(),
  grade: z.string().nullable(),
  remarks: z.string().nullable().optional(),
});
export type SubjectPerformance = z.infer<typeof SubjectPerformance>;

/**
 * Student report card
 */
export const ReportCard = z.object({
  student_id: z.number(),
  student_name: z.string(),
  class_name: z.string().optional(),
  academic_year_id: z.number(),
  academic_year_name: z.string().optional(),
  subjects: z.array(SubjectPerformance),
  total_marks_obtained: z.number(),
  total_marks_possible: z.number(),
  overall_percentage: z.number(),
  overall_grade: z.string().nullable(),
  attendance_percentage: z.number().nullable().optional(),
  teacher_remarks: z.string().nullable().optional(),
  generated_at: z.string().optional(),
});
export type ReportCard = z.infer<typeof ReportCard>;
