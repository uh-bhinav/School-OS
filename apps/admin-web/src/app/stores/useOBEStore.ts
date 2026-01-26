// ============================================================================
// OBE (Outcome-Based Education) STORE
// ============================================================================
// Zustand store for managing OBE-related state across the application

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CourseOutcome, ExamQuestion } from "../services/obe.schema";

interface OBEState {
  // Subject filters
  selectedSubjectId: number | null;
  selectedGrade: number | null;

  // Exam drill-down state
  expandedExamId: number | null;
  expandedClassId: number | null;
  selectedSubjectExamId: number | null;

  // CO management
  coEditDialogOpen: boolean;
  selectedCO: CourseOutcome | null;

  // Question mapping
  questionEditDialogOpen: boolean;
  selectedQuestion: ExamQuestion | null;

  // Attainment view
  attainmentView: "student" | "class" | "subject";
  attainmentFilters: {
    classId: number | null;
    examId: number | null;
    subjectId: number | null;
    studentId: number | null;
  };

  // Actions - Subject
  setSelectedSubject: (id: number | null) => void;
  setSelectedGrade: (grade: number | null) => void;

  // Actions - Exam drill-down
  setExpandedExam: (examId: number | null) => void;
  setExpandedClass: (classId: number | null) => void;
  setSelectedSubjectExam: (subjectExamId: number | null) => void;

  // Actions - CO management
  openCOEditDialog: (co?: CourseOutcome) => void;
  closeCOEditDialog: () => void;

  // Actions - Question mapping
  openQuestionEditDialog: (question?: ExamQuestion) => void;
  closeQuestionEditDialog: () => void;

  // Actions - Attainment
  setAttainmentView: (view: "student" | "class" | "subject") => void;
  setAttainmentFilters: (filters: Partial<OBEState["attainmentFilters"]>) => void;
  clearAttainmentFilters: () => void;

  // Reset
  resetOBEState: () => void;
}

const initialAttainmentFilters = {
  classId: null,
  examId: null,
  subjectId: null,
  studentId: null,
};

export const useOBEStore = create<OBEState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedSubjectId: null,
      selectedGrade: null,
      expandedExamId: null,
      expandedClassId: null,
      selectedSubjectExamId: null,
      coEditDialogOpen: false,
      selectedCO: null,
      questionEditDialogOpen: false,
      selectedQuestion: null,
      attainmentView: "class",
      attainmentFilters: { ...initialAttainmentFilters },

      // Subject actions
      setSelectedSubject: (id) =>
        set({ selectedSubjectId: id, selectedGrade: null }, false, "setSelectedSubject"),

      setSelectedGrade: (grade) =>
        set({ selectedGrade: grade }, false, "setSelectedGrade"),

      // Exam drill-down actions
      setExpandedExam: (examId) =>
        set(
          { expandedExamId: examId, expandedClassId: null, selectedSubjectExamId: null },
          false,
          "setExpandedExam"
        ),

      setExpandedClass: (classId) =>
        set(
          { expandedClassId: classId, selectedSubjectExamId: null },
          false,
          "setExpandedClass"
        ),

      setSelectedSubjectExam: (subjectExamId) =>
        set({ selectedSubjectExamId: subjectExamId }, false, "setSelectedSubjectExam"),

      // CO management actions
      openCOEditDialog: (co) =>
        set(
          { coEditDialogOpen: true, selectedCO: co || null },
          false,
          "openCOEditDialog"
        ),

      closeCOEditDialog: () =>
        set(
          { coEditDialogOpen: false, selectedCO: null },
          false,
          "closeCOEditDialog"
        ),

      // Question mapping actions
      openQuestionEditDialog: (question) =>
        set(
          { questionEditDialogOpen: true, selectedQuestion: question || null },
          false,
          "openQuestionEditDialog"
        ),

      closeQuestionEditDialog: () =>
        set(
          { questionEditDialogOpen: false, selectedQuestion: null },
          false,
          "closeQuestionEditDialog"
        ),

      // Attainment actions
      setAttainmentView: (view) =>
        set({ attainmentView: view }, false, "setAttainmentView"),

      setAttainmentFilters: (filters) =>
        set(
          (state) => ({
            attainmentFilters: { ...state.attainmentFilters, ...filters },
          }),
          false,
          "setAttainmentFilters"
        ),

      clearAttainmentFilters: () =>
        set(
          { attainmentFilters: { ...initialAttainmentFilters } },
          false,
          "clearAttainmentFilters"
        ),

      // Reset
      resetOBEState: () =>
        set(
          {
            selectedSubjectId: null,
            selectedGrade: null,
            expandedExamId: null,
            expandedClassId: null,
            selectedSubjectExamId: null,
            coEditDialogOpen: false,
            selectedCO: null,
            questionEditDialogOpen: false,
            selectedQuestion: null,
            attainmentView: "class",
            attainmentFilters: { ...initialAttainmentFilters },
          },
          false,
          "resetOBEState"
        ),
    }),
    { name: "OBEStore" }
  )
);
