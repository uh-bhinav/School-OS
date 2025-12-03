// ============================================================================
// MOCK BUDGET APPROVALS DATA PROVIDER
// ============================================================================
// Mock data for purchase requests and approvals
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface UserRef {
  id: number;
  name: string;
  role?: string;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface Quote {
  vendor: string;
  amount: number;
  selected: boolean;
}

interface ApprovalTrailItem {
  action: string;
  by: UserRef;
  at: string;
  comment?: string;
}

export interface BudgetApproval {
  id: string;
  budgetId: string;
  type: "purchase_request" | "reimbursement" | "budget_change";
  category: string;
  amount: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "clarification_needed";
  requestedBy: UserRef;
  attachments: Attachment[];
  quotes: Quote[];
  approvalTrail: ApprovalTrailItem[];
  approvedBy?: UserRef;
  approvedAt?: string;
  rejectedBy?: UserRef;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetApprovalFilters {
  status?: string;
  type?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export interface ApprovalAction {
  action: "approve" | "reject" | "request_info" | "escalate" | "approved" | "rejected" | "clarification_requested";
  by?: UserRef;
  comments?: string;
  comment?: string;
  escalateTo?: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_BUDGET_APPROVALS: Record<string, BudgetApproval[]> = {
  BUD001: [
    {
      id: "APR001",
      budgetId: "BUD001",
      type: "purchase_request",
      category: "Sound & Lighting",
      amount: 15000,
      title: "LED Lights for stage",
      description: "Required LED spotlights and strip lights for enhanced stage lighting during performances",
      priority: "high",
      status: "pending",
      requestedBy: { id: 2, name: "Mr. Rahul Singh", role: "Event Coordinator" },
      attachments: [
        { name: "Quote_LightHouse.pdf", url: "/attachments/quote1.pdf", type: "quote" },
        { name: "Quote_LEDWorld.pdf", url: "/attachments/quote2.pdf", type: "quote" },
      ],
      quotes: [
        { vendor: "Light House Electronics", amount: 15000, selected: true },
        { vendor: "LED World", amount: 17500, selected: false },
      ],
      approvalTrail: [],
      createdAt: "2025-11-25T14:30:00Z",
      updatedAt: "2025-11-25T14:30:00Z",
    },
    {
      id: "APR002",
      budgetId: "BUD001",
      type: "purchase_request",
      category: "Catering",
      amount: 20000,
      title: "Additional refreshments order",
      description: "Extra refreshments needed due to increased guest count (100 additional guests confirmed)",
      priority: "medium",
      status: "pending",
      requestedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Budget Coordinator" },
      attachments: [
        { name: "Guest_List_Updated.xlsx", url: "/attachments/guests.xlsx", type: "supporting" },
      ],
      quotes: [
        { vendor: "Royal Caterers", amount: 20000, selected: true },
      ],
      approvalTrail: [],
      createdAt: "2025-11-24T10:00:00Z",
      updatedAt: "2025-11-24T10:00:00Z",
    },
    {
      id: "APR003",
      budgetId: "BUD001",
      type: "purchase_request",
      category: "Decorations",
      amount: 8000,
      title: "Entrance arch decoration",
      description: "Floral arch decoration for main entrance to welcome guests",
      priority: "low",
      status: "pending",
      requestedBy: { id: 3, name: "Ms. Kavitha", role: "Decoration Lead" },
      attachments: [
        { name: "Design_Reference.jpg", url: "/attachments/design.jpg", type: "supporting" },
      ],
      quotes: [
        { vendor: "Green Florists", amount: 8000, selected: true },
        { vendor: "Bloom Decorators", amount: 9500, selected: false },
      ],
      approvalTrail: [],
      createdAt: "2025-11-23T16:00:00Z",
      updatedAt: "2025-11-23T16:00:00Z",
    },
    {
      id: "APR004",
      budgetId: "BUD001",
      type: "reimbursement",
      category: "Miscellaneous",
      amount: 2500,
      title: "Emergency stationery purchase",
      description: "Purchased chart papers, markers, and tape for last-minute banner corrections",
      priority: "low",
      status: "approved",
      requestedBy: { id: 1, name: "Mrs. Priya Sharma", role: "Budget Coordinator" },
      attachments: [
        { name: "Receipt_Stationery.jpg", url: "/attachments/receipt.jpg", type: "receipt" },
      ],
      quotes: [],
      approvalTrail: [
        { action: "approved", by: { id: 102, name: "Vice Principal" }, at: "2025-11-22T11:00:00Z", comment: "Approved - justified emergency purchase" },
      ],
      approvedBy: { id: 102, name: "Vice Principal" },
      approvedAt: "2025-11-22T11:00:00Z",
      createdAt: "2025-11-22T09:00:00Z",
      updatedAt: "2025-11-22T11:00:00Z",
    },
  ],
  BUD002: [
    {
      id: "APR101",
      budgetId: "BUD002",
      type: "purchase_request",
      category: "Equipment",
      amount: 10000,
      title: "Additional sports equipment",
      description: "Badminton rackets and nets needed for increased participation",
      priority: "medium",
      status: "pending",
      requestedBy: { id: 2, name: "Mr. Suresh Nair", role: "Sports Coordinator" },
      attachments: [
        { name: "Quote_SportsZone.pdf", url: "/attachments/quote_sports.pdf", type: "quote" },
      ],
      quotes: [
        { vendor: "Sports Zone", amount: 10000, selected: true },
      ],
      approvalTrail: [],
      createdAt: "2025-11-26T09:00:00Z",
      updatedAt: "2025-11-26T09:00:00Z",
    },
    {
      id: "APR102",
      budgetId: "BUD002",
      type: "purchase_request",
      category: "Ground Setup",
      amount: 12000,
      title: "Tent rental for VIP seating",
      description: "Shamiana tent required for VIP and parents seating area",
      priority: "high",
      status: "pending",
      requestedBy: { id: 2, name: "Mr. Suresh Nair", role: "Sports Coordinator" },
      attachments: [
        { name: "Quote_TentHouse.pdf", url: "/attachments/tent_quote.pdf", type: "quote" },
        { name: "Layout_Plan.pdf", url: "/attachments/layout.pdf", type: "supporting" },
      ],
      quotes: [
        { vendor: "City Tent House", amount: 12000, selected: true },
        { vendor: "Royal Decorators", amount: 15000, selected: false },
      ],
      approvalTrail: [],
      createdAt: "2025-11-25T11:00:00Z",
      updatedAt: "2025-11-25T11:00:00Z",
    },
  ],
  BUD003: [
    {
      id: "APR201",
      budgetId: "BUD003",
      type: "purchase_request",
      category: "Display Boards",
      amount: 15000,
      title: "Professional display panels",
      description: "High-quality display panels for student projects exhibition",
      priority: "medium",
      status: "pending",
      requestedBy: { id: 3, name: "Dr. Kavita Verma", role: "Science Fair Coordinator" },
      attachments: [
        { name: "Quote_DisplayWorld.pdf", url: "/attachments/display_quote.pdf", type: "quote" },
      ],
      quotes: [
        { vendor: "Display World", amount: 15000, selected: true },
        { vendor: "Exhibit Solutions", amount: 18000, selected: false },
      ],
      approvalTrail: [],
      createdAt: "2025-11-24T15:00:00Z",
      updatedAt: "2025-11-24T15:00:00Z",
    },
    {
      id: "APR202",
      budgetId: "BUD003",
      type: "purchase_request",
      category: "Lab Materials",
      amount: 8000,
      title: "Biology specimens and models",
      description: "Anatomical models and preserved specimens for biology projects",
      priority: "low",
      status: "pending",
      requestedBy: { id: 4, name: "Mrs. Fatima Khan", role: "Biology Teacher" },
      attachments: [],
      quotes: [
        { vendor: "Lab Supplies India", amount: 8000, selected: true },
      ],
      approvalTrail: [],
      createdAt: "2025-11-23T10:00:00Z",
      updatedAt: "2025-11-23T10:00:00Z",
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getMockBudgetApprovals(
  budgetId: string,
  filters?: BudgetApprovalFilters
): Promise<BudgetApproval[]> {
  await simulateDelay();

  let approvals = [...(MOCK_BUDGET_APPROVALS[budgetId] || [])];

  if (filters?.status) {
    approvals = approvals.filter((a) => a.status === filters.status);
  }

  if (filters?.priority) {
    approvals = approvals.filter((a) => a.priority === filters.priority);
  }

  if (filters?.category) {
    approvals = approvals.filter((a) => a.category === filters.category);
  }

  if (filters?.type) {
    approvals = approvals.filter((a) => a.type === filters.type);
  }

  // Sort by priority (high first), then by date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  approvals.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  console.log(`[MOCK BUDGET] getApprovals(${budgetId}) → ${approvals.length} approvals`);
  return approvals;
}

export async function getMockAllPendingApprovals(): Promise<BudgetApproval[]> {
  await simulateDelay();

  const allApprovals = Object.values(MOCK_BUDGET_APPROVALS)
    .flat()
    .filter((a) => a.status === "pending");

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  allApprovals.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  console.log(`[MOCK BUDGET] getAllPendingApprovals → ${allApprovals.length} pending`);
  return allApprovals;
}

export async function processMockApproval(
  budgetId: string,
  approvalId: string,
  action: ApprovalAction
): Promise<BudgetApproval> {
  await simulateDelay();

  const approvals = MOCK_BUDGET_APPROVALS[budgetId];
  if (!approvals) {
    throw new Error(`Budget ${budgetId} not found`);
  }

  const index = approvals.findIndex((a) => a.id === approvalId);
  if (index === -1) {
    throw new Error(`Approval ${approvalId} not found`);
  }

  const approval = approvals[index];
  const actionBy = action.by || { id: 0, name: "System" };

  approval.approvalTrail.push({
    action: action.action,
    by: actionBy,
    at: new Date().toISOString(),
    comment: action.comment,
  });

  if (action.action === "approved" || action.action === "approve") {
    approval.status = "approved";
    approval.approvedBy = actionBy;
    approval.approvedAt = new Date().toISOString();
  } else if (action.action === "rejected" || action.action === "reject") {
    approval.status = "rejected";
    approval.rejectedBy = actionBy;
    approval.rejectedAt = new Date().toISOString();
    approval.rejectionReason = action.comment;
  } else if (action.action === "clarification_requested" || action.action === "request_info") {
    approval.status = "clarification_needed";
  }

  approval.updatedAt = new Date().toISOString();

  console.log(`[MOCK BUDGET] processApproval(${approvalId}) → ${action.action}`);
  return approval;
}

export async function createMockPurchaseRequest(
  budgetId: string,
  data: Partial<BudgetApproval>
): Promise<BudgetApproval> {
  await simulateDelay();

  const newId = `APR${String(Date.now()).slice(-6)}`;

  const newApproval: BudgetApproval = {
    id: newId,
    budgetId,
    type: "purchase_request",
    category: data.category || "Miscellaneous",
    amount: data.amount || 0,
    title: data.title || "New Purchase Request",
    description: data.description || "",
    priority: data.priority || "medium",
    status: "pending",
    requestedBy: data.requestedBy || { id: 1, name: "Mrs. Priya Sharma", role: "Coordinator" },
    attachments: data.attachments || [],
    quotes: data.quotes || [],
    approvalTrail: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!MOCK_BUDGET_APPROVALS[budgetId]) {
    MOCK_BUDGET_APPROVALS[budgetId] = [];
  }
  MOCK_BUDGET_APPROVALS[budgetId].unshift(newApproval);

  console.log(`[MOCK BUDGET] createPurchaseRequest(${budgetId}) → ${newId}`);
  return newApproval;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetApprovalsProvider = {
  getApprovals: getMockBudgetApprovals,
  getAllPending: getMockAllPendingApprovals,
  processApproval: processMockApproval,
  createPurchaseRequest: createMockPurchaseRequest,
};
