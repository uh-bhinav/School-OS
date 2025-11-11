import { z } from "zod";

// ==============================
// Core Exam Models
// ==============================
export const ExamType = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  weightage: z.number().optional(),
  is_active: z.boolean().default(true),
});

export type ExamType = z.infer<typeof ExamType>;

export const Exam = z.object({
  id: z.number(),
  school_id: z.number(),
  academic_year_id: z.number(),
  class_id: z.number(),
  section: z.string(),
  exam_type_id: z.number(),
  exam_type_name: z.string(),
  title: z.string(),
  date: z.string(),
  total_marks: z.number(),
  average_score: z.number().optional(),
  highest_score: z.number().optional(),
  pass_percentage: z.number().optional(),
  is_published: z.boolean().default(false),
});

export type Exam = z.infer<typeof Exam>;

// ==============================
// KPI & Summary Models
// ==============================
export const ExamKPI = z.object({
  total_exams: z.number(),
  avg_performance: z.number(),
  pass_rate: z.number(),
  pending_results: z.number(),
  published_count: z.number(),
});
export type ExamKPI = z.infer<typeof ExamKPI>;

// ==============================
// Report Card Models
// ==============================
export const ReportCardSummary = z.object({
  student_id: z.number(),
  student_name: z.string(),
  roll_no: z.number(),
  class_id: z.number(),
  section: z.string(),
  total_marks: z.number(),
  obtained_marks: z.number(),
  grade: z.string(),
  result_status: z.enum(["PASS", "FAIL", "INCOMPLETE"]),
});
export type ReportCardSummary = z.infer<typeof ReportCardSummary>;

export const ReportCard = z.object({
  exam_id: z.number(),
  exam_title: z.string(),
  students: z.array(ReportCardSummary),
});
export type ReportCard = z.infer<typeof ReportCard>;
