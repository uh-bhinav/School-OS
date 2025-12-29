import { z } from "zod";

// ============================================================================
// OBE (Outcome-Based Education) SCHEMAS
// ============================================================================
// Type definitions for Course Outcomes (CO), Program Outcomes (PO),
// Question-CO Mapping, and CO Attainment tracking

// ============================================================================
// Program Outcome (PO) - School-level learning goals
// ============================================================================
export const ProgramOutcomeSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  code: z.string(), // PO1, PO2, etc.
  description: z.string(),
  status: z.enum(["draft", "approved"]),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type ProgramOutcome = z.infer<typeof ProgramOutcomeSchema>;

export const ProgramOutcomeCreateSchema = z.object({
  school_id: z.number(),
  code: z.string(),
  description: z.string(),
  status: z.enum(["draft", "approved"]).default("draft"),
});

export type ProgramOutcomeCreate = z.infer<typeof ProgramOutcomeCreateSchema>;

// ============================================================================
// Course Outcome (CO) - Per subject per grade
// ============================================================================
export const BloomLevelEnum = z.enum([
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
]);

export type BloomLevel = z.infer<typeof BloomLevelEnum>;

export const CourseOutcomeSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  subject_id: z.number(),
  subject_name: z.string().optional(), // Joined field
  subject_code: z.string().optional(), // Joined field
  grade: z.number(), // Grade level (1-12)
  code: z.string(), // CO1, CO2, etc.
  description: z.string(),
  bloom_level: BloomLevelEnum.optional(),
  status: z.enum(["draft", "approved"]),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type CourseOutcome = z.infer<typeof CourseOutcomeSchema>;

export const CourseOutcomeCreateSchema = z.object({
  school_id: z.number(),
  subject_id: z.number(),
  grade: z.number(),
  code: z.string(),
  description: z.string(),
  bloom_level: BloomLevelEnum.optional(),
  status: z.enum(["draft", "approved"]).default("draft"),
});

export type CourseOutcomeCreate = z.infer<typeof CourseOutcomeCreateSchema>;

export const CourseOutcomeUpdateSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  bloom_level: BloomLevelEnum.optional(),
  status: z.enum(["draft", "approved"]).optional(),
});

export type CourseOutcomeUpdate = z.infer<typeof CourseOutcomeUpdateSchema>;

// ============================================================================
// CO-PO Mapping (Many-to-Many relationship)
// ============================================================================
export const COPOMappingSchema = z.object({
  id: z.number(),
  co_id: z.number(),
  po_id: z.number(),
  correlation_level: z.number().min(1).max(3), // 1=Low, 2=Medium, 3=High
});

export type COPOMapping = z.infer<typeof COPOMappingSchema>;

