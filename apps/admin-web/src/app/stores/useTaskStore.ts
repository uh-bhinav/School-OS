// ============================================================================
// TASK MANAGER ZUSTAND STORE
// ============================================================================
// Global state management for Task Manager module
// ============================================================================

import { create } from "zustand";
import type { Task, TaskFilters } from "../mockDataProviders/mockTasks";

// ============================================================================
// TYPES
// ============================================================================

interface TaskStore {
  // Current task being viewed/edited
  currentTask: Task | null;

  // Filter state
  filters: TaskFilters;

  // Modal states
  isCreateModalOpen: boolean;
  isDetailsModalOpen: boolean;

  // Loading states
  isLoading: boolean;

  // Actions - Task Selection
  setCurrentTask: (task: Task | null) => void;

  // Actions - Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailsModal: (task: Task) => void;
  closeDetailsModal: () => void;

  // Actions - Filters
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;

  // Reset all state
  reset: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  currentTask: null,
  filters: {},
  isCreateModalOpen: false,
  isDetailsModalOpen: false,
  isLoading: false,

  // ============================================================================
  // TASK SELECTION ACTIONS
  // ============================================================================

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  // ============================================================================
  // MODAL ACTIONS
  // ============================================================================

  openCreateModal: () => {
    set({ isCreateModalOpen: true });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
  },

  openDetailsModal: (task) => {
    set({ currentTask: task, isDetailsModalOpen: true });
  },

  closeDetailsModal: () => {
    set({ isDetailsModalOpen: false });
  },

  // ============================================================================
  // FILTER ACTIONS
  // ============================================================================

  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...newFilters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  // ============================================================================
  // LOADING ACTIONS
  // ============================================================================

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // ============================================================================
  // RESET
  // ============================================================================

  reset: () => {
    set({
      currentTask: null,
      filters: {},
      isCreateModalOpen: false,
      isDetailsModalOpen: false,
      isLoading: false,
    });

    console.log(`[TASK STORE] Reset all state`);
  },
}));
