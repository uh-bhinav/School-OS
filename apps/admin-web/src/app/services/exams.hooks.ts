import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExams, createExam, updateExam, deleteExam,
  getExamTypes, publishExam, getExamKPI
} from "./exams.api";
import { Exam } from "./exams.schema";

export function useExams(params: { academic_year_id: number; class_id?: number; section?: string }) {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => getExams(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useExamTypes(school_id: number) {
  return useQuery({
    queryKey: ["exam_types", school_id],
    queryFn: () => getExamTypes(school_id),
  });
}

export function useExamKPI(params: { academic_year_id: number; class_id?: number }) {
  return useQuery({
    queryKey: ["exam_kpi", params],
    queryFn: () => getExamKPI(params),
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Exam>) => createExam(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Exam> }) => updateExam(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function usePublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: number; publish: boolean }) => publishExam(id, publish),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}
