import { create } from "zustand";

export type ViewType = "class" | "teacher" | "resource";

interface TimetableViewState {
  // View state
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Filter state
  selectedClass: string | null;
  selectedSection: string | null;
  selectedTeacher: string | null;
  selectedResource: string | null;
  searchQuery: string;
  showConflictsOnly: boolean;
  highlightFreePeriods: boolean;
  showRoomNumbers: boolean;

  // Setters
  setSelectedClass: (classId: string | null) => void;
  setSelectedSection: (section: string | null) => void;
  setSelectedTeacher: (teacher: string | null) => void;
  setSelectedResource: (resource: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleShowConflictsOnly: () => void;
  toggleHighlightFreePeriods: () => void;
  toggleShowRoomNumbers: () => void;

  // Selected cell for details
  selectedCell: { day: string; period: number } | null;
  setSelectedCell: (cell: { day: string; period: number } | null) => void;

  // Reset filters when switching views
  resetFilters: () => void;
}

export const useTimetableViewStore = create<TimetableViewState>((set) => ({
  currentView: "class",
  setCurrentView: (view) =>
    set({
      currentView: view,
      // Reset entity selection when switching views
      selectedClass: null,
      selectedSection: null,
      selectedTeacher: null,
      selectedResource: null,
    }),

  selectedClass: null,
  selectedSection: null,
  selectedTeacher: null,
  selectedResource: null,
  searchQuery: "",
  showConflictsOnly: false,
  highlightFreePeriods: false,
  showRoomNumbers: true,

  setSelectedClass: (classId) => set({ selectedClass: classId }),
  setSelectedSection: (section) => set({ selectedSection: section }),
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  setSelectedResource: (resource) => set({ selectedResource: resource }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleShowConflictsOnly: () =>
    set((state) => ({ showConflictsOnly: !state.showConflictsOnly })),
  toggleHighlightFreePeriods: () =>
    set((state) => ({ highlightFreePeriods: !state.highlightFreePeriods })),
  toggleShowRoomNumbers: () =>
    set((state) => ({ showRoomNumbers: !state.showRoomNumbers })),

  selectedCell: null,
  setSelectedCell: (cell) => set({ selectedCell: cell }),

  resetFilters: () =>
    set({
      selectedClass: null,
      selectedSection: null,
      selectedTeacher: null,
      selectedResource: null,
      searchQuery: "",
      showConflictsOnly: false,
      highlightFreePeriods: false,
    }),
}));
