// ============================================================================
// MOCK BUDGET REPORTS DATA PROVIDER
// ============================================================================
// Mock data for budget reports and analytics
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface UserRef {
  id: number;
  name: string;
}

export interface BudgetReport {
  id: string;
  name: string;
  type: string;
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
  type?: string;
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
    health: string;
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
// MOCK DATA
// ============================================================================

export const MOCK_BUDGET_ANALYTICS: BudgetAnalytics = {
  summary: {
    totalBudgetsCount: 6,
    activeBudgetsCount: 3,
    completedBudgetsCount: 2,
    draftBudgetsCount: 1,
    totalAllocated: 525000,
    totalSpent: 189500,
    totalRemaining: 335500,
    overallUtilization: 36.1,
    onTrackPercentage: 83.3,
    atRiskPercentage: 16.7,
    overspentPercentage: 0,
  },
  monthlyTrend: [
    { month: "Jul 2024", allocated: 0, spent: 0 },
    { month: "Aug 2024", allocated: 50000, spent: 15000 },
    { month: "Sep 2024", allocated: 125000, spent: 45000 },
    { month: "Oct 2024", allocated: 275000, spent: 98000 },
    { month: "Nov 2024", allocated: 525000, spent: 189500 },
    { month: "Dec 2024", allocated: 525000, spent: 280000 },
  ],
  categoryBreakdown: [
    { category: "Stage & Venue", allocated: 95000, spent: 45000, utilization: 47.4 },
    { category: "Decorations", allocated: 65000, spent: 32000, utilization: 49.2 },
    { category: "Costumes", allocated: 55000, spent: 25000, utilization: 45.5 },
    { category: "Sound & Lighting", allocated: 40000, spent: 19000, utilization: 47.5 },
    { category: "Catering", allocated: 80000, spent: 28500, utilization: 35.6 },
    { category: "Awards & Prizes", allocated: 60000, spent: 18000, utilization: 30.0 },
    { category: "Equipment", allocated: 35000, spent: 12000, utilization: 34.3 },
    { category: "Miscellaneous", allocated: 95000, spent: 10000, utilization: 10.5 },
  ],
  topExpenses: [
    { description: "LED Screen Rental", amount: 25000, budgetName: "Annual Day 2024-25", date: "2025-11-18" },
    { description: "Costumes Rental", amount: 25000, budgetName: "Annual Day 2024-25", date: "2025-11-20" },
    { description: "Sports Equipment", amount: 18000, budgetName: "Sports Day 2024", date: "2025-11-20" },
    { description: "Stage Materials", amount: 15000, budgetName: "Annual Day 2024-25", date: "2025-11-15" },
    { description: "Trophy Set", amount: 12000, budgetName: "Sports Day 2024", date: "2025-11-22" },
  ],
  vendorAnalysis: [
    { vendor: "Stage Craft Pvt Ltd", totalSpent: 45000, transactionCount: 3, avgTransactionSize: 15000 },
    { vendor: "Fancy Dress World", totalSpent: 25000, transactionCount: 1, avgTransactionSize: 25000 },
    { vendor: "Visual Tech Solutions", totalSpent: 25000, transactionCount: 1, avgTransactionSize: 25000 },
    { vendor: "Sports Hub", totalSpent: 18000, transactionCount: 2, avgTransactionSize: 9000 },
    { vendor: "Event Decorators", totalSpent: 15000, transactionCount: 2, avgTransactionSize: 7500 },
  ],
  approvalMetrics: {
    totalRequests: 12,
    approved: 8,
    rejected: 2,
    pending: 2,
    averageApprovalTime: 1.5, // days
    fastestApproval: 0.5, // days
    slowestApproval: 3, // days
  },
  budgetHealth: [
    { budgetId: "BUD001", name: "Annual Day 2024-25", health: "healthy", score: 85 },
    { budgetId: "BUD002", name: "Sports Day 2024", health: "healthy", score: 78 },
    { budgetId: "BUD003", name: "Science Fair 2025", health: "healthy", score: 90 },
    { budgetId: "BUD004", name: "Independence Day", health: "completed", score: 95 },
    { budgetId: "BUD005", name: "Field Trip", health: "completed", score: 88 },
    { budgetId: "BUD006", name: "Cultural Fest", health: "at-risk", score: 65 },
  ],
};

export const MOCK_EXPENSE_BREAKDOWN: ExpenseBreakdown[] = [
  {
    budgetId: "BUD001",
    budgetName: "Annual Day 2024-25",
    totalBudget: 200000,
    totalSpent: 95000,
    categories: [
      { name: "Stage & Venue", allocated: 50000, spent: 35000, percentage: 36.8 },
      { name: "Decorations", allocated: 30000, spent: 15000, percentage: 15.8 },
      { name: "Costumes", allocated: 35000, spent: 25000, percentage: 26.3 },
      { name: "Sound & Lighting", allocated: 20000, spent: 12000, percentage: 12.6 },
      { name: "Miscellaneous", allocated: 15000, spent: 8000, percentage: 8.4 },
    ],
  },
  {
    budgetId: "BUD002",
    budgetName: "Sports Day 2024",
    totalBudget: 75000,
    totalSpent: 42000,
    categories: [
      { name: "Equipment", allocated: 25000, spent: 18000, percentage: 42.9 },
      { name: "Awards & Prizes", allocated: 15000, spent: 12000, percentage: 28.6 },
      { name: "Ground Setup", allocated: 12000, spent: 6000, percentage: 14.3 },
      { name: "Catering", allocated: 13000, spent: 4500, percentage: 10.7 },
      { name: "First Aid", allocated: 10000, spent: 1500, percentage: 3.6 },
    ],
  },
  {
    budgetId: "BUD003",
    budgetName: "Science Fair 2025",
    totalBudget: 50000,
    totalSpent: 8000,
    categories: [
      { name: "Materials", allocated: 20000, spent: 5000, percentage: 62.5 },
      { name: "Display Boards", allocated: 10000, spent: 2000, percentage: 25.0 },
      { name: "Prizes", allocated: 8000, spent: 1000, percentage: 12.5 },
      { name: "Printing", allocated: 7000, spent: 0, percentage: 0 },
      { name: "Miscellaneous", allocated: 5000, spent: 0, percentage: 0 },
    ],
  },
];

export const MOCK_TREND_DATA: TrendDataPoint[] = [
  { date: "2025-11-01", spent: 0, cumulative: 0 },
  { date: "2025-11-05", spent: 15000, cumulative: 15000 },
  { date: "2025-11-10", spent: 20000, cumulative: 35000 },
  { date: "2025-11-15", spent: 35000, cumulative: 70000 },
  { date: "2025-11-20", spent: 55000, cumulative: 125000 },
  { date: "2025-11-25", spent: 40000, cumulative: 165000 },
  { date: "2025-11-30", spent: 24500, cumulative: 189500 },
];

export const MOCK_REPORTS: BudgetReport[] = [
  {
    id: "RPT001",
    name: "Monthly Budget Summary - November 2024",
    type: "monthly-summary",
    generatedAt: "2025-11-30T18:00:00Z",
    generatedBy: { id: 101, name: "Admin User" },
    period: { start: "2025-11-01", end: "2025-11-30" },
    format: "pdf",
    url: "/reports/monthly-summary-nov-2024.pdf",
    size: 245000,
  },
  {
    id: "RPT002",
    name: "Budget Utilization Report - Q2 FY24-25",
    type: "utilization",
    generatedAt: "2025-10-15T10:00:00Z",
    generatedBy: { id: 101, name: "Admin User" },
    period: { start: "2025-07-01", end: "2025-09-30" },
    format: "pdf",
    url: "/reports/utilization-q2-fy2425.pdf",
    size: 512000,
  },
  {
    id: "RPT003",
    name: "Vendor Expense Analysis",
    type: "vendor-analysis",
    generatedAt: "2025-11-25T14:30:00Z",
    generatedBy: { id: 101, name: "Admin User" },
    period: { start: "2025-04-01", end: "2025-11-25" },
    format: "xlsx",
    url: "/reports/vendor-analysis-ytd.xlsx",
    size: 128000,
  },
  {
    id: "RPT004",
    name: "Annual Day 2024-25 - Expense Report",
    type: "budget-expense",
    generatedAt: "2025-11-28T16:00:00Z",
    generatedBy: { id: 1, name: "Mrs. Priya Sharma" },
    budgetId: "BUD001",
    format: "pdf",
    url: "/reports/annual-day-expense.pdf",
    size: 198000,
  },
  {
    id: "RPT005",
    name: "Approval Workflow Report",
    type: "approval-summary",
    generatedAt: "2025-11-20T09:00:00Z",
    generatedBy: { id: 101, name: "Admin User" },
    period: { start: "2025-11-01", end: "2025-11-20" },
    format: "pdf",
    url: "/reports/approval-workflow-nov.pdf",
    size: 156000,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getMockBudgetAnalytics(
  filters?: BudgetReportFilters
): Promise<BudgetAnalytics> {
  await simulateDelay();

  // In real implementation, filter analytics based on filters
  console.log(`[MOCK BUDGET] getAnalytics() → loaded`, filters);
  return { ...MOCK_BUDGET_ANALYTICS };
}

export async function getMockExpenseBreakdown(
  budgetId?: string
): Promise<ExpenseBreakdown[]> {
  await simulateDelay();

  if (budgetId) {
    const breakdown = MOCK_EXPENSE_BREAKDOWN.find((b) => b.budgetId === budgetId);
    console.log(`[MOCK BUDGET] getExpenseBreakdown(${budgetId}) → found`);
    return breakdown ? [breakdown] : [];
  }

  console.log(`[MOCK BUDGET] getExpenseBreakdown() → ${MOCK_EXPENSE_BREAKDOWN.length} budgets`);
  return [...MOCK_EXPENSE_BREAKDOWN];
}

export async function getMockTrendData(
  budgetId?: string,
  period?: { start: string; end: string }
): Promise<TrendDataPoint[]> {
  await simulateDelay();

  let data = [...MOCK_TREND_DATA];

  if (period) {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    data = data.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }

  console.log(`[MOCK BUDGET] getTrendData(${budgetId || "all"}) → ${data.length} points`);
  return data;
}

export async function getMockReports(
  filters?: BudgetReportFilters
): Promise<BudgetReport[]> {
  await simulateDelay();

  let reports = [...MOCK_REPORTS];

  if (filters) {
    if (filters.type) {
      reports = reports.filter((r) => r.type === filters.type);
    }

    if (filters.budgetId) {
      reports = reports.filter((r) => r.budgetId === filters.budgetId);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      reports = reports.filter((r) => new Date(r.generatedAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      reports = reports.filter((r) => new Date(r.generatedAt) <= endDate);
    }
  }

  // Sort by generated date descending
  reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

  console.log(`[MOCK BUDGET] getReports() → ${reports.length} reports`);
  return reports;
}

export async function generateMockReport(
  type: BudgetReport["type"],
  options: {
    budgetId?: string;
    period?: { start: string; end: string };
    format: "pdf" | "xlsx" | "csv";
  }
): Promise<BudgetReport> {
  await simulateDelay(1000); // Longer delay to simulate report generation

  const newId = `RPT${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();

  const reportNames: Record<BudgetReport["type"], string> = {
    "monthly-summary": "Monthly Budget Summary",
    utilization: "Budget Utilization Report",
    "vendor-analysis": "Vendor Expense Analysis",
    "budget-expense": "Budget Expense Report",
    "approval-summary": "Approval Workflow Report",
    "category-breakdown": "Category Breakdown Report",
    "comparison": "Budget Comparison Report",
  };

  const newReport: BudgetReport = {
    id: newId,
    name: reportNames[type] || "Custom Report",
    type,
    generatedAt: now,
    generatedBy: { id: 101, name: "Admin User" },
    period: options.period,
    budgetId: options.budgetId,
    format: options.format,
    url: `/reports/${newId}.${options.format}`,
    size: Math.floor(Math.random() * 500000) + 100000,
  };

  MOCK_REPORTS.unshift(newReport);

  console.log(`[MOCK BUDGET] generateReport(${type}) → ${newId}`);
  return newReport;
}

export async function downloadMockReport(reportId: string): Promise<{ url: string }> {
  await simulateDelay();

  const report = MOCK_REPORTS.find((r) => r.id === reportId);
  if (!report) {
    throw new Error(`Report not found: ${reportId}`);
  }

  console.log(`[MOCK BUDGET] downloadReport(${reportId}) → ${report.url}`);
  return { url: report.url };
}

export async function deleteMockReport(reportId: string): Promise<void> {
  await simulateDelay();

  const index = MOCK_REPORTS.findIndex((r) => r.id === reportId);
  if (index !== -1) {
    MOCK_REPORTS.splice(index, 1);
  }

  console.log(`[MOCK BUDGET] deleteReport(${reportId}) → deleted`);
}

export async function getComparativeAnalysis(
  budgetIds: string[]
): Promise<{
  budgets: { id: string; name: string; utilization: number }[];
  categoryComparison: { category: string; values: { budgetId: string; value: number }[] }[];
}> {
  await simulateDelay();

  // Mock comparative data
  const result = {
    budgets: budgetIds.map((id) => {
      const breakdown = MOCK_EXPENSE_BREAKDOWN.find((b) => b.budgetId === id);
      return {
        id,
        name: breakdown?.budgetName || id,
        utilization: breakdown ? (breakdown.totalSpent / breakdown.totalBudget) * 100 : 0,
      };
    }),
    categoryComparison: [
      {
        category: "Stage & Venue",
        values: budgetIds.map((id) => ({ budgetId: id, value: Math.random() * 50000 })),
      },
      {
        category: "Decorations",
        values: budgetIds.map((id) => ({ budgetId: id, value: Math.random() * 30000 })),
      },
    ],
  };

  console.log(`[MOCK BUDGET] getComparativeAnalysis(${budgetIds.join(",")}) → loaded`);
  return result;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetReportsProvider = {
  getAnalytics: getMockBudgetAnalytics,
  getExpenseBreakdown: getMockExpenseBreakdown,
  getTrendData: getMockTrendData,
  getReports: getMockReports,
  generateReport: generateMockReport,
  downloadReport: downloadMockReport,
  deleteReport: deleteMockReport,
  getComparativeAnalysis,
};
