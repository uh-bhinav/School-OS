import { create } from "zustand";

interface ExamFilters {
  academic_year_id: number;
  class_id: number;
  section: string;
  exam_type_id?: number;
}

interface ExamStore {
  filters: ExamFilters;
  setFilters: (filters: Partial<ExamFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ExamFilters = {
  academic_year_id: 2025,
  class_id: 8,
  section: "A",
  exam_type_id: undefined,
};

export const useExamStore = create<ExamStore>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
