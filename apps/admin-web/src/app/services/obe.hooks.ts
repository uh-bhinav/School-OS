// ============================================================================
// OBE REACT QUERY HOOKS
// ============================================================================
// Custom hooks for OBE data fetching and mutations using React Query

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subjectsApi,
  courseOutcomesApi,
  programOutcomesApi,
  subjectExamsApi,
  examQuestionsApi,
  questionMarksApi,
  attainmentApi,
} from "./obe.api";
import {
  CourseOutcomeCreate,
  CourseOutcomeUpdate,
  ExamQuestionCreate,
  ExamQuestionUpdate,
  Subject,
} from "./obe.schema";
import { useAuthStore } from "../stores/useAuthStore";

// Query keys
export const obeKeys = {
  all: ["obe"] as const,
  subjects: () => [...obeKeys.all, "subjects"] as const,
  subject: (id: number) => [...obeKeys.subjects(), id] as const,
  cos: () => [...obeKeys.all, "cos"] as const,
  cosBySubjectGrade: (subjectId: number, grade: number) =>
    [...obeKeys.cos(), subjectId, grade] as const,
  cosBySubject: (subjectId: number) => [...obeKeys.cos(), subjectId] as const,
  pos: () => [...obeKeys.all, "pos"] as const,
  subjectExams: () => [...obeKeys.all, "subjectExams"] as const,
  subjectExamsByExam: (examId: number) => [...obeKeys.subjectExams(), "exam", examId] as const,
  subjectExam: (id: number) => [...obeKeys.subjectExams(), id] as const,
  questions: () => [...obeKeys.all, "questions"] as const,
  questionsBySubjectExam: (subjectExamId: number) =>
    [...obeKeys.questions(), "subjectExam", subjectExamId] as const,
  questionMarks: () => [...obeKeys.all, "questionMarks"] as const,
  questionMarksBySubjectExam: (subjectExamId: number) =>
    [...obeKeys.questionMarks(), "subjectExam", subjectExamId] as const,
  attainment: () => [...obeKeys.all, "attainment"] as const,
  studentAttainment: (studentId: number, examId?: number) =>
    [...obeKeys.attainment(), "student", studentId, examId] as const,
  classAttainment: (classId: number, examId: number, subjectId?: number) =>
    [...obeKeys.attainment(), "class", classId, examId, subjectId] as const,
};

// ============================================================================
// SUBJECTS HOOKS
// ============================================================================
export const useSubjects = () => {
  const schoolId = useAuthStore((state) => state.schoolId) || 1;

  return useQuery({
    queryKey: obeKeys.subjects(),
    queryFn: () => subjectsApi.getAll(schoolId),
  });
};

export const useSubject = (subjectId: number | null) => {
  return useQuery({
    queryKey: obeKeys.subject(subjectId!),
    queryFn: () => subjectsApi.getById(subjectId!),
    enabled: subjectId !== null,
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, data }: { subjectId: number; data: Partial<Subject> }) =>
      subjectsApi.update(subjectId, data),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({ queryKey: obeKeys.subject(subjectId) });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjects() });
    },
  });
};

// ============================================================================
// COURSE OUTCOMES HOOKS
// ============================================================================
export const useCOsBySubjectAndGrade = (subjectId: number | null, grade: number | null) => {
  return useQuery({
    queryKey: obeKeys.cosBySubjectGrade(subjectId!, grade!),
    queryFn: () => courseOutcomesApi.getBySubjectAndGrade(subjectId!, grade!),
    enabled: subjectId !== null && grade !== null,
  });
};

export const useApprovedCOsBySubjectAndGrade = (
  subjectId: number | null,
  grade: number | null
) => {
  return useQuery({
    queryKey: [...obeKeys.cosBySubjectGrade(subjectId!, grade!), "approved"],
    queryFn: () => courseOutcomesApi.getApprovedBySubjectAndGrade(subjectId!, grade!),
    enabled: subjectId !== null && grade !== null,
  });
};

export const useCOsBySubject = (subjectId: number | null) => {
  return useQuery({
    queryKey: obeKeys.cosBySubject(subjectId!),
    queryFn: () => courseOutcomesApi.getBySubject(subjectId!),
    enabled: subjectId !== null,
  });
};

export const useCreateCO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseOutcomeCreate) => courseOutcomesApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: obeKeys.cosBySubjectGrade(data.subject_id, data.grade),
      });
      queryClient.invalidateQueries({ queryKey: obeKeys.cosBySubject(data.subject_id) });
    },
  });
};

export const useUpdateCO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ coId, data }: { coId: number; data: CourseOutcomeUpdate }) =>
      courseOutcomesApi.update(coId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.cos() });
    },
  });
};

export const useDeleteCO = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coId: number) => courseOutcomesApi.delete(coId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.cos() });
    },
  });
};

export const useBulkApproveCOs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coIds: number[]) => courseOutcomesApi.bulkApprove(coIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.cos() });
    },
  });
};

// ============================================================================
// PROGRAM OUTCOMES HOOKS
// ============================================================================
export const useProgramOutcomes = () => {
  const schoolId = useAuthStore((state) => state.schoolId) || 1;

  return useQuery({
    queryKey: obeKeys.pos(),
    queryFn: () => programOutcomesApi.getAll(schoolId),
  });
};

