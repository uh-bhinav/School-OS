import { http } from "./http";
import {
  Mark,
  MarkCreate,
  MarkUpdate,
  MarksKpi,
  ClassPerformance,
  StudentProgress,
  calculateGrade,
  calculatePercentage,
} from "./marks.schema";
import { AxiosError } from "axios";
import { isDemoMode, mockMarksProvider } from "../mockDataProviders";

// ============================================================================
// MARKS API - INTEGRATED WITH BACKEND + 404 HANDLING
// ============================================================================
// Backend endpoints:
// - GET    /marks              → List marks with filters
// - GET    /marks/{id}         → Get single mark
// - POST   /marks              → Create mark
// - PUT    /marks/{id}         → Update mark
// - DELETE /marks/{id}         → Delete mark (soft)
// - POST   /marks/bulk         → Bulk create marks
// - GET    /marks/performance/class/{class_id}/exam/{exam_id} → Class performance
// - GET    /marks/progression/student/{student_id}/subject/{subject_id} → Student progress
// ============================================================================

/**
 * Handle 404 errors gracefully - return empty data instead of throwing
 * This prevents UI from breaking when there's no data
 */
const handleNotFound = <T>(error: unknown, defaultValue: T): T => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      console.info("No data found (404), returning default value");
      return defaultValue;
    }
  }
  throw error;
};

/**
 * Get marks with optional filters
 * Backend returns marks with joined student/subject/exam data
 * HANDLES 404: Returns [] if no marks found
 */
export const getMarks = async (params?: {
  school_id?: number;
  student_id?: number;
  class_id?: number;
  section?: string;
  subject_id?: number;
  exam_id?: number;
  academic_year_id?: number;
}): Promise<Mark[]> => {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockMarksProvider.getMarks(params || {});
  }

  try {
    const res = await http.get<Mark[]>("/marks", { params });

    // Enrich response with computed fields
    return res.data.map((mark) => {
      const percentage = calculatePercentage(mark.marks_obtained, mark.max_marks);
      const grade = calculateGrade(percentage);
      return {
        ...mark,
        percentage,
        grade,
        total_marks: mark.max_marks, // Alias for frontend compatibility
      };
    });
  } catch (error) {
    return handleNotFound<Mark[]>(error, []);
  }
};

/**
 * Get single mark by ID
 */
export const getMarkById = async (mark_id: number) => {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const marks = await mockMarksProvider.getMarks({});
    const mark = marks.find(m => m.id === mark_id);
    if (!mark) throw new Error(`Mark ${mark_id} not found`);
    return mark;
  }

  const res = await http.get<Mark>(`/marks/${mark_id}`);
  const percentage = calculatePercentage(res.data.marks_obtained, res.data.max_marks);
  const grade = calculateGrade(percentage);
  return {
    ...res.data,
    percentage,
    grade,
    total_marks: res.data.max_marks,
  };
};

/**
 * Get marks KPI/statistics for a class/exam
 * Uses backend's ClassPerformanceSummary
 * HANDLES 404: Returns default KPI with zeros
 */
export const getMarksKpi = async (params: {
  school_id: number;
  class_id: number;
  exam_id: number;
}): Promise<MarksKpi> => {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockMarksProvider.getMarksKPI(params);
  }

  try {
    const res = await http.get<MarksKpi>(
      `/marks/performance/class/${params.class_id}/exam/${params.exam_id}`,
      { params: { school_id: params.school_id } }
    );
    return res.data;
  } catch (error) {
    return handleNotFound<MarksKpi>(error, {
      class_average: 0,
      highest_score: 0,
      lowest_score: 0,
      total_students: 0,
      students_passed: 0,
      failure_rate: 0,
    });
  }
};

/**
 * Get class performance by subject for an exam
 * Backend aggregates by subject
 * HANDLES 404: Returns [] if no performance data
 */
export const getClassPerformance = async (class_id: number, exam_id: number): Promise<ClassPerformance[]> => {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockMarksProvider.getClassPerformance({ class_id, exam_id });
  }

  try {
    const res = await http.get<ClassPerformance[]>(
      `/marks/performance/class/${class_id}/exam/${exam_id}`
    );
    return res.data;
  } catch (error) {
    return handleNotFound<ClassPerformance[]>(error, []);
  }
};

/**
 * Get student progression over time for a subject
 * Backend returns Mark[] ordered by exam date
 * Frontend transforms into chart-ready format
 * HANDLES 404: Returns empty progression
 */
export const getStudentProgress = async (student_id: number, subject_id: number): Promise<StudentProgress> => {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const allProgress = await mockMarksProvider.getStudentProgress(student_id);
    // Find the matching subject
    const subjectProgress = allProgress.find(p => p.subject_name.toLowerCase().includes(subject_id.toString()));
    return subjectProgress || { subject_name: "", exams: [] };
  }

  try {
    const res = await http.get<Mark[]>(
      `/marks/progression/student/${student_id}/subject/${subject_id}`
    );

    // Transform backend Mark[] into StudentProgress format
    if (res.data.length === 0) {
      return {
        subject_name: "",
        exams: [],
      };
    }

    const subject_name = res.data[0]?.subject_name || "";

    return {
      subject_name,
      exams: res.data.map((mark) => ({
        exam_name: mark.exam_name || "Unknown",
        marks_obtained: mark.marks_obtained,
        max_marks: mark.max_marks,
        percentage: calculatePercentage(mark.marks_obtained, mark.max_marks),
        date: mark.exam_date || new Date().toISOString(),
      })),
    };
  } catch (error) {
    return handleNotFound<StudentProgress>(error, {
      subject_name: "",
      exams: [],
    });
  }
};

/**
 * Create a new mark
 * IMPORTANT: school_id is REQUIRED by backend
 */
export const createMark = async (payload: MarkCreate) => {
  const res = await http.post<Mark>("/marks", payload);
  return res.data;
};

/**
 * Update an existing mark
 */
export const updateMark = async (mark_id: number, payload: MarkUpdate) => {
  const res = await http.put<Mark>(`/marks/${mark_id}`, payload);
  return res.data;
};

/**
 * Delete a mark (soft delete)
 */
export const deleteMark = async (mark_id: number) => {
  const res = await http.delete(`/marks/${mark_id}`);
  return res.data;
};

/**
 * Bulk upload marks from CSV
 * Accepts array of MarkCreate objects
 */
export const bulkUploadMarks = async (marks: MarkCreate[]) => {
  const res = await http.post<Mark[]>("/marks/bulk", { marks });
  return res.data;
};

/**
 * Helper: Parse CSV file to MarkCreate[]
 * Expected CSV columns: student_id,subject_id,exam_id,marks_obtained,max_marks,remarks
 */
export const parseMarksCSV = async (
  file: File,
  school_id: number
): Promise<MarkCreate[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file is empty or has no data rows");
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        // Validate required columns
        const requiredCols = ["student_id", "subject_id", "exam_id", "marks_obtained"];
        const missingCols = requiredCols.filter((col) => !headers.includes(col));

        if (missingCols.length > 0) {
          throw new Error(`Missing required columns: ${missingCols.join(", ")}`);
        }

        const marks: MarkCreate[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          marks.push({
            school_id,
            student_id: parseInt(row.student_id),
            subject_id: parseInt(row.subject_id),
            exam_id: parseInt(row.exam_id),
            marks_obtained: parseFloat(row.marks_obtained),
            max_marks: row.max_marks ? parseFloat(row.max_marks) : 100,
            remarks: row.remarks || undefined,
          });
        }

        resolve(marks);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read CSV file"));
    reader.readAsText(file);
  });
};
