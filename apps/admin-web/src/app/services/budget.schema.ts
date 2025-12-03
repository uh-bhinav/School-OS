// ============================================================================
// BUDGET SCHEMA - TYPE DEFINITIONS
// ============================================================================
// TypeScript interfaces and types for the Budget module
// ============================================================================

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export type BudgetStatus = "draft" | "active" | "completed" | "cancelled" | "on-hold";
export type BudgetHealth = "healthy" | "at-risk" | "overspent" | "completed";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "cancelled";
export type TransactionType = "expense" | "refund" | "adjustment";
export type PettyTransactionType = "expense" | "reload";
export type Priority = "low" | "medium" | "high" | "urgent";

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRef {
  id: number;
  name: string;
  role?: string;
  avatar?: string;
}

// ============================================================================
// BUDGET CORE TYPES
// ============================================================================

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  icon?: string;
  color?: string;
}

export interface BudgetTimeline {
  startDate: string;
  endDate: string;
  milestones?: {
    id: string;
    name: string;
    date: string;
    completed: boolean;
  }[];
}

export interface ApprovalRule {
  id: string;
  name: string;
  condition: string;
  approverRole: string;
  autoApprove: boolean;
  order: number;
}

export interface PettyWalletConfig {
  enabled: boolean;
  balance: number;
  monthlyLimit: number;
  transactionLimit: number;
}

export interface Budget extends BaseEntity {
  name: string;
  description: string;
  eventType: string;
  eventDate: string;
  status: BudgetStatus;
  health: BudgetHealth;
  totalBudget: number;
  spent: number;
  remaining: number;
  utilization: number;
  categories: BudgetCategory[];
  timeline: BudgetTimeline;
  coordinator: UserRef;
  approvalRules: ApprovalRule[];
  pettyWallet: PettyWalletConfig;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
}

export interface BudgetSummary {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  status: BudgetStatus;
  health: BudgetHealth;
  totalBudget: number;
  spent: number;
  utilization: number;
  coordinator: UserRef;
}

