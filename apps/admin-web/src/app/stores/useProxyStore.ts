import { create } from "zustand";
import type { DayOfWeek } from "../services/timetable.schema";

// ============================================================================
// TYPES
// ============================================================================

export interface AbsentTeacherInfo {
  teacherId: number;
  teacherName: string;
  subject: string;
  classId: number;
  section: string;
  date: string; // ISO date string
  day: DayOfWeek;
  periodNo: number;
  periodTime: string; // e.g., "09:40–10:25"
  reason?: string;
  entryId: number; // The timetable entry ID for this period
}

export interface ProxyAssignment {
  id: string;
  absentTeacherId: number;
  absentTeacherName: string;
  substituteTeacherId: number;
  substituteTeacherName: string;
  subject: string;
  classId: number;
  section: string;
  date: string;
  day: DayOfWeek;
  periodNo: number;
  periodTime: string;
  entryId: number;
  assignedAt: string;
}

interface ProxyStore {
  // Current absence being handled
  currentAbsence: AbsentTeacherInfo | null;

  // All proxy assignments (persisted during session)
  assignments: ProxyAssignment[];

  // Modal states
  isAbsentModalOpen: boolean;
  isSuccessModalOpen: boolean;
  lastAssignment: ProxyAssignment | null;

  // Actions
  setAbsenceInformation: (absence: AbsentTeacherInfo) => void;
  clearAbsence: () => void;
  assignProxyTeacher: (substituteTeacherId: number, substituteTeacherName: string) => ProxyAssignment;
  removeAssignment: (assignmentId: string) => void;
  getAssignments: () => ProxyAssignment[];
  getAssignmentForEntry: (entryId: number, date: string) => ProxyAssignment | undefined;

  // Modal actions
  openAbsentModal: (absence: AbsentTeacherInfo) => void;
  closeAbsentModal: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;

  // Reset all state
  reset: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useProxyStore = create<ProxyStore>((set, get) => ({
  // Initial state
  currentAbsence: null,
  assignments: [],
  isAbsentModalOpen: false,
  isSuccessModalOpen: false,
  lastAssignment: null,

  // Set absence information for the current flow
  setAbsenceInformation: (absence) => {
    set({ currentAbsence: absence });
  },

  // Clear current absence
  clearAbsence: () => {
    set({ currentAbsence: null });
  },

  // Assign a proxy teacher to the current absence
  assignProxyTeacher: (substituteTeacherId, substituteTeacherName) => {
    const state = get();
    const absence = state.currentAbsence;

    if (!absence) {
      throw new Error("No absence information set. Call setAbsenceInformation first.");
    }

    // Create new assignment
    const newAssignment: ProxyAssignment = {
      id: `proxy-${absence.entryId}-${Date.now()}`,
      absentTeacherId: absence.teacherId,
      absentTeacherName: absence.teacherName,
      substituteTeacherId,
      substituteTeacherName,
      subject: absence.subject,
      classId: absence.classId,
      section: absence.section,
      date: absence.date,
      day: absence.day,
      periodNo: absence.periodNo,
      periodTime: absence.periodTime,
      entryId: absence.entryId,
      assignedAt: new Date().toISOString(),
    };

    // Remove any existing assignment for the same entry/date
    const filteredAssignments = state.assignments.filter(
      (a) => !(a.entryId === absence.entryId && a.date === absence.date)
    );

    set({
      assignments: [...filteredAssignments, newAssignment],
      lastAssignment: newAssignment,
      currentAbsence: null, // Clear after assignment
    });

    console.log(`[PROXY STORE] Assigned ${substituteTeacherName} as substitute for ${absence.teacherName}`);
    return newAssignment;
  },

  // Remove an assignment
  removeAssignment: (assignmentId) => {
    const state = get();
    set({
      assignments: state.assignments.filter((a) => a.id !== assignmentId),
    });
  },

  // Get all assignments
  getAssignments: () => {
    return get().assignments;
  },

  // Get assignment for a specific timetable entry on a specific date
  getAssignmentForEntry: (entryId, date) => {
    const state = get();
    return state.assignments.find(
      (a) => a.entryId === entryId && a.date === date
    );
  },

  // Modal actions
  openAbsentModal: (absence) => {
    set({ currentAbsence: absence, isAbsentModalOpen: true });
  },

  closeAbsentModal: () => {
    set({ isAbsentModalOpen: false });
  },

  openSuccessModal: () => {
    set({ isSuccessModalOpen: true });
  },

  closeSuccessModal: () => {
    set({ isSuccessModalOpen: false, lastAssignment: null });
  },

  // Reset all state
  reset: () => {
    set({
      currentAbsence: null,
      assignments: [],
      isAbsentModalOpen: false,
      isSuccessModalOpen: false,
      lastAssignment: null,
    });
  },
}));
