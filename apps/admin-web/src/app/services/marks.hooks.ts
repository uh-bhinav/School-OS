import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./marks.api";
import { Mark } from "./marks.schema";

export const useMarks = (filters: Record<string, any>) =>
  useQuery({
    queryKey: ["marks", filters],
    queryFn: () => api.getMarks(filters),
    retry: false,
  });

export const useMarksKpi = (filters: Record<string, any>) =>
  useQuery({
    queryKey: ["marks-kpi", filters],
    queryFn: () => api.getMarksKpi(filters),
  });

export const useClassPerformance = (class_id: number, exam_id: number) =>
  useQuery({
    queryKey: ["class-performance", class_id, exam_id],
    queryFn: () => api.getClassPerformance(class_id, exam_id),
    enabled: !!class_id && !!exam_id,
  });

export const useStudentProgress = (student_id: number, subject_id: number) =>
  useQuery({
    queryKey: ["student-progress", student_id, subject_id],
    queryFn: () => api.getStudentProgress(student_id, subject_id),
    enabled: !!student_id && !!subject_id,
  });

export const useCreateMark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marks"] }),
  });
};

export const useUpdateMark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Mark> }) =>
      api.updateMark(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marks"] }),
  });
};

export const useDeleteMark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marks"] }),
  });
};

export const useBulkUploadMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.bulkUploadMarks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-kpi"] });
    },
  });
};
