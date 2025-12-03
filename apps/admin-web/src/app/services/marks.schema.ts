import { z } from "zod";

// Backend response schema - matches MarkOut from backend
export const MarkSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  student_id: z.number(),
  exam_id: z.number(),
  subject_id: z.number(),
  marks_obtained: z.number(),
  max_marks: z.number(),
  remarks: z.string().nullable().optional(),
  entered_by_teacher_id: z.number().nullable().optional(),
  // Joined fields from relationships
  student_name: z.string().optional(),
  roll_no: z.string().optional(),
  class_id: z.number().optional(),
  section: z.string().optional(),
  subject_name: z.string().optional(),
  exam_name: z.string().optional(),
  exam_date: z.string().optional(), // For progression chart
  // Computed fields
  grade: z.string().optional(),
  percentage: z.number().optional(),
});

// Frontend create schema - matches MarkCreate from backend
export const MarkCreateSchema = z.object({
  school_id: z.number(),
  student_id: z.number(),
  exam_id: z.number(),
  subject_id: z.number(),
  marks_obtained: z.number(),
  max_marks: z.number().default(100),
  remarks: z.string().optional(),
});

// Frontend update schema - matches MarkUpdate from backend
export const MarkUpdateSchema = z.object({
  marks_obtained: z.number().optional(),
  remarks: z.string().optional(),
});

// KPI schema - matches ClassPerformanceSummary from backend
export const MarksKpiSchema = z.object({
  class_average: z.number().nullable().optional(),
  highest_score: z.number().nullable().optional(),
  lowest_score: z.number().nullable().optional(),
  total_students: z.number(),
  students_passed: z.number(),
  failure_rate: z.number(),
});

// Class performance schema
export const ClassPerformanceSchema = z.object({
  subject_name: z.string(),
  average_score: z.number().nullable().optional(),
  pass_rate: z.number(),
});

// Student progression schema - transformed from backend Mark array
export const StudentProgressSchema = z.object({
  subject_name: z.string(),
  exams: z.array(
    z.object({
      exam_name: z.string(),
      marks_obtained: z.number(),
      max_marks: z.number(),
      percentage: z.number(),
      date: z.string(),
    })
  ),
});

export type Mark = z.infer<typeof MarkSchema>;
export type MarkCreate = z.infer<typeof MarkCreateSchema>;
export type MarkUpdate = z.infer<typeof MarkUpdateSchema>;
export type MarksKpi = z.infer<typeof MarksKpiSchema>;
export type ClassPerformance = z.infer<typeof ClassPerformanceSchema>;
export type StudentProgress = z.infer<typeof StudentProgressSchema>;

// Helper to calculate grade from percentage
export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

// Helper to calculate percentage
export const calculatePercentage = (obtained: number, max: number): number => {
  return max > 0 ? Math.round((obtained / max) * 100 * 100) / 100 : 0;
};
