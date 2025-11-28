// ============================================================================
// BUDGET STORE - Zustand State Management
// ============================================================================
// Global state management for the Budget module
// Handles UI state, filters, and selected items
// ============================================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { BudgetStatus, BudgetHealth, Priority } from "../services/budget.schema";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BudgetFiltersState {
  status: BudgetStatus | "all";
  health: BudgetHealth | "all";
  eventType: string | "all";
  coordinatorId: number | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  searchQuery: string;
}

export interface TransactionFiltersState {
  type: string | "all";
  category: string | "all";
  status: string | "all";
  dateRange: {
    start: string | null;
    end: string | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchQuery: string;
}

export interface ApprovalFiltersState {
  status: string | "all";
  type: string | "all";
  priority: Priority | "all";
  dateRange: {
    start: string | null;
    end: string | null;
  };
  searchQuery: string;
}

export interface BudgetUIState {
  // Selected items
  selectedBudgetId: string | null;
  selectedTransactionId: string | null;
  selectedApprovalId: string | null;

  // View preferences
  budgetListView: "grid" | "list";
  transactionListView: "table" | "cards";

  // Sidebar & panels
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  filterPanelOpen: boolean;

  // Filters
  budgetFilters: BudgetFiltersState;
  transactionFilters: TransactionFiltersState;
  approvalFilters: ApprovalFiltersState;

  // Dialogs
  dialogs: {
    createBudget: boolean;
    editBudget: boolean;
    deleteBudget: boolean;
    createTransaction: boolean;
    transactionDetail: boolean;
    createApproval: boolean;
    processApproval: boolean;
    logPettyExpense: boolean;
    reloadPettyWallet: boolean;
    generateReport: boolean;
    exportData: boolean;
    settings: boolean;
  };

  // Snackbar / Toast
  notification: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  } | null;
}

export interface BudgetStoreActions {
  // Selection actions
  setSelectedBudgetId: (id: string | null) => void;
  setSelectedTransactionId: (id: string | null) => void;
  setSelectedApprovalId: (id: string | null) => void;

  // View actions
  setBudgetListView: (view: "grid" | "list") => void;
  setTransactionListView: (view: "table" | "cards") => void;
  toggleSidebar: () => void;
  setDetailPanelOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;

  // Filter actions
  setBudgetFilters: (filters: Partial<BudgetFiltersState>) => void;
  resetBudgetFilters: () => void;
  setTransactionFilters: (filters: Partial<TransactionFiltersState>) => void;
  resetTransactionFilters: () => void;
  setApprovalFilters: (filters: Partial<ApprovalFiltersState>) => void;
  resetApprovalFilters: () => void;

  // Dialog actions
  openDialog: (dialog: keyof BudgetUIState["dialogs"]) => void;
  closeDialog: (dialog: keyof BudgetUIState["dialogs"]) => void;
  closeAllDialogs: () => void;

