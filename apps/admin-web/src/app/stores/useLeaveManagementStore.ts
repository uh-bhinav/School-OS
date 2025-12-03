// ============================================================================
// LEAVE MANAGEMENT ZUSTAND STORE
// ============================================================================
// Global state management for Leave Management and Proxy Assignment
// ============================================================================

import { create } from "zustand";
import type {
  LeaveRequest,
  LeaveProxyPeriod,
  LeaveProxyAssignment,
} from "../services/leaveManagement.schema";

// ============================================================================
// TYPES
// ============================================================================

export interface LeaveProxyWorkflow {
  leaveId: string;
  teacherId: number;
  teacherName: string;
  subject: string;
  fromDate: string;
  toDate: string;
  currentDate: string;
  totalDays: number;
  periods: LeaveProxyPeriod[];
  assignments: LeaveProxyAssignment[];
}

interface LeaveManagementStore {
  // Current leave request being viewed
  currentLeaveRequest: LeaveRequest | null;

  // Proxy workflow state
  proxyWorkflow: LeaveProxyWorkflow | null;

  // Selected period for proxy assignment
  selectedPeriod: LeaveProxyPeriod | null;

  // Modal states
  isDetailsModalOpen: boolean;
  isRejectModalOpen: boolean;
  isProxySuccessModalOpen: boolean;
  isAttachmentViewerOpen: boolean;

  // Last proxy assignment
  lastProxyAssignment: LeaveProxyAssignment | null;

  // Actions - Leave Request
  setCurrentLeaveRequest: (request: LeaveRequest | null) => void;
  openDetailsModal: (request: LeaveRequest) => void;
  closeDetailsModal: () => void;
  openRejectModal: () => void;
  closeRejectModal: () => void;

  // Actions - Attachment Viewer
  openAttachmentViewer: () => void;
  closeAttachmentViewer: () => void;

  // Actions - Proxy Workflow
  startProxyWorkflow: (leave: LeaveRequest, periods: LeaveProxyPeriod[]) => void;
  setProxyWorkflowDate: (date: string, periods: LeaveProxyPeriod[]) => void;
  selectPeriod: (period: LeaveProxyPeriod | null) => void;
  addProxyAssignment: (assignment: LeaveProxyAssignment) => void;
  updatePeriodStatus: (periodNo: number, substituteId: number, substituteName: string) => void;
  clearProxyWorkflow: () => void;

  // Actions - Success Modal
  openProxySuccessModal: (assignment: LeaveProxyAssignment) => void;
  closeProxySuccessModal: () => void;

  // Actions - Check completion
  isAllPeriodsAssigned: () => boolean;
  getPendingPeriodsCount: () => number;

