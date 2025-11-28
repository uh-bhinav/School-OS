// ============================================================================
// BUDGET HOOKS - React Query Hooks
// ============================================================================
// Custom hooks for budget data fetching and mutations
// Uses React Query for caching and state management
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetKPIs,
  getBudgetActivities,
  getAllBudgetActivities,
  getBudgetAlerts,
  getAllBudgetAlerts,
  getBudgetTransactions,
  getTransactionById,
  createTransaction,
  getApprovals,
  getBudgetApprovals,
  getPendingApprovals,
  createApprovalRequest,
  processApproval,
  getPettyTransactions,
  getPettySummary,
  logPettyExpense,
  reloadPettyWallet,
  getAuditLog,
  getAuditStats,
  exportAuditLog,
  getBudgetSettings,
  updateBudgetSettings,
  getApprovalRules,
  updateApprovalRules,
  getNotificationPreferences,
  updateNotificationPreference,
  getBudgetAnalytics,
  getExpenseBreakdown,
  getTrendData,
  getReports,
  generateReport,
  downloadReport,
  deleteReport,
  getComparativeAnalysis,
  type BudgetListFilters,
  type TransactionFilters,
  type ApprovalFilters,
  type ApprovalAction,
  type BudgetAuditFilters,
  type BudgetReportFilters,
} from "./budget.api";

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (filters?: BudgetListFilters) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  kpis: () => [...budgetKeys.all, "kpis"] as const,
  activities: (budgetId?: string) => [...budgetKeys.all, "activities", budgetId] as const,
  alerts: (budgetId?: string) => [...budgetKeys.all, "alerts", budgetId] as const,

  // Transactions
  transactions: (budgetId: string) => [...budgetKeys.all, "transactions", budgetId] as const,
  transactionList: (budgetId: string, filters?: TransactionFilters) =>
    [...budgetKeys.transactions(budgetId), "list", filters] as const,
  transactionDetail: (budgetId: string, transactionId: string) =>
    [...budgetKeys.transactions(budgetId), "detail", transactionId] as const,

  // Approvals
  approvals: () => [...budgetKeys.all, "approvals"] as const,
  approvalList: (budgetId: string, filters?: ApprovalFilters) =>
    [...budgetKeys.approvals(), budgetId, filters] as const,
  pendingApprovals: () => [...budgetKeys.approvals(), "pending"] as const,

  // Petty Wallet
  petty: (budgetId: string) => [...budgetKeys.all, "petty", budgetId] as const,
  pettySummary: (budgetId: string) => [...budgetKeys.petty(budgetId), "summary"] as const,
  pettyTransactions: (budgetId: string) => [...budgetKeys.petty(budgetId), "transactions"] as const,

  // Audit
  audit: (budgetId?: string) => [...budgetKeys.all, "audit", budgetId] as const,
  auditStats: (budgetId: string) => [...budgetKeys.audit(budgetId), "stats"] as const,

  // Settings
  settings: () => [...budgetKeys.all, "settings"] as const,
  approvalRules: (budgetId?: string) => [...budgetKeys.settings(), "rules", budgetId] as const,
  notifications: () => [...budgetKeys.settings(), "notifications"] as const,

  // Reports
  reports: () => [...budgetKeys.all, "reports"] as const,
  analytics: (filters?: BudgetReportFilters) => [...budgetKeys.reports(), "analytics", filters] as const,
  expenseBreakdown: (budgetId?: string) => [...budgetKeys.reports(), "breakdown", budgetId] as const,
  trends: (budgetId?: string) => [...budgetKeys.reports(), "trends", budgetId] as const,
  reportList: (filters?: BudgetReportFilters) => [...budgetKeys.reports(), "list", filters] as const,
};

// ============================================================================
// BUDGET CORE HOOKS
// ============================================================================

export function useBudgets(filters?: BudgetListFilters) {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: () => getBudgets(filters),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudgetById(id),
    enabled: !!id,
  });
}

export function useBudgetKPIs() {
  return useQuery({
    queryKey: budgetKeys.kpis(),
    queryFn: getBudgetKPIs,
  });
}

export function useBudgetActivities(budgetId: string, limit?: number) {
  return useQuery({
    queryKey: budgetKeys.activities(budgetId),
    queryFn: () => getBudgetActivities(budgetId, limit),
    enabled: !!budgetId,
  });
}

export function useAllBudgetActivities(limit?: number) {
  return useQuery({
    queryKey: budgetKeys.activities(),
    queryFn: () => getAllBudgetActivities(limit),
  });
}

export function useBudgetAlerts(budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.alerts(budgetId),
    queryFn: () => getBudgetAlerts(budgetId),
    enabled: !!budgetId,
  });
}

export function useAllBudgetAlerts() {
  return useQuery({
    queryKey: budgetKeys.alerts(),
    queryFn: getAllBudgetAlerts,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.kpis() });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.kpis() });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.kpis() });
    },
  });
}

// ============================================================================
// TRANSACTION HOOKS
// ============================================================================

export function useBudgetTransactions(budgetId: string, filters?: TransactionFilters) {
  return useQuery({
    queryKey: budgetKeys.transactionList(budgetId, filters),
    queryFn: () => getBudgetTransactions(budgetId, filters),
    enabled: !!budgetId,
  });
}

