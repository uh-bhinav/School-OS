// ============================================================================
// BUDGET API SERVICE
// ============================================================================
// API functions for the Budget module
// Uses mock data providers, can be swapped to real API endpoints
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

import { isDemoMode } from "../mockDataProviders";

import {
  mockBudgetsProvider,
  mockBudgetTransactionsProvider,
  mockBudgetApprovalsProvider,
  mockPettyWalletProvider,
  mockBudgetAuditProvider,
  mockBudgetSettingsProvider,
  mockBudgetReportsProvider,
} from "../mockDataProviders/finance/budgets";

// ============================================================================
// FILTER INTERFACES
// ============================================================================

export interface BudgetListFilters {
  status?: string;
  type?: string;
  category?: string;
  coordinatorId?: number;
  search?: string;
}

export interface TransactionFilters {
  type?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ApprovalFilters {
  budgetId?: string;
  status?: string;
  type?: string;
  priority?: string;
}

export interface ApprovalAction {
  action: "approve" | "reject" | "request_info" | "escalate";
  comments?: string;
  escalateTo?: number;
}

export interface BudgetAuditFilters {
  action?: string;
  performedBy?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface BudgetReportFilters {
  type?: string;
  budgetId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// BUDGET CORE API
// ============================================================================

export async function getBudgets(filters?: BudgetListFilters): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getBudgets(filters);
  }
  return mockBudgetsProvider.getBudgets(filters);
}

export async function getBudgetById(id: string): Promise<any | null> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getBudgetById(id);
  }
  return mockBudgetsProvider.getBudgetById(id);
}

export async function createBudget(data: any): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetsProvider.createBudget(data);
  }
  return mockBudgetsProvider.createBudget(data);
}

export async function updateBudget(id: string, data: any): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetsProvider.updateBudget(id, data);
  }
  return mockBudgetsProvider.updateBudget(id, data);
}

export async function deleteBudget(_id: string): Promise<void> {
  // In demo mode, just simulate delay - actual deletion would happen in real API
  await new Promise(resolve => setTimeout(resolve, 500));
}

export async function getBudgetKPIs(): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getKPIs();
  }
  return mockBudgetsProvider.getKPIs();
}

export async function getBudgetActivities(budgetId: string, limit?: number): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getActivities(budgetId, limit);
  }
  return mockBudgetsProvider.getActivities(budgetId, limit);
}

export async function getAllBudgetActivities(limit?: number): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getAllActivities(limit);
  }
  return mockBudgetsProvider.getAllActivities(limit);
}

export async function getBudgetAlerts(budgetId: string): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getAlerts(budgetId);
  }
  return mockBudgetsProvider.getAlerts(budgetId);
}

export async function getAllBudgetAlerts(): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetsProvider.getAllAlerts();
  }
  return mockBudgetsProvider.getAllAlerts();
}

// ============================================================================
// TRANSACTION API
// ============================================================================

export async function getBudgetTransactions(
  budgetId: string,
  filters?: TransactionFilters
): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetTransactionsProvider.getTransactions(budgetId, filters);
  }
  return mockBudgetTransactionsProvider.getTransactions(budgetId, filters);
}

export async function getTransactionById(
  budgetId: string,
  transactionId: string
): Promise<any | null> {
  if (isDemoMode()) {
    return mockBudgetTransactionsProvider.getTransactionById(budgetId, transactionId);
  }
  return mockBudgetTransactionsProvider.getTransactionById(budgetId, transactionId);
}

export async function createTransaction(
  budgetId: string,
  data: any
): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetTransactionsProvider.createTransaction(budgetId, data);
  }
  return mockBudgetTransactionsProvider.createTransaction(budgetId, data);
}

// ============================================================================
// APPROVAL API
// ============================================================================

export async function getApprovals(budgetId: string, filters?: ApprovalFilters): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetApprovalsProvider.getApprovals(budgetId, filters);
  }
  return mockBudgetApprovalsProvider.getApprovals(budgetId, filters);
}

export async function getBudgetApprovals(budgetId: string): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetApprovalsProvider.getApprovals(budgetId);
  }
  return mockBudgetApprovalsProvider.getApprovals(budgetId);
}

export async function getPendingApprovals(): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetApprovalsProvider.getAllPending();
  }
  return mockBudgetApprovalsProvider.getAllPending();
}

export async function createApprovalRequest(budgetId: string, data: any): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetApprovalsProvider.createPurchaseRequest(budgetId, data);
  }
  return mockBudgetApprovalsProvider.createPurchaseRequest(budgetId, data);
}

export async function processApproval(
  budgetId: string,
  approvalId: string,
  action: ApprovalAction
): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetApprovalsProvider.processApproval(budgetId, approvalId, action);
  }
  return mockBudgetApprovalsProvider.processApproval(budgetId, approvalId, action);
}

// ============================================================================
// PETTY WALLET API
// ============================================================================