export interface BudgetFilters {
  status?: BudgetStatus | BudgetStatus[];
  health?: BudgetHealth | BudgetHealth[];
  eventType?: string;
  coordinatorId?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface BudgetKPIs {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  overallUtilization: number;
  onTrack: number;
  atRisk: number;
  overspent: number;
  pendingApprovals: number;
}

// ============================================================================
// BUDGET ACTIVITY TYPES
// ============================================================================

export interface BudgetActivity {
  id: string;
  budgetId: string;
  budgetName: string;
  type: "expense" | "approval" | "alert" | "update" | "milestone";
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  user?: UserRef;
  metadata?: Record<string, unknown>;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  budgetName: string;
  type: "overspend" | "threshold" | "pending_approval" | "deadline" | "low_petty";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface TransactionLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  categoryId?: string;
}

export interface BudgetTransaction extends BaseEntity {
  budgetId: string;
  type: TransactionType;
  referenceNumber: string;
  vendor: {
    id?: string;
    name: string;
    contact?: string;
  };
  description: string;
  category: string;
  amount: number;
  tax?: number;
  totalAmount: number;
  lineItems: TransactionLineItem[];
  date: string;
  dueDate?: string;
  paymentStatus: "pending" | "paid" | "partial";
  paymentMethod?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  loggedBy: UserRef;
  approvedBy?: UserRef;
}

export interface TransactionFilters {
  budgetId?: string;
  type?: TransactionType;
  category?: string;
  vendor?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  byCategory: { category: string; amount: number; count: number }[];
  byVendor: { vendor: string; amount: number; count: number }[];
  byPaymentStatus: { status: string; amount: number; count: number }[];
}

// ============================================================================
// APPROVAL TYPES
// ============================================================================

export interface BudgetApproval extends BaseEntity {
  budgetId: string;
  budgetName: string;
  requestNumber: string;
  type: "purchase" | "expense" | "budget_change" | "petty_reload";
  title: string;
  description: string;
  vendor?: {
    id?: string;
    name: string;
  };
  amount: number;
  category: string;
  priority: Priority;
  status: ApprovalStatus;
  requestedBy: UserRef;
  requestedAt: string;
  currentApprover?: UserRef;
  approvalChain: {
    order: number;
    approver: UserRef;
    status: ApprovalStatus;
    actionAt?: string;
    comments?: string;
  }[];
  dueDate?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  justification?: string;
  notes?: string;
}

export interface ApprovalFilters {
  budgetId?: string;
  status?: ApprovalStatus | ApprovalStatus[];
  type?: BudgetApproval["type"];
  priority?: Priority;
  requestedById?: number;
  currentApproverId?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface ApprovalAction {
  action: "approve" | "reject" | "escalate" | "request_info";
  comments?: string;
  escalateTo?: number;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  averageApprovalTime: number;
  byPriority: Record<Priority, number>;
}

// ============================================================================
// PETTY WALLET TYPES
// ============================================================================

export interface PettyWalletTransaction {
  id: string;
  budgetId: string;
  type: PettyTransactionType;
  amount: number;
  description: string;
  category: string;
  paidTo?: string;
  date: string;
  receiptUrl?: string | null;
  loggedBy: UserRef;
  createdAt: string;
}

export interface PettyWalletSummary {
  balance: number;
  monthlyLimit: number;
  thisMonthSpent: number;
  monthlyRemaining: number;
  transactionCount: number;
  lastReloadDate: string | null;
  lowBalanceAlert: boolean;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  | "budget_created"
  | "budget_approved"
  | "budget_rejected"
  | "budget_modified"
  | "budget_completed"
  | "budget_cancelled"
  | "category_added"
  | "category_modified"
  | "category_removed"
  | "expense_logged"
  | "expense_modified"
  | "expense_deleted"
  | "approval_submitted"
  | "approval_approved"
  | "approval_rejected"
  | "approval_escalated"
  | "petty_expense"
  | "petty_reload"
  | "alert_triggered"
  | "settings_changed";

export interface BudgetAuditEntry {
  id: string;
  budgetId: string;
  action: AuditAction;
  description: string;
  performedBy: UserRef;
  timestamp: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface BudgetAuditFilters {
  action?: AuditAction;
  performedBy?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface NotificationPreference {
  event: string;
  enabled: boolean;
  recipients: string[];
}

export interface CategoryDefault {
  name: string;
  icon: string;
  color: string;
}

export interface RolePermission {
  id: string;
  name: string;
  permissions: string[];
}

export interface BudgetSettings {
  general: {
    fiscalYearStart: string;
    defaultCurrency: string;
    currencySymbol: string;
    dateFormat: string;
    autoNumbering: {
      enabled: boolean;
      prefix: string;
      padLength: number;
    };
  };
  approvalWorkflow: {
    enabled: boolean;
    defaultRules: ApprovalRule[];
    escalationEnabled: boolean;
    escalationDays: number;
    reminderFrequency: string;
  };
  notifications: {
    channels: string[];
    preferences: NotificationPreference[];
  };
  alerts: {
    budgetThreshold: number;
    categoryThreshold: number;
    pendingApprovalDays: number;
    pettyLowBalance: number;
  };
  categories: {
    defaults: CategoryDefault[];
    allowCustom: boolean;
    maxCategories: number;
  };
  pettyWallet: {
    enabled: boolean;
    monthlyLimit: number;
    transactionLimit: number;
    requireReceipt: boolean;
    receiptThreshold: number;
    approvalRequired: boolean;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    trackAllChanges: boolean;
    exportFormats: string[];
  };
  permissions: {
    roles: RolePermission[];
  };
  integrations: {
    accounting: {
      enabled: boolean;
      provider: string | null;
      syncFrequency: string;
    };
    banking: {
      enabled: boolean;
      provider: string | null;
    };
    calendar: {
      enabled: boolean;
      provider: string;
      syncEvents: boolean;
    };
  };
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface BudgetReport {
  id: string;
  name: string;
  type:
    | "monthly-summary"
    | "utilization"
    | "vendor-analysis"
    | "budget-expense"
    | "approval-summary"
    | "category-breakdown"
    | "comparison";
  generatedAt: string;
  generatedBy: UserRef;
  period?: {
    start: string;
    end: string;
  };
  budgetId?: string;
  format: "pdf" | "xlsx" | "csv";
  url: string;
  size: number;
}

export interface BudgetReportFilters {
  type?: BudgetReport["type"];
  budgetId?: string;
  startDate?: string;
  endDate?: string;
}

export interface BudgetAnalytics {
  summary: {
    totalBudgetsCount: number;
    activeBudgetsCount: number;
    completedBudgetsCount: number;
    draftBudgetsCount: number;
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    overallUtilization: number;
    onTrackPercentage: number;
    atRiskPercentage: number;
    overspentPercentage: number;
  };
  monthlyTrend: {
    month: string;
    allocated: number;
    spent: number;
  }[];
  categoryBreakdown: {
    category: string;
    allocated: number;
    spent: number;
    utilization: number;
  }[];
  topExpenses: {
    description: string;
    amount: number;
    budgetName: string;
    date: string;
  }[];
  vendorAnalysis: {
    vendor: string;
    totalSpent: number;
    transactionCount: number;
    avgTransactionSize: number;
  }[];
  approvalMetrics: {
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number;
    fastestApproval: number;
    slowestApproval: number;
  };
  budgetHealth: {
    budgetId: string;
    name: string;
    health: BudgetHealth;
    score: number;
  }[];
}

export interface ExpenseBreakdown {
  budgetId: string;
  budgetName: string;
  totalBudget: number;
  totalSpent: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
    percentage: number;
  }[];
}

export interface TrendDataPoint {
  date: string;
  spent: number;
  cumulative: number;
}

// ============================================================================
// FORM TYPES (for mutations)
// ============================================================================

export interface CreateBudgetInput {
  name: string;
  description: string;
  eventType: string;
  eventDate: string;
  totalBudget: number;
  categories: Omit<BudgetCategory, "id" | "spent" | "remaining">[];
  timeline: BudgetTimeline;
  coordinatorId: number;
  pettyWallet?: Partial<PettyWalletConfig>;
  tags?: string[];
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string;
  status?: BudgetStatus;
}

export interface CreateTransactionInput {
  budgetId: string;
  type: TransactionType;
  vendor: { name: string; contact?: string };
  description: string;
  category: string;
  lineItems: Omit<TransactionLineItem, "id">[];
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CreateApprovalInput {
  budgetId: string;
  type: BudgetApproval["type"];
  title: string;
  description: string;
  vendor?: { name: string };
  amount: number;
  category: string;
  priority: Priority;
  justification?: string;
  dueDate?: string;
}

export interface LogPettyExpenseInput {
  budgetId: string;
  amount: number;
  description: string;
  category: string;
  paidTo?: string;
  date?: string;
  receiptUrl?: string;
}

// ============================================================================
// ZOD SCHEMAS (for form validation)
// ============================================================================

export const budgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  allocated: z.number().min(0, "Allocated amount must be non-negative"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(100),
  description: z.string().max(500).optional(),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  totalBudget: z.number().min(1, "Total budget must be greater than 0"),
  categories: z.array(budgetCategorySchema).min(1, "At least one category is required"),
  timeline: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  }),
  coordinatorId: z.number().min(1, "Coordinator is required"),
  tags: z.array(z.string()).optional(),
});

export const createTransactionSchema = z.object({
  budgetId: z.string().min(1, "Budget is required"),
  type: z.enum(["expense", "refund", "adjustment"]),
  vendor: z.object({
    name: z.string().min(1, "Vendor name is required"),
    contact: z.string().optional(),
  }),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ).min(1, "At least one line item is required"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const createApprovalSchema = z.object({
  budgetId: z.string().min(1, "Budget is required"),
  type: z.enum(["purchase", "expense", "budget_change", "petty_reload"]),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  vendor: z.object({
    name: z.string().min(1, "Vendor name is required"),
  }).optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  justification: z.string().optional(),
  dueDate: z.string().optional(),
});

export const logPettyExpenseSchema = z.object({
  budgetId: z.string().min(1, "Budget is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  paidTo: z.string().optional(),
  date: z.string().optional(),
  receiptUrl: z.string().url().optional(),
});

export const approvalActionSchema = z.object({
  action: z.enum(["approve", "reject", "escalate", "request_info"]),
  comments: z.string().optional(),
  escalateTo: z.number().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type CreateApprovalFormData = z.infer<typeof createApprovalSchema>;
export type LogPettyExpenseFormData = z.infer<typeof logPettyExpenseSchema>;
export type ApprovalActionFormData = z.infer<typeof approvalActionSchema>;
