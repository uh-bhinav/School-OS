import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./marks.api";
import { MarkCreate, MarkUpdate } from "./marks.schema";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { http } from "./http";

// ============================================================================
// MARKS HOOKS - INTEGRATED WITH BACKEND
// ============================================================================
// React Query hooks for marks module with proper multi-tenancy support
// All queries include school_id from auth store
// All mutations invalidate affected queries automatically
// ============================================================================

/**
 * Fetch marks with filters
 * Automatically includes school_id from auth store
 */
export const useMarks = (filters: {
  student_id?: number;
  class_id?: number;
  section?: string;
  subject_id?: number;
  exam_id?: number;
  academic_year_id?: number;
}) => {
  const schoolId = useAuthStore((state) => state.schoolId);

  return useQuery({
    queryKey: ["marks", schoolId, filters],
    queryFn: () =>
      api.getMarks({
        school_id: schoolId,
        ...filters,
      }),
    enabled: !!schoolId && (!!filters.class_id || !!filters.student_id),
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch marks KPI for class/exam
 */
export const useMarksKpi = (filters: { class_id: number; exam_id: number }) => {
  const schoolId = useAuthStore((state) => state.schoolId);

  return useQuery({
    queryKey: ["marks-kpi", schoolId, filters.class_id, filters.exam_id],
    queryFn: () =>
      api.getMarksKpi({
        school_id: schoolId!,
        class_id: filters.class_id,
        exam_id: filters.exam_id,
      }),
    enabled: !!schoolId && !!filters.class_id && !!filters.exam_id,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Fetch class performance by subject
 */
export const useClassPerformance = (class_id: number, exam_id: number) => {
  return useQuery({
    queryKey: ["class-performance", class_id, exam_id],
    queryFn: () => api.getClassPerformance(class_id, exam_id),
    enabled: !!class_id && !!exam_id,
    staleTime: 60000,
  });
};

/**
 * Fetch student progression over time
 */
export const useStudentProgress = (student_id: number, subject_id: number) => {
  return useQuery({
    queryKey: ["student-progress", student_id, subject_id],
    queryFn: () => api.getStudentProgress(student_id, subject_id),
    enabled: !!student_id && !!subject_id,
    staleTime: 60000,
  });
};

/**
 * Create a new mark
 * Requires school_id in payload
 */
export const useCreateMark = () => {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: (payload: Omit<MarkCreate, "school_id">) =>
      api.createMark({
        ...payload,
        school_id: schoolId!,
      }),
    onSuccess: (data) => {
      // Invalidate all marks queries for this school
      queryClient.invalidateQueries({ queryKey: ["marks", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["marks-kpi", schoolId] });

      // Invalidate specific student/class queries
      if (data.student_id) {
        queryClient.invalidateQueries({
          queryKey: ["student-progress", data.student_id],
        });
      }
      if (data.class_id && data.exam_id) {
        queryClient.invalidateQueries({
          queryKey: ["class-performance", data.class_id, data.exam_id],
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to create mark:", error);
    },
  });
};

/**
 * Update an existing mark
 */
export const useUpdateMark = () => {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MarkUpdate }) =>
      api.updateMark(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marks", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["marks-kpi", schoolId] });

      if (data.student_id) {
        queryClient.invalidateQueries({
          queryKey: ["student-progress", data.student_id],
        });
      }
      if (data.class_id && data.exam_id) {
        queryClient.invalidateQueries({
          queryKey: ["class-performance", data.class_id, data.exam_id],
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to update mark:", error);
    },
  });
};

/**
 * Delete a mark (soft delete)
 */
export const useDeleteMark = () => {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: api.deleteMark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["marks-kpi", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["student-progress"] });
      queryClient.invalidateQueries({ queryKey: ["class-performance"] });
    },
    onError: (error: any) => {
      console.error("Failed to delete mark:", error);
    },
  });
};

/**
 * Bulk upload marks from CSV
 * Parses CSV and creates multiple marks
 */
export const useBulkUploadMarks = () => {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: async (file: File) => {
      if (!schoolId) {
        throw new Error("School ID not found. Please log in again.");
      }

      // Parse CSV
      const marks = await api.parseMarksCSV(file, schoolId);

      // Validate marks
      if (marks.length === 0) {
        throw new Error("No valid marks found in CSV file");
      }

      // Upload to backend
      return api.bulkUploadMarks(marks);
    },
    onSuccess: () => {
      // Invalidate all marks-related queries
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-kpi"] });
      queryClient.invalidateQueries({ queryKey: ["student-progress"] });
      queryClient.invalidateQueries({ queryKey: ["class-performance"] });
    },
    onError: (error: any) => {
      console.error("Failed to bulk upload marks:", error);
    },
  });
};

// ============================================================================
// DROPDOWN DATA HOOKS - FIXED FOR BACKEND INTEGRATION
// ============================================================================

/**
 * Fetch all classes for the school
 * Backend: GET /api/v1/classes/school/{school_id}
 * Returns: Array of Class objects with subjects, teacher, etc.
 */
export const useClasses = () => {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await http.get(`/classes/school/${schoolId}`);
      return data;
    },
    enabled: !!(schoolId && isAuthenticated && config),
    staleTime: 300000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * Fetch students for a specific class
 * Backend: GET /api/v1/classes/{class_id}/students
 * Note: Backend filters by the class_id, which already belongs to the school
 */
export const useStudents = (class_id?: number) => {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: ["students", schoolId, class_id],
    queryFn: async () => {
      if (!class_id) return [];
      // Backend endpoint returns students for this class
      const { data } = await http.get(`/classes/${class_id}/students`);
      return data;
    },
    enabled: !!(schoolId && class_id && isAuthenticated && config),
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * Fetch subjects for a specific class
 * Backend: Classes have subjects relationship, subjects are filtered by class
 * We get subjects from the class object itself
 */
export const useSubjects = (class_id?: number) => {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: ["subjects", schoolId, class_id],
    queryFn: async () => {
      if (!class_id) {
        // Return all subjects for the school
        // Note: Backend doesn't have /subjects?school_id endpoint yet
        // So we fetch all classes and extract unique subjects
        const { data: classes } = await http.get(`/classes/school/${schoolId}`);
        const subjects = classes.flatMap((cls: any) => cls.subjects || []);
        // Deduplicate by subject_id
        const uniqueSubjects = Array.from(
          new Map(subjects.map((s: any) => [s.subject_id, s])).values()
        );
        return uniqueSubjects;
      }

      // Get subjects for specific class
      const { data: classData } = await http.get(`/classes/${class_id}`);
      return classData.subjects || [];
    },
    enabled: !!(schoolId && isAuthenticated && config),
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * Fetch exams for a school by academic year
 * Backend: GET /api/v1/exams/all/{school_id}
 * Note: Backend doesn't support filtering by academic_year_id or class_id in this endpoint
 * So we filter client-side
 */
export const useExams = (academic_year_id?: number, class_id?: number) => {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: ["exams", schoolId, academic_year_id, class_id],
    queryFn: async () => {
      if (!schoolId) return [];

      // Backend endpoint: GET /api/v1/exams/all/{school_id}
      const { data } = await http.get(`/exams/all/${schoolId}`);

      // Client-side filtering
      let filtered = data;

      if (academic_year_id) {
        filtered = filtered.filter((exam: any) => exam.academic_year_id === academic_year_id);
      }

      // Note: Backend exams don't have class_id directly
      // They apply to all classes unless specified differently
      // If your backend adds class filtering later, uncomment:
      // if (class_id) {
      //   filtered = filtered.filter((exam: any) => exam.class_id === class_id);
      // }

      return filtered;
    },
    enabled: !!(schoolId && isAuthenticated && config),
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * Static sections array
 * Could be made dynamic later if backend provides sections endpoint
 */
export const SECTIONS = ["A", "B", "C", "D", "E", "F"];
