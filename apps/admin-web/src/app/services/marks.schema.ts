import { z } from "zod";

export const MarkSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  student_name: z.string(),
  roll_no: z.string().optional(),
  class_id: z.number(),
  section: z.string(),
  subject_id: z.number(),
  subject_name: z.string(),
  exam_id: z.number(),
  exam_name: z.string(),
  marks_obtained: z.number(),
  total_marks: z.number(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
  is_published: z.boolean(),
});

export const MarksKpiSchema = z.object({
  total_students: z.number(),
  average_score: z.number(),
  pass_rate: z.number(),
  highest_score: z.number(),
  low_performers: z.number(),
});

export const ClassPerformanceSchema = z.object({
  subject_name: z.string(),
  average_score: z.number(),
  pass_rate: z.number(),
});

export const StudentProgressSchema = z.object({
  subject_name: z.string(),
  dates: z.array(z.string()),
  marks: z.array(z.number()),
});

export type Mark = z.infer<typeof MarkSchema>;
export type MarksKpi = z.infer<typeof MarksKpiSchema>;
export type ClassPerformance = z.infer<typeof ClassPerformanceSchema>;
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