export function useTransaction(budgetId: string, transactionId: string) {
  return useQuery({
    queryKey: budgetKeys.transactionDetail(budgetId, transactionId),
    queryFn: () => getTransactionById(budgetId, transactionId),
    enabled: !!budgetId && !!transactionId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: any }) =>
      createTransaction(budgetId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.transactions(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.kpis() });
    },
  });
}

// ============================================================================
// APPROVAL HOOKS
// ============================================================================

export function useApprovals(budgetId: string, filters?: ApprovalFilters) {
  return useQuery({
    queryKey: budgetKeys.approvalList(budgetId, filters),
    queryFn: () => getApprovals(budgetId, filters),
    enabled: !!budgetId,
  });
}

export function useBudgetApprovals(budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.approvalList(budgetId),
    queryFn: () => getBudgetApprovals(budgetId),
    enabled: !!budgetId,
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: budgetKeys.pendingApprovals(),
    queryFn: getPendingApprovals,
  });
}

export function useCreateApprovalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: any }) =>
      createApprovalRequest(budgetId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.approvalList(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.pendingApprovals() });
    },
  });
}

export function useProcessApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, approvalId, action }: { budgetId: string; approvalId: string; action: ApprovalAction }) =>
      processApproval(budgetId, approvalId, action),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.approvalList(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
    },
  });
}

// ============================================================================
// PETTY WALLET HOOKS
// ============================================================================

export function usePettyTransactions(budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.pettyTransactions(budgetId),
    queryFn: () => getPettyTransactions(budgetId),
    enabled: !!budgetId,
  });
}

export function usePettySummary(budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.pettySummary(budgetId),
    queryFn: () => getPettySummary(budgetId),
    enabled: !!budgetId,
  });
}

export function useLogPettyExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: any }) =>
      logPettyExpense(budgetId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.petty(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
    },
  });
}

export function useReloadPettyWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, amount }: { budgetId: string; amount: number }) =>
      reloadPettyWallet(budgetId, amount),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.petty(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
    },
  });
}

// ============================================================================
// AUDIT HOOKS
// ============================================================================

export function useAuditLog(budgetId?: string, filters?: BudgetAuditFilters) {
  return useQuery({
    queryKey: budgetKeys.audit(budgetId),
    queryFn: () => getAuditLog(budgetId, filters),
  });
}

export function useAuditStats(budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.auditStats(budgetId),
    queryFn: () => getAuditStats(budgetId),
    enabled: !!budgetId,
  });
}

export function useExportAuditLog() {
  return useMutation({
    mutationFn: ({ budgetId, format }: { budgetId: string; format: "csv" | "pdf" }) =>
      exportAuditLog(budgetId, format),
  });
}

// ============================================================================
// SETTINGS HOOKS
// ============================================================================

export function useBudgetSettings() {
  return useQuery({
    queryKey: budgetKeys.settings(),
    queryFn: getBudgetSettings,
  });
}

export function useUpdateBudgetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => updateBudgetSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.settings() });
    },
  });
}

export function useApprovalRules(budgetId?: string) {
  return useQuery({
    queryKey: budgetKeys.approvalRules(budgetId),
    queryFn: () => getApprovalRules(budgetId),
  });
}

export function useUpdateApprovalRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, rules }: { budgetId: string; rules: any[] }) =>
      updateApprovalRules(budgetId, rules),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.approvalRules(budgetId) });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: budgetKeys.notifications(),
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ event, updates }: { event: string; updates: any }) =>
      updateNotificationPreference(event, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.notifications() });
    },
  });
}

// ============================================================================
// REPORTS HOOKS
// ============================================================================

export function useBudgetAnalytics(filters?: BudgetReportFilters) {
  return useQuery({
    queryKey: budgetKeys.analytics(filters),
    queryFn: () => getBudgetAnalytics(filters),
  });
}

export function useExpenseBreakdown(budgetId?: string) {
  return useQuery({
    queryKey: budgetKeys.expenseBreakdown(budgetId),
    queryFn: () => getExpenseBreakdown(budgetId),
  });
}

export function useTrendData(budgetId?: string, period?: { start: string; end: string }) {
  return useQuery({
    queryKey: budgetKeys.trends(budgetId),
    queryFn: () => getTrendData(budgetId, period),
  });
}

export function useReports(filters?: BudgetReportFilters) {
  return useQuery({
    queryKey: budgetKeys.reportList(filters),
    queryFn: () => getReports(filters),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      options
    }: {
      type: string;
      options: { budgetId?: string; period?: { start: string; end: string }; format: "pdf" | "xlsx" | "csv" }
    }) => generateReport(type, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.reportList() });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) => downloadReport(reportId),
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.reportList() });
    },
  });
}

export function useComparativeAnalysis(budgetIds: string[]) {
  return useQuery({
    queryKey: [...budgetKeys.reports(), "comparison", budgetIds],
    queryFn: () => getComparativeAnalysis(budgetIds),
    enabled: budgetIds.length > 0,
  });
}