  // Reset all state
  reset: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useLeaveManagementStore = create<LeaveManagementStore>((set, get) => ({
  // Initial state
  currentLeaveRequest: null,
  proxyWorkflow: null,
  selectedPeriod: null,
  isDetailsModalOpen: false,
  isRejectModalOpen: false,
  isProxySuccessModalOpen: false,
  isAttachmentViewerOpen: false,
  lastProxyAssignment: null,

  // ============================================================================
  // LEAVE REQUEST ACTIONS
  // ============================================================================

  setCurrentLeaveRequest: (request) => {
    set({ currentLeaveRequest: request });
  },

  openDetailsModal: (request) => {
    set({ currentLeaveRequest: request, isDetailsModalOpen: true });
  },

  closeDetailsModal: () => {
    set({ isDetailsModalOpen: false });
  },

  openRejectModal: () => {
    set({ isRejectModalOpen: true });
  },

  closeRejectModal: () => {
    set({ isRejectModalOpen: false });
  },

  // ============================================================================
  // ATTACHMENT VIEWER ACTIONS
  // ============================================================================

  openAttachmentViewer: () => {
    set({ isAttachmentViewerOpen: true });
  },

  closeAttachmentViewer: () => {
    set({ isAttachmentViewerOpen: false });
  },

  // ============================================================================
  // PROXY WORKFLOW ACTIONS
  // ============================================================================

  startProxyWorkflow: (leave, periods) => {
    const totalDays = calculateDaysBetween(leave.fromDate, leave.toDate);

    set({
      proxyWorkflow: {
        leaveId: leave.leaveId,
        teacherId: leave.teacherId,
        teacherName: leave.teacherName,
        subject: leave.subject,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        currentDate: leave.fromDate,
        totalDays,
        periods,
        assignments: [],
      },
      currentLeaveRequest: leave,
      isDetailsModalOpen: false,
    });

    console.log(`[LEAVE STORE] Started proxy workflow for leave ${leave.leaveId}`);
  },

  setProxyWorkflowDate: (date, periods) => {
    const state = get();
    if (!state.proxyWorkflow) return;

    set({
      proxyWorkflow: {
        ...state.proxyWorkflow,
        currentDate: date,
        periods,
      },
      selectedPeriod: null,
    });

    console.log(`[LEAVE STORE] Set proxy workflow date to ${date}`);
  },

  selectPeriod: (period) => {
    set({ selectedPeriod: period });
  },

  addProxyAssignment: (assignment) => {
    const state = get();
    if (!state.proxyWorkflow) return;

    set({
      proxyWorkflow: {
        ...state.proxyWorkflow,
        assignments: [...state.proxyWorkflow.assignments, assignment],
      },
      lastProxyAssignment: assignment,
    });

    console.log(`[LEAVE STORE] Added proxy assignment: ${assignment.assignmentId}`);
  },

  updatePeriodStatus: (periodNo, substituteId, substituteName) => {
    const state = get();
    if (!state.proxyWorkflow) return;

    const updatedPeriods = state.proxyWorkflow.periods.map((p) =>
      p.periodNo === periodNo
        ? {
            ...p,
            status: "ASSIGNED" as const,
            substituteTeacherId: substituteId,
            substituteTeacherName: substituteName,
            assignedAt: new Date().toISOString(),
          }
        : p
    );

    set({
      proxyWorkflow: {
        ...state.proxyWorkflow,
        periods: updatedPeriods,
      },
      selectedPeriod: null,
    });

    console.log(`[LEAVE STORE] Updated period ${periodNo} status to ASSIGNED`);
  },

  clearProxyWorkflow: () => {
    set({
      proxyWorkflow: null,
      selectedPeriod: null,
      lastProxyAssignment: null,
    });

    console.log(`[LEAVE STORE] Cleared proxy workflow`);
  },

  // ============================================================================
  // SUCCESS MODAL ACTIONS
  // ============================================================================

  openProxySuccessModal: (assignment) => {
    set({
      isProxySuccessModalOpen: true,
      lastProxyAssignment: assignment,
    });
  },

  closeProxySuccessModal: () => {
    set({ isProxySuccessModalOpen: false });
  },

  // ============================================================================
  // COMPLETION CHECK ACTIONS
  // ============================================================================

  isAllPeriodsAssigned: () => {
    const state = get();
    if (!state.proxyWorkflow) return false;

    const periodsNeedingProxy = state.proxyWorkflow.periods.filter(
      (p) => p.status === "NEEDS_PROXY"
    );
    return periodsNeedingProxy.length === 0;
  },

  getPendingPeriodsCount: () => {
    const state = get();
    if (!state.proxyWorkflow) return 0;

    return state.proxyWorkflow.periods.filter((p) => p.status === "NEEDS_PROXY").length;
  },

  // ============================================================================
  // RESET
  // ============================================================================

  reset: () => {
    set({
      currentLeaveRequest: null,
      proxyWorkflow: null,
      selectedPeriod: null,
      isDetailsModalOpen: false,
      isRejectModalOpen: false,
      isProxySuccessModalOpen: false,
      isAttachmentViewerOpen: false,
      lastProxyAssignment: null,
    });

    console.log(`[LEAVE STORE] Reset all state`);
  },
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDaysBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