export async function getPettyTransactions(budgetId: string): Promise<any[]> {
  if (isDemoMode()) {
    return mockPettyWalletProvider.getTransactions(budgetId);
  }
  return mockPettyWalletProvider.getTransactions(budgetId);
}

export async function getPettySummary(budgetId: string): Promise<any> {
  if (isDemoMode()) {
    return mockPettyWalletProvider.getSummary(budgetId);
  }
  return mockPettyWalletProvider.getSummary(budgetId);
}

export async function logPettyExpense(budgetId: string, data: any): Promise<any> {
  if (isDemoMode()) {
    return mockPettyWalletProvider.logExpense(budgetId, data);
  }
  return mockPettyWalletProvider.logExpense(budgetId, data);
}

export async function reloadPettyWallet(budgetId: string, amount: number): Promise<any> {
  if (isDemoMode()) {
    return mockPettyWalletProvider.reload(budgetId, amount);
  }
  return mockPettyWalletProvider.reload(budgetId, amount);
}

// ============================================================================
// AUDIT API
// ============================================================================

export async function getAuditLog(
  budgetId?: string,
  filters?: BudgetAuditFilters
): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetAuditProvider.getLog(budgetId, filters);
  }
  return mockBudgetAuditProvider.getLog(budgetId, filters);
}

export async function getAuditStats(budgetId: string): Promise<{
  totalActions: number;
  byAction: Record<string, number>;
  byUser: { userId: number; name: string; count: number }[];
  recentActivity: number;
}> {
  if (isDemoMode()) {
    return mockBudgetAuditProvider.getStats(budgetId);
  }
  return mockBudgetAuditProvider.getStats(budgetId);
}

export async function exportAuditLog(
  budgetId: string,
  format: "csv" | "pdf"
): Promise<{ url: string }> {
  if (isDemoMode()) {
    return mockBudgetAuditProvider.export(budgetId, format);
  }
  return mockBudgetAuditProvider.export(budgetId, format);
}

// ============================================================================
// SETTINGS API
// ============================================================================

export async function getBudgetSettings(): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.getSettings();
  }
  return mockBudgetSettingsProvider.getSettings();
}

export async function updateBudgetSettings(updates: any): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.updateSettings(updates);
  }
  return mockBudgetSettingsProvider.updateSettings(updates);
}

export async function getApprovalRules(budgetId?: string): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.getApprovalRules(budgetId);
  }
  return mockBudgetSettingsProvider.getApprovalRules(budgetId);
}

export async function updateApprovalRules(budgetId: string, rules: any[]): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.updateApprovalRules(budgetId, rules);
  }
  return mockBudgetSettingsProvider.updateApprovalRules(budgetId, rules);
}

export async function getNotificationPreferences(): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.getNotificationPreferences();
  }
  return mockBudgetSettingsProvider.getNotificationPreferences();
}

export async function updateNotificationPreference(event: string, updates: any): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetSettingsProvider.updateNotificationPreference(event, updates);
  }
  return mockBudgetSettingsProvider.updateNotificationPreference(event, updates);
}

// ============================================================================
// REPORTS API
// ============================================================================

export async function getBudgetAnalytics(filters?: BudgetReportFilters): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.getAnalytics(filters);
  }
  return mockBudgetReportsProvider.getAnalytics(filters);
}

export async function getExpenseBreakdown(budgetId?: string): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.getExpenseBreakdown(budgetId);
  }
  return mockBudgetReportsProvider.getExpenseBreakdown(budgetId);
}

export async function getTrendData(
  budgetId?: string,
  period?: { start: string; end: string }
): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.getTrendData(budgetId, period);
  }
  return mockBudgetReportsProvider.getTrendData(budgetId, period);
}

export async function getReports(filters?: BudgetReportFilters): Promise<any[]> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.getReports(filters);
  }
  return mockBudgetReportsProvider.getReports(filters);
}

export async function generateReport(
  type: string,
  options: {
    budgetId?: string;
    period?: { start: string; end: string };
    format: "pdf" | "xlsx" | "csv";
  }
): Promise<any> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.generateReport(type, options);
  }
  return mockBudgetReportsProvider.generateReport(type, options);
}

export async function downloadReport(reportId: string): Promise<{ url: string }> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.downloadReport(reportId);
  }
  return mockBudgetReportsProvider.downloadReport(reportId);
}

export async function deleteReport(reportId: string): Promise<void> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.deleteReport(reportId);
  }
  return mockBudgetReportsProvider.deleteReport(reportId);
}

export async function getComparativeAnalysis(budgetIds: string[]): Promise<{
  budgets: { id: string; name: string; utilization: number }[];
  categoryComparison: { category: string; values: { budgetId: string; value: number }[] }[];
}> {
  if (isDemoMode()) {
    return mockBudgetReportsProvider.getComparativeAnalysis(budgetIds);
  }
  return mockBudgetReportsProvider.getComparativeAnalysis(budgetIds);
}