  // Notification actions
  showNotification: (message: string, severity?: "success" | "error" | "warning" | "info") => void;
  hideNotification: () => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const defaultBudgetFilters: BudgetFiltersState = {
  status: "all",
  health: "all",
  eventType: "all",
  coordinatorId: null,
  dateRange: { start: null, end: null },
  searchQuery: "",
};

const defaultTransactionFilters: TransactionFiltersState = {
  type: "all",
  category: "all",
  status: "all",
  dateRange: { start: null, end: null },
  amountRange: { min: null, max: null },
  searchQuery: "",
};

const defaultApprovalFilters: ApprovalFiltersState = {
  status: "all",
  type: "all",
  priority: "all",
  dateRange: { start: null, end: null },
  searchQuery: "",
};

const defaultDialogs: BudgetUIState["dialogs"] = {
  createBudget: false,
  editBudget: false,
  deleteBudget: false,
  createTransaction: false,
  transactionDetail: false,
  createApproval: false,
  processApproval: false,
  logPettyExpense: false,
  reloadPettyWallet: false,
  generateReport: false,
  exportData: false,
  settings: false,
};

const initialState: BudgetUIState = {
  selectedBudgetId: null,
  selectedTransactionId: null,
  selectedApprovalId: null,
  budgetListView: "grid",
  transactionListView: "table",
  sidebarCollapsed: false,
  detailPanelOpen: false,
  filterPanelOpen: false,
  budgetFilters: defaultBudgetFilters,
  transactionFilters: defaultTransactionFilters,
  approvalFilters: defaultApprovalFilters,
  dialogs: defaultDialogs,
  notification: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useBudgetStore = create<BudgetUIState & BudgetStoreActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Selection actions
        setSelectedBudgetId: (id) => set({ selectedBudgetId: id }),
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setSelectedApprovalId: (id) => set({ selectedApprovalId: id }),

        // View actions
        setBudgetListView: (view) => set({ budgetListView: view }),
        setTransactionListView: (view) => set({ transactionListView: view }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
        setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),

        // Filter actions
        setBudgetFilters: (filters) =>
          set((state) => ({
            budgetFilters: { ...state.budgetFilters, ...filters }
          })),
        resetBudgetFilters: () => set({ budgetFilters: defaultBudgetFilters }),

        setTransactionFilters: (filters) =>
          set((state) => ({
            transactionFilters: { ...state.transactionFilters, ...filters }
          })),
        resetTransactionFilters: () => set({ transactionFilters: defaultTransactionFilters }),

        setApprovalFilters: (filters) =>
          set((state) => ({
            approvalFilters: { ...state.approvalFilters, ...filters }
          })),
        resetApprovalFilters: () => set({ approvalFilters: defaultApprovalFilters }),

        // Dialog actions
        openDialog: (dialog) =>
          set((state) => ({
            dialogs: { ...state.dialogs, [dialog]: true }
          })),
        closeDialog: (dialog) =>
          set((state) => ({
            dialogs: { ...state.dialogs, [dialog]: false }
          })),
        closeAllDialogs: () => set({ dialogs: defaultDialogs }),

        // Notification actions
        showNotification: (message, severity = "info") =>
          set({ notification: { open: true, message, severity } }),
        hideNotification: () => set({ notification: null }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: "budget-store",
        partialize: (state) => ({
          budgetListView: state.budgetListView,
          transactionListView: state.transactionListView,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: "BudgetStore" }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useBudgetSelection = () =>
  useBudgetStore((state) => ({
    selectedBudgetId: state.selectedBudgetId,
    selectedTransactionId: state.selectedTransactionId,
    selectedApprovalId: state.selectedApprovalId,
    setSelectedBudgetId: state.setSelectedBudgetId,
    setSelectedTransactionId: state.setSelectedTransactionId,
    setSelectedApprovalId: state.setSelectedApprovalId,
  }));

export const useBudgetFilters = () =>
  useBudgetStore((state) => ({
    filters: state.budgetFilters,
    setFilters: state.setBudgetFilters,
    resetFilters: state.resetBudgetFilters,
  }));

export const useTransactionFilters = () =>
  useBudgetStore((state) => ({
    filters: state.transactionFilters,
    setFilters: state.setTransactionFilters,
    resetFilters: state.resetTransactionFilters,
  }));

export const useApprovalFilters = () =>
  useBudgetStore((state) => ({
    filters: state.approvalFilters,
    setFilters: state.setApprovalFilters,
    resetFilters: state.resetApprovalFilters,
  }));

export const useBudgetDialogs = () =>
  useBudgetStore((state) => ({
    dialogs: state.dialogs,
    openDialog: state.openDialog,
    closeDialog: state.closeDialog,
    closeAllDialogs: state.closeAllDialogs,
  }));

export const useBudgetNotification = () =>
  useBudgetStore((state) => ({
    notification: state.notification,
    showNotification: state.showNotification,
    hideNotification: state.hideNotification,
  }));

export const useBudgetViewPreferences = () =>
  useBudgetStore((state) => ({
    budgetListView: state.budgetListView,
    transactionListView: state.transactionListView,
    sidebarCollapsed: state.sidebarCollapsed,
    detailPanelOpen: state.detailPanelOpen,
    filterPanelOpen: state.filterPanelOpen,
    setBudgetListView: state.setBudgetListView,
    setTransactionListView: state.setTransactionListView,
    toggleSidebar: state.toggleSidebar,
    setDetailPanelOpen: state.setDetailPanelOpen,
    setFilterPanelOpen: state.setFilterPanelOpen,
  }));
