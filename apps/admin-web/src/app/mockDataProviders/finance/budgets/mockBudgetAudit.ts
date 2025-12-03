// ============================================================================
// MOCK BUDGET AUDIT DATA PROVIDER
// ============================================================================
// Mock data for budget audit trail / activity log
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface UserRef {
  id: number;
  name: string;
  role?: string;
}

export interface BudgetAuditEntry {
  id: string;
  budgetId: string;
  action: string;
  description: string;
  performedBy: UserRef;
  timestamp: string;
  changes?: Record<string, { from: unknown; to: unknown } | { spent: { from: number; to: number } }>;
  metadata?: Record<string, unknown>;
}

export interface BudgetAuditFilters {
  action?: string;
  performedBy?: number;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_AUDIT_ENTRIES: BudgetAuditEntry[] = [
  {
    id: "AUD001",
    budgetId: "BUD001",
    action: "budget_created",
    description: "Budget created for Annual Day 2024-25 event",
    performedBy: { id: 101, name: "Admin User", role: "Finance Admin" },
    timestamp: "2025-11-10T09:00:00Z",
    changes: {
      totalAmount: { from: null, to: 200000 },
      status: { from: null, to: "Draft" },
    },
    metadata: {
      eventName: "Annual Day 2024-25",
      initialBudget: 200000,
    },
  },
  {
    id: "AUD002",
    budgetId: "BUD001",
    action: "budget_approved",
    description: "Budget approved by principal",
    performedBy: { id: 102, name: "Dr. Ramesh Kumar", role: "Principal" },
    timestamp: "2025-11-12T14:30:00Z",
    changes: {
      status: { from: "Draft", to: "Active" },
    },
    metadata: {
      approvalNotes: "Approved as per committee discussion",
    },
  },
  {
    id: "AUD003",
    budgetId: "BUD001",
    action: "category_added",
    description: "Added Sound & Lighting category",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-13T10:00:00Z",
    changes: {
      categories: { from: 5, to: 6 },
    },
    metadata: {
      categoryName: "Sound & Lighting",
      allocatedAmount: 20000,
    },
  },
  {
    id: "AUD004",
    budgetId: "BUD001",
    action: "expense_logged",
    description: "Logged expense for stage materials",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-15T11:30:00Z",
    changes: {
      spent: { from: 0, to: 15000 },
    },
    metadata: {
      vendor: "Stage Craft Pvt Ltd",
      amount: 15000,
      invoiceId: "TXN001",
    },
  },
  {
    id: "AUD005",
    budgetId: "BUD001",
    action: "approval_submitted",
    description: "Purchase request submitted for LED screen rental",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-18T09:00:00Z",
    metadata: {
      requestId: "REQ001",
      amount: 25000,
      vendor: "Visual Tech Solutions",
    },
  },
  {
    id: "AUD006",
    budgetId: "BUD001",
    action: "approval_approved",
    description: "LED screen rental approved",
    performedBy: { id: 102, name: "Dr. Ramesh Kumar", role: "Principal" },
    timestamp: "2025-11-18T14:00:00Z",
    metadata: {
      requestId: "REQ001",
      approvalNotes: "Approved - essential for event",
    },
  },
  {
    id: "AUD007",
    budgetId: "BUD001",
    action: "budget_modified",
    description: "Category allocation increased for Decorations",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-20T16:00:00Z",
    changes: {
      decorationsBudget: { from: 25000, to: 30000 },
      miscellaneousBudget: { from: 15000, to: 10000 },
    },
    metadata: {
      reason: "Additional balloon arch requirement",
    },
  },
  {
    id: "AUD008",
    budgetId: "BUD001",
    action: "expense_logged",
    description: "Logged expense for costumes rental",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-21T10:00:00Z",
    changes: {
      costumesBudget: { spent: { from: 0, to: 25000 } },
    },
    metadata: {
      vendor: "Fancy Dress World",
      amount: 25000,
      invoiceId: "TXN002",
    },
  },
  {
    id: "AUD009",
    budgetId: "BUD001",
    action: "petty_expense",
    description: "Petty cash expense for stationery",
    performedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Event Coordinator" },
    timestamp: "2025-11-26T09:30:00Z",
    metadata: {
      pettyId: "PTY001",
      amount: 1200,
      vendor: "Lakshmi Stationery",
    },
  },
  {
    id: "AUD010",
    budgetId: "BUD001",
    action: "alert_triggered",
    description: "Category overspend warning triggered",
    performedBy: { id: 0, name: "System", role: "Automated" },
    timestamp: "2025-11-26T10:00:00Z",
    metadata: {
      alertType: "category_overspend",
      category: "Sound & Lighting",
      threshold: 90,
      currentUtilization: 95,
    },
  },
  // Sports Day Audit
  {
    id: "AUD101",
    budgetId: "BUD002",
    action: "budget_created",
    description: "Budget created for Sports Day 2024",
    performedBy: { id: 101, name: "Admin User", role: "Finance Admin" },
    timestamp: "2025-11-15T09:00:00Z",
    changes: {
      totalAmount: { from: null, to: 75000 },
      status: { from: null, to: "Draft" },
    },
    metadata: {
      eventName: "Sports Day 2024",
      initialBudget: 75000,
    },
  },
  {
    id: "AUD102",
    budgetId: "BUD002",
    action: "budget_approved",
    description: "Budget approved",
    performedBy: { id: 102, name: "Dr. Ramesh Kumar", role: "Principal" },
    timestamp: "2025-11-16T11:00:00Z",
    changes: {
      status: { from: "Draft", to: "Active" },
    },
  },
  {
    id: "AUD103",
    budgetId: "BUD002",
    action: "expense_logged",
    description: "Logged expense for equipment purchase",
    performedBy: { id: 2, name: "Mr. Suresh Nair", role: "Sports Coordinator" },
    timestamp: "2025-11-20T14:00:00Z",
    changes: {
      spent: { from: 0, to: 18000 },
    },
    metadata: {
      vendor: "Sports Hub",
      amount: 18000,
      invoiceId: "TXN101",
    },
  },
  // Science Fair Audit
  {
    id: "AUD201",
    budgetId: "BUD003",
    action: "budget_created",
    description: "Budget created for Science Fair 2025",
    performedBy: { id: 101, name: "Admin User", role: "Finance Admin" },
    timestamp: "2025-11-20T09:00:00Z",
    changes: {
      totalAmount: { from: null, to: 50000 },
      status: { from: null, to: "Draft" },
    },
    metadata: {
      eventName: "Science Fair 2025",
      initialBudget: 50000,
    },
  },
  {
    id: "AUD202",
    budgetId: "BUD003",
    action: "budget_approved",
    description: "Budget approved",
    performedBy: { id: 102, name: "Dr. Ramesh Kumar", role: "Principal" },
    timestamp: "2025-11-22T10:00:00Z",
    changes: {
      status: { from: "Draft", to: "Active" },
    },
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

export async function getMockAuditLog(
  budgetId?: string,
  filters?: BudgetAuditFilters
): Promise<BudgetAuditEntry[]> {
  await simulateDelay();

  let entries = [...MOCK_AUDIT_ENTRIES];

  // Filter by budget
  if (budgetId) {
    entries = entries.filter((e) => e.budgetId === budgetId);
  }

  // Apply filters
  if (filters) {
    if (filters.action) {
      entries = entries.filter((e) => e.action === filters.action);
    }

    if (filters.performedBy) {
      entries = entries.filter((e) => e.performedBy.id === filters.performedBy);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      entries = entries.filter((e) => new Date(e.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      entries = entries.filter((e) => new Date(e.timestamp) <= endDate);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.description.toLowerCase().includes(query) ||
          e.performedBy.name.toLowerCase().includes(query)
      );
    }
  }

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  console.log(`[MOCK BUDGET] getAuditLog(${budgetId || "all"}) → ${entries.length} entries`);
  return entries;
}

export async function getMockAuditStats(budgetId: string): Promise<{
  totalActions: number;
  byAction: Record<string, number>;
  byUser: { userId: number; name: string; count: number }[];
  recentActivity: number;
}> {
  await simulateDelay();

  const entries = MOCK_AUDIT_ENTRIES.filter((e) => e.budgetId === budgetId);

  const byAction: Record<string, number> = {};
  const userCounts: Record<number, { name: string; count: number }> = {};

  entries.forEach((e) => {
    // Count by action
    byAction[e.action] = (byAction[e.action] || 0) + 1;

    // Count by user
    if (!userCounts[e.performedBy.id]) {
      userCounts[e.performedBy.id] = { name: e.performedBy.name, count: 0 };
    }
    userCounts[e.performedBy.id].count++;
  });

  const byUser = Object.entries(userCounts).map(([id, data]) => ({
    userId: Number(id),
    name: data.name,
    count: data.count,
  }));

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity = entries.filter(
    (e) => new Date(e.timestamp) >= sevenDaysAgo
  ).length;

  const stats = {
    totalActions: entries.length,
    byAction,
    byUser,
    recentActivity,
  };

  console.log(`[MOCK BUDGET] getAuditStats(${budgetId}) →`, stats);
  return stats;
}

export async function exportMockAuditLog(
  budgetId: string,
  format: "csv" | "pdf"
): Promise<{ url: string }> {
  await simulateDelay(500);

  // Simulate export
  const filename = `audit_log_${budgetId}_${new Date().toISOString().split("T")[0]}.${format}`;
  console.log(`[MOCK BUDGET] exportAuditLog(${budgetId}, ${format}) → ${filename}`);

  return { url: `/exports/${filename}` };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetAuditProvider = {
  getLog: getMockAuditLog,
  getStats: getMockAuditStats,
  export: exportMockAuditLog,
};
