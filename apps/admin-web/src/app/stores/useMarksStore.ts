import { create } from "zustand";

interface MarksStore {
  classId: number | null;
  section: string | null;
  examId: number | null;
  subjectId: number | null;
  setFilter: (key: string, value: any) => void;
}

export const useMarksStore = create<MarksStore>((set) => ({
  classId: null,
  section: null,
  examId: null,
  subjectId: null,
  setFilter: (key, value) => set(() => ({ [key]: value })),
}));
