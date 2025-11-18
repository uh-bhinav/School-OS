import { create } from "zustand";

/**
 * Marks Store - UPDATED FOR BACKEND INTEGRATION
 *
 * Now stores IDs only (not labels) for proper API filtering
 * All filters are nullable - null means "no filter applied"
 *
 * CRITICAL: Store only IDs, never labels like "Class 7" or "Mathematics"
 */
interface MarksStore {
  // Filter values - all IDs
  classId: number | null;
  section: string | null; // Section is actually a string like "A", "B", "C"
  examId: number | null;
  subjectId: number | null;
  studentId: number | null; // Added for student-specific filtering

  // Actions
  setFilter: (key: keyof Omit<MarksStore, 'setFilter' | 'clearFilters' | 'setFilters'>, value: any) => void;
  clearFilters: () => void;
  setFilters: (filters: Partial<Omit<MarksStore, 'setFilter' | 'clearFilters' | 'setFilters'>>) => void;
}

export const useMarksStore = create<MarksStore>((set) => ({
  // Initial state - set default class to show some marks
  classId: 8, // Default to Grade 8
  section: null,
  examId: 1, // Default to first exam
  subjectId: null,
  studentId: null,

  // Set single filter
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),

  // Clear all filters
  clearFilters: () => set({
    classId: null,
    section: null,
    examId: null,
    subjectId: null,
    studentId: null,
  }),

  // Set multiple filters at once
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
}));