// ============================================================================
// SUBJECT EXAMS HOOKS
// ============================================================================
export const useSubjectExamsByExam = (examId: number | null) => {
  return useQuery({
    queryKey: obeKeys.subjectExamsByExam(examId!),
    queryFn: () => subjectExamsApi.getByExam(examId!),
    enabled: examId !== null,
  });
};

export const useSubjectExam = (subjectExamId: number | null) => {
  return useQuery({
    queryKey: obeKeys.subjectExam(subjectExamId!),
    queryFn: () => subjectExamsApi.getById(subjectExamId!),
    enabled: subjectExamId !== null,
  });
};

export const useExpandExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: number) => subjectExamsApi.expandExam(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExamsByExam(examId) });
    },
  });
};

export const usePublishSubjectExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectExamId: number) => subjectExamsApi.publish(subjectExamId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExam(data.id) });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExamsByExam(data.exam_id) });
    },
  });
};

// ============================================================================
// EXAM QUESTIONS HOOKS
// ============================================================================
export const useQuestionsBySubjectExam = (subjectExamId: number | null) => {
  return useQuery({
    queryKey: obeKeys.questionsBySubjectExam(subjectExamId!),
    queryFn: () => examQuestionsApi.getBySubjectExam(subjectExamId!),
    enabled: subjectExamId !== null,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamQuestionCreate) => examQuestionsApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: obeKeys.questionsBySubjectExam(data.subject_exam_id),
      });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExams() });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: ExamQuestionUpdate }) =>
      examQuestionsApi.update(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.questions() });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExams() });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: number) => examQuestionsApi.delete(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.questions() });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExams() });
    },
  });
};

export const useBulkUpdateQuestionCOs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ question_id: number; co_id: number }>) =>
      examQuestionsApi.bulkUpdateCOs(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obeKeys.questions() });
      queryClient.invalidateQueries({ queryKey: obeKeys.subjectExams() });
    },
  });
};

// ============================================================================
// QUESTION MARKS HOOKS
// ============================================================================
export const useQuestionMarksBySubjectExam = (subjectExamId: number | null) => {
  return useQuery({
    queryKey: obeKeys.questionMarksBySubjectExam(subjectExamId!),
    queryFn: () => questionMarksApi.getBySubjectExam(subjectExamId!),
    enabled: subjectExamId !== null,
  });
};

export const useSaveQuestionMarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectExamId,
      marks,
    }: {
      subjectExamId: number;
      marks: Array<{ question_id: number; student_id: number; marks_obtained: number }>;
    }) => questionMarksApi.saveMarks(subjectExamId, marks),
    onSuccess: (_, { subjectExamId }) => {
      queryClient.invalidateQueries({
        queryKey: obeKeys.questionMarksBySubjectExam(subjectExamId),
      });
    },
  });
};

// ============================================================================
// ATTAINMENT HOOKS
// ============================================================================
export const useStudentAttainment = (studentId: number | null, examId?: number) => {
  return useQuery({
    queryKey: obeKeys.studentAttainment(studentId!, examId),
    queryFn: () => attainmentApi.getStudentAttainment(studentId!, examId),
    enabled: studentId !== null,
  });
};

export const useClassAttainment = (
  classId: number | null,
  examId: number | null,
  subjectId?: number
) => {
  return useQuery({
    queryKey: obeKeys.classAttainment(classId!, examId!, subjectId),
    queryFn: () => attainmentApi.getClassAttainment(classId!, examId!, subjectId),
    enabled: classId !== null && examId !== null,
  });
};

export const useSubjectAttainment = (
  subjectId: number | null,
  examId: number | null,
  classId: number | null
) => {
  return useQuery({
    queryKey: [...obeKeys.attainment(), "subject", subjectId, examId, classId],
    queryFn: () => attainmentApi.getSubjectAttainment(subjectId!, examId!, classId!),
    enabled: subjectId !== null && examId !== null && classId !== null,
  });
};

// Additional attainment hooks for CO Attainment Dashboard
export const useCOAttainmentBySubject = (subjectId: number | null) => {
  return useQuery({
    queryKey: [...obeKeys.attainment(), "coBySubject", subjectId],
    queryFn: () => attainmentApi.getCOAttainmentBySubject(subjectId!),
    enabled: subjectId !== null,
  });
};

export const useCOAttainmentByClass = (
  subjectId: number | null,
  classId: number | null
) => {
  return useQuery({
    queryKey: [...obeKeys.attainment(), "coByClass", subjectId, classId],
    queryFn: () => attainmentApi.getCOAttainmentByClass(subjectId!, classId!),
    enabled: subjectId !== null,
  });
};

export const useCOAttainmentByStudent = (
  subjectId: number | null,
  studentId: number | null
) => {
  return useQuery({
    queryKey: [...obeKeys.attainment(), "coByStudent", subjectId, studentId],
    queryFn: () => attainmentApi.getCOAttainmentByStudent(subjectId!, studentId!),
    enabled: subjectId !== null && studentId !== null,
  });
};