// ============================================================================
// Subject (Enhanced with OBE metadata)
// ============================================================================
export const SubjectSchema = z.object({
  subject_id: z.number(),
  school_id: z.number(),
  subject_name: z.string(),
  subject_code: z.string(),
  description: z.string().optional(),
  is_included_in_exams: z.boolean().default(true),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type Subject = z.infer<typeof SubjectSchema>;

export const SubjectDetailSchema = SubjectSchema.extend({
  // Aggregated data
  cos_defined_count: z.number().default(0),
  cos_approved_count: z.number().default(0),
  total_classes: z.number().default(0),
  total_teachers: z.number().default(0),
  grades_taught: z.array(z.number()).default([]),
  // Related data
  classes: z
    .array(
      z.object({
        class_id: z.number(),
        class_name: z.string(),
        section: z.string(),
        grade: z.number(),
        teacher_id: z.number().nullable(),
        teacher_name: z.string().nullable(),
        periods_per_week: z.number(),
      })
    )
    .default([]),
});

export type SubjectDetail = z.infer<typeof SubjectDetailSchema>;

// ============================================================================
// Subject-Exam (Expansion of exam event to specific subjects)
// ============================================================================
export const SubjectExamStatusEnum = z.enum([
  "draft",
  "questions_defined",
  "cos_mapped",
  "published",
]);

export type SubjectExamStatus = z.infer<typeof SubjectExamStatusEnum>;

export const SubjectExamSchema = z.object({
  id: z.number(),
  exam_id: z.number(), // Parent exam event
  exam_title: z.string().optional(),
  class_id: z.number(),
  class_name: z.string().optional(),
  section: z.string().optional(),
  grade: z.number().optional(),
  subject_id: z.number(),
  subject_name: z.string().optional(),
  subject_code: z.string().optional(),
  total_marks: z.number(),
  questions_count: z.number().default(0),
  questions_mapped: z.number().default(0), // How many have CO assigned
  status: SubjectExamStatusEnum.default("draft"),
  date: z.string().optional(),
  created_at: z.string().optional(),
});

export type SubjectExam = z.infer<typeof SubjectExamSchema>;

// ============================================================================
// Exam Question (With CO Mapping)
// ============================================================================
export const ExamQuestionSchema = z.object({
  id: z.number(),
  subject_exam_id: z.number(),
  question_number: z.number(),
  description: z.string().optional(),
  max_marks: z.number(),
  co_id: z.number().nullable(), // Mapped Course Outcome
  co_code: z.string().optional(), // Joined field
  co_description: z.string().optional(), // Joined field
});

export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;

export const ExamQuestionCreateSchema = z.object({
  subject_exam_id: z.number(),
  question_number: z.number(),
  description: z.string().optional(),
  max_marks: z.number(),
  co_id: z.number().nullable().default(null),
});

export type ExamQuestionCreate = z.infer<typeof ExamQuestionCreateSchema>;

export const ExamQuestionUpdateSchema = z.object({
  question_number: z.number().optional(),
  description: z.string().optional(),
  max_marks: z.number().optional(),
  co_id: z.number().nullable().optional(),
});

export type ExamQuestionUpdate = z.infer<typeof ExamQuestionUpdateSchema>;

// ============================================================================
// Question-wise Marks Entry
// ============================================================================
export const QuestionMarkSchema = z.object({
  id: z.number(),
  question_id: z.number(),
  student_id: z.number(),
  student_name: z.string().optional(),
  roll_no: z.string().optional(),
  marks_obtained: z.number(),
  max_marks: z.number(),
});

export type QuestionMark = z.infer<typeof QuestionMarkSchema>;

export const QuestionMarkCreateSchema = z.object({
  question_id: z.number(),
  student_id: z.number(),
  marks_obtained: z.number(),
});

export type QuestionMarkCreate = z.infer<typeof QuestionMarkCreateSchema>;

// ============================================================================
// CO Attainment
// ============================================================================
export const COAttainmentSchema = z.object({
  co_id: z.number(),
  co_code: z.string(),
  co_description: z.string(),
  bloom_level: BloomLevelEnum.optional(),
  subject_id: z.number(),
  subject_name: z.string().optional(),
  // Context
  student_id: z.number().optional(), // If student-level
  student_name: z.string().optional(),
  class_id: z.number(),
  class_name: z.string().optional(),
  exam_id: z.number(),
  exam_name: z.string().optional(),
  // Metrics
  max_marks: z.number(),
  obtained_marks: z.number(),
  attainment_percentage: z.number(),
  // Thresholds
  target_attainment: z.number().default(60), // Target percentage
  is_attained: z.boolean(), // Whether target met
});

export type COAttainment = z.infer<typeof COAttainmentSchema>;

// ============================================================================
// Class-level CO Attainment Summary
// ============================================================================
export const ClassCOAttainmentSchema = z.object({
  class_id: z.number(),
  class_name: z.string(),
  exam_id: z.number(),
  exam_name: z.string(),
  subject_id: z.number(),
  subject_name: z.string(),
  total_students: z.number(),
  cos: z.array(
    z.object({
      co_id: z.number(),
      co_code: z.string(),
      co_description: z.string(),
      average_attainment: z.number(),
      students_attained: z.number(), // Count of students who met target
      target_attainment: z.number(),
    })
  ),
});

export type ClassCOAttainment = z.infer<typeof ClassCOAttainmentSchema>;

// ============================================================================
// Student CO Attainment (Across subjects)
// ============================================================================
export const StudentCOAttainmentSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  roll_no: z.string().optional(),
  class_id: z.number(),
  class_name: z.string(),
  exam_id: z.number(),
  exam_name: z.string(),
  subjects: z.array(
    z.object({
      subject_id: z.number(),
      subject_name: z.string(),
      total_marks: z.number(),
      obtained_marks: z.number(),
      percentage: z.number(),
      cos: z.array(
        z.object({
          co_id: z.number(),
          co_code: z.string(),
          max_marks: z.number(),
          obtained_marks: z.number(),
          attainment_percentage: z.number(),
          is_attained: z.boolean(),
        })
      ),
    })
  ),
});

export type StudentCOAttainment = z.infer<typeof StudentCOAttainmentSchema>;

// ============================================================================
// Utility Types
// ============================================================================
export interface SubjectExamFilters {
  exam_id?: number;
  class_id?: number;
  subject_id?: number;
}

export interface COFilters {
  subject_id?: number;
  grade?: number;
  status?: "draft" | "approved";
}

export interface AttainmentFilters {
  class_id?: number;
  exam_id?: number;
  subject_id?: number;
  student_id?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================
export const calculateAttainmentPercentage = (
  obtained: number,
  max: number
): number => {
  return max > 0 ? Math.round((obtained / max) * 100 * 100) / 100 : 0;
};

export const isAttainmentMet = (
  percentage: number,
  target: number = 60
): boolean => {
  return percentage >= target;
};

export const getNextCOCode = (existingCodes: string[]): string => {
  const numbers = existingCodes
    .map((code) => {
      const match = code.match(/CO(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `CO${maxNum + 1}`;
};

export const BLOOM_LEVELS: BloomLevel[] = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

export const BLOOM_LEVEL_DESCRIPTIONS: Record<BloomLevel, string> = {
  Remember: "Recall facts and basic concepts",
  Understand: "Explain ideas or concepts",
  Apply: "Use information in new situations",
  Analyze: "Draw connections among ideas",
  Evaluate: "Justify a decision or course of action",
  Create: "Produce new or original work",
};
