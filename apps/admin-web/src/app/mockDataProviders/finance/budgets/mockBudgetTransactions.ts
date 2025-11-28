// ============================================================================
// MOCK BUDGET TRANSACTIONS DATA PROVIDER
// ============================================================================
// Mock data for budget transactions and expenses
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface UserRef {
  id: number;
  name: string;
  role?: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetTransaction {
  id: string;
  budgetId: string;
  type: "expense" | "refund" | "adjustment";
  category: string;
  amount: number;
  description: string;
  vendor: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  receiptUrl?: string | null;
  approvedBy?: UserRef;
  createdBy: UserRef;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTransactionFilters {
  type?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_BUDGET_TRANSACTIONS: Record<string, BudgetTransaction[]> = {
  BUD001: [
    {
      id: "TXN001",
      budgetId: "BUD001",
      type: "expense",
      category: "Decorations",
      amount: 25000,
      description: "Stage backdrop and curtains",
      vendor: "Creative Decors Pvt Ltd",
      date: "2025-11-26",
      status: "completed",
      receiptUrl: "/receipts/txn001.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Velvet backdrop (20ft x 12ft)", quantity: 1, unitPrice: 15000, total: 15000 },
        { description: "Side curtains", quantity: 4, unitPrice: 2500, total: 10000 },
      ],
      createdAt: "2025-11-26T10:00:00Z",
      updatedAt: "2025-11-26T10:30:00Z",
    },
    {
      id: "TXN002",
      budgetId: "BUD001",
      type: "expense",
      category: "Catering",
      amount: 50000,
      description: "Advance payment to caterer",
      vendor: "Royal Caterers",
      date: "2025-11-25",
      status: "completed",
      receiptUrl: "/receipts/txn002.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Catering advance (50%)", quantity: 1, unitPrice: 50000, total: 50000 },
      ],
      createdAt: "2025-11-25T14:00:00Z",
      updatedAt: "2025-11-25T15:00:00Z",
    },
    {
      id: "TXN003",
      budgetId: "BUD001",
      type: "expense",
      category: "Sound & Lighting",
      amount: 35000,
      description: "Sound system rental for 3 days",
      vendor: "SoundPro Events",
      date: "2025-11-24",
      status: "completed",
      receiptUrl: "/receipts/txn003.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Rahul Singh" },
      lineItems: [
        { description: "PA System (2000W)", quantity: 1, unitPrice: 15000, total: 15000 },
        { description: "Wireless microphones", quantity: 4, unitPrice: 2000, total: 8000 },
        { description: "Stage monitors", quantity: 4, unitPrice: 3000, total: 12000 },
      ],
      createdAt: "2025-11-24T10:00:00Z",
      updatedAt: "2025-11-24T11:00:00Z",
    },
    {
      id: "TXN004",
      budgetId: "BUD001",
      type: "expense",
      category: "Decorations",
      amount: 18000,
      description: "Flower arrangements and balloons",
      vendor: "Green Florists",
      date: "2025-11-23",
      status: "completed",
      receiptUrl: "/receipts/txn004.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Stage flower arrangement", quantity: 5, unitPrice: 2000, total: 10000 },
        { description: "Balloon arch", quantity: 2, unitPrice: 4000, total: 8000 },
      ],
      createdAt: "2025-11-23T09:00:00Z",
      updatedAt: "2025-11-23T10:00:00Z",
    },
    {
      id: "TXN005",
      budgetId: "BUD001",
      type: "expense",
      category: "Catering",
      amount: 35000,
      description: "Snacks and beverages order",
      vendor: "Royal Caterers",
      date: "2025-11-22",
      status: "completed",
      receiptUrl: "/receipts/txn005.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Welcome drinks (500 pax)", quantity: 500, unitPrice: 30, total: 15000 },
        { description: "Snacks combo (500 pax)", quantity: 500, unitPrice: 40, total: 20000 },
      ],
      createdAt: "2025-11-22T14:00:00Z",
      updatedAt: "2025-11-22T15:00:00Z",
    },
    {
      id: "TXN006",
      budgetId: "BUD001",
      type: "expense",
      category: "Decorations",
      amount: 22000,
      description: "LED lights and fairy lights",
      vendor: "Light House Electronics",
      date: "2025-11-21",
      status: "completed",
      receiptUrl: "/receipts/txn006.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 2, name: "Mr. Rahul Singh" },
      lineItems: [
        { description: "LED strip lights (100m)", quantity: 100, unitPrice: 150, total: 15000 },
        { description: "Fairy light curtains", quantity: 5, unitPrice: 1400, total: 7000 },
      ],
      createdAt: "2025-11-21T11:00:00Z",
      updatedAt: "2025-11-21T12:00:00Z",
    },
    {
      id: "TXN007",
      budgetId: "BUD001",
      type: "expense",
      category: "Sound & Lighting",
      amount: 15000,
      description: "Stage lighting equipment",
      vendor: "SoundPro Events",
      date: "2025-11-20",
      status: "completed",
      receiptUrl: "/receipts/txn007.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Rahul Singh" },
      lineItems: [
        { description: "Moving head lights", quantity: 4, unitPrice: 2500, total: 10000 },
        { description: "Spotlight", quantity: 2, unitPrice: 2500, total: 5000 },
      ],
      createdAt: "2025-11-20T10:00:00Z",
      updatedAt: "2025-11-20T11:00:00Z",
    },
    {
      id: "TXN008",
      budgetId: "BUD001",
      type: "expense",
      category: "Catering",
      amount: 35000,
      description: "Lunch arrangement for rehearsals",
      vendor: "Quick Bites Catering",
      date: "2025-11-19",
      status: "completed",
      receiptUrl: "/receipts/txn008.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Lunch boxes (200 pax x 3 days)", quantity: 600, unitPrice: 50, total: 30000 },
        { description: "Water bottles", quantity: 200, unitPrice: 25, total: 5000 },
      ],
      createdAt: "2025-11-19T09:00:00Z",
      updatedAt: "2025-11-19T10:00:00Z",
    },
    {
      id: "TXN009",
      budgetId: "BUD001",
      type: "expense",
      category: "Decorations",
      amount: 30000,
      description: "Banner and standees printing",
      vendor: "Print Solutions",
      date: "2025-11-18",
      status: "completed",
      receiptUrl: "/receipts/txn009.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Main stage banner (40ft x 8ft)", quantity: 1, unitPrice: 12000, total: 12000 },
        { description: "Welcome standees", quantity: 6, unitPrice: 2000, total: 12000 },
        { description: "Direction signages", quantity: 10, unitPrice: 600, total: 6000 },
      ],
      createdAt: "2025-11-18T14:00:00Z",
      updatedAt: "2025-11-18T15:00:00Z",
    },
    {
      id: "TXN010",
      budgetId: "BUD001",
      type: "expense",
      category: "Sound & Lighting",
      amount: 15000,
      description: "DJ equipment hire",
      vendor: "SoundPro Events",
      date: "2025-11-17",
      status: "completed",
      receiptUrl: null,
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 2, name: "Mr. Rahul Singh" },
      lineItems: [
        { description: "DJ Console with mixer", quantity: 1, unitPrice: 10000, total: 10000 },
        { description: "DJ Lights package", quantity: 1, unitPrice: 5000, total: 5000 },
      ],
      createdAt: "2025-11-17T11:00:00Z",
      updatedAt: "2025-11-17T12:00:00Z",
    },
    {
      id: "TXN011",
      budgetId: "BUD001",
      type: "expense",
      category: "Prizes & Certificates",
      amount: 25000,
      description: "Trophies and medals order",
      vendor: "Trophy World",
      date: "2025-11-16",
      status: "completed",
      receiptUrl: "/receipts/txn011.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 1, name: "Mrs. Priya Sharma" },
      lineItems: [
        { description: "Winner trophies", quantity: 10, unitPrice: 1500, total: 15000 },
        { description: "Participation medals", quantity: 100, unitPrice: 100, total: 10000 },
      ],
      createdAt: "2025-11-16T10:00:00Z",
      updatedAt: "2025-11-16T11:00:00Z",
    },
    {
      id: "TXN012",
      budgetId: "BUD001",
      type: "expense",
      category: "Costumes",
      amount: 20000,
      description: "Dance costumes rental",
      vendor: "Costume Corner",
      date: "2025-11-15",
      status: "completed",
      receiptUrl: "/receipts/txn012.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 3, name: "Ms. Anjali Dance Teacher" },
      lineItems: [
        { description: "Folk dance costumes (30 sets)", quantity: 30, unitPrice: 500, total: 15000 },
        { description: "Classical dance costumes (10 sets)", quantity: 10, unitPrice: 500, total: 5000 },
      ],
      createdAt: "2025-11-15T09:00:00Z",
      updatedAt: "2025-11-15T10:00:00Z",
    },
  ],
  BUD002: [
    {
      id: "TXN101",
      budgetId: "BUD002",
      type: "expense",
      category: "Equipment",
      amount: 45000,
      description: "Sports equipment purchase",
      vendor: "Sports Zone",
      date: "2025-11-25",
      status: "completed",
      receiptUrl: "/receipts/txn101.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Suresh Nair" },
      lineItems: [
        { description: "Footballs (official size)", quantity: 10, unitPrice: 1500, total: 15000 },
        { description: "Cricket bats", quantity: 6, unitPrice: 2500, total: 15000 },
        { description: "Basketball", quantity: 6, unitPrice: 1500, total: 9000 },
        { description: "Shuttlecocks (box)", quantity: 20, unitPrice: 300, total: 6000 },
      ],
      createdAt: "2025-11-25T10:00:00Z",
      updatedAt: "2025-11-25T14:00:00Z",
    },
    {
      id: "TXN102",
      budgetId: "BUD002",
      type: "expense",
      category: "Equipment",
      amount: 30000,
      description: "Track and field equipment",
      vendor: "Sports Zone",
      date: "2025-11-24",
      status: "completed",
      receiptUrl: "/receipts/txn102.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Suresh Nair" },
      lineItems: [
        { description: "Relay batons", quantity: 20, unitPrice: 200, total: 4000 },
        { description: "Starting blocks", quantity: 8, unitPrice: 1500, total: 12000 },
        { description: "Shot put", quantity: 5, unitPrice: 2000, total: 10000 },
        { description: "Discus", quantity: 4, unitPrice: 1000, total: 4000 },
      ],
      createdAt: "2025-11-24T09:00:00Z",
      updatedAt: "2025-11-24T10:00:00Z",
    },
    {
      id: "TXN103",
      budgetId: "BUD002",
      type: "expense",
      category: "Ground Setup",
      amount: 35000,
      description: "Ground marking and setup",
      vendor: "Ground Masters",
      date: "2025-11-23",
      status: "completed",
      receiptUrl: "/receipts/txn103.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Suresh Nair" },
      lineItems: [
        { description: "Track marking paint", quantity: 20, unitPrice: 500, total: 10000 },
        { description: "Lime powder", quantity: 50, unitPrice: 100, total: 5000 },
        { description: "Temporary fencing", quantity: 200, unitPrice: 100, total: 20000 },
      ],
      createdAt: "2025-11-23T11:00:00Z",
      updatedAt: "2025-11-23T16:30:00Z",
    },
    {
      id: "TXN104",
      budgetId: "BUD002",
      type: "expense",
      category: "Trophies & Medals",
      amount: 45000,
      description: "Championship trophies and medals",
      vendor: "Trophy World",
      date: "2025-11-22",
      status: "completed",
      receiptUrl: "/receipts/txn104.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 2, name: "Mr. Suresh Nair" },
      lineItems: [
        { description: "Overall championship trophy", quantity: 1, unitPrice: 15000, total: 15000 },
        { description: "Event winner trophies", quantity: 20, unitPrice: 800, total: 16000 },
        { description: "Gold medals", quantity: 50, unitPrice: 150, total: 7500 },
        { description: "Silver medals", quantity: 50, unitPrice: 100, total: 5000 },
        { description: "Bronze medals", quantity: 50, unitPrice: 30, total: 1500 },
      ],
      createdAt: "2025-11-22T14:00:00Z",
      updatedAt: "2025-11-22T15:00:00Z",
    },
    {
      id: "TXN105",
      budgetId: "BUD002",
      type: "expense",
      category: "Refreshments",
      amount: 25000,
      description: "Water and energy drinks for athletes",
      vendor: "Beverage Distributors",
      date: "2025-11-20",
      status: "completed",
      receiptUrl: "/receipts/txn105.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 2, name: "Mr. Suresh Nair" },
      lineItems: [
        { description: "Mineral water bottles (1L)", quantity: 500, unitPrice: 20, total: 10000 },
        { description: "Energy drinks", quantity: 200, unitPrice: 50, total: 10000 },
        { description: "Glucose powder", quantity: 50, unitPrice: 100, total: 5000 },
      ],
      createdAt: "2025-11-20T09:00:00Z",
      updatedAt: "2025-11-20T10:00:00Z",
    },
  ],
  BUD003: [
    {
      id: "TXN201",
      budgetId: "BUD003",
      type: "expense",
      category: "Lab Materials",
      amount: 12000,
      description: "Chemistry lab chemicals",
      vendor: "Lab Supplies India",
      date: "2025-11-24",
      status: "completed",
      receiptUrl: "/receipts/txn201.pdf",
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 3, name: "Dr. Kavita Verma" },
      lineItems: [
        { description: "Acid set (HCl, H2SO4, HNO3)", quantity: 5, unitPrice: 800, total: 4000 },
        { description: "Base set (NaOH, KOH)", quantity: 5, unitPrice: 600, total: 3000 },
        { description: "Indicators set", quantity: 10, unitPrice: 500, total: 5000 },
      ],
      createdAt: "2025-11-24T11:00:00Z",
      updatedAt: "2025-11-24T11:30:00Z",
    },
    {
      id: "TXN202",
      budgetId: "BUD003",
      type: "expense",
      category: "Lab Materials",
      amount: 8000,
      description: "Physics lab equipment",
      vendor: "Scientific Instruments Co",
      date: "2025-11-22",
      status: "completed",
      receiptUrl: "/receipts/txn202.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 3, name: "Dr. Kavita Verma" },
      lineItems: [
        { description: "Prism set", quantity: 5, unitPrice: 400, total: 2000 },
        { description: "Magnets set", quantity: 10, unitPrice: 300, total: 3000 },
        { description: "Connecting wires", quantity: 50, unitPrice: 60, total: 3000 },
      ],
      createdAt: "2025-11-22T10:00:00Z",
      updatedAt: "2025-11-22T11:00:00Z",
    },
    {
      id: "TXN203",
      budgetId: "BUD003",
      type: "expense",
      category: "Display Boards",
      amount: 10000,
      description: "Project display boards",
      vendor: "Stationery Hub",
      date: "2025-11-20",
      status: "completed",
      receiptUrl: "/receipts/txn203.pdf",
      approvedBy: { id: 102, name: "Vice Principal" },
      createdBy: { id: 3, name: "Dr. Kavita Verma" },
      lineItems: [
        { description: "Tri-fold boards", quantity: 30, unitPrice: 250, total: 7500 },
        { description: "Chart papers (pack)", quantity: 10, unitPrice: 250, total: 2500 },
      ],
      createdAt: "2025-11-20T14:00:00Z",
      updatedAt: "2025-11-20T15:00:00Z",
    },
    {
      id: "TXN204",
      budgetId: "BUD003",
      type: "expense",
      category: "Guest Speakers",
      amount: 5000,
      description: "Travel advance for guest speaker",
      vendor: "Direct Payment",
      date: "2025-11-18",
      status: "completed",
      receiptUrl: null,
      approvedBy: { id: 101, name: "Principal Dr. Sharma" },
      createdBy: { id: 3, name: "Dr. Kavita Verma" },
      lineItems: [
        { description: "Travel advance - Dr. Ramesh (IISc)", quantity: 1, unitPrice: 5000, total: 5000 },
      ],
      createdAt: "2025-11-18T09:00:00Z",
      updatedAt: "2025-11-18T10:00:00Z",
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

export async function getMockBudgetTransactions(
  budgetId: string,
  filters?: BudgetTransactionFilters
): Promise<BudgetTransaction[]> {
  await simulateDelay();

  let transactions = [...(MOCK_BUDGET_TRANSACTIONS[budgetId] || [])];

  if (filters?.type) {
    transactions = transactions.filter((t) => t.type === filters.type);
  }

  if (filters?.category) {
    transactions = transactions.filter((t) => t.category === filters.category);
  }

  if (filters?.status) {
    transactions = transactions.filter((t) => t.status === filters.status);
  }

  if (filters?.dateFrom) {
    transactions = transactions.filter((t) => t.date >= filters.dateFrom!);
  }

  if (filters?.dateTo) {
    transactions = transactions.filter((t) => t.date <= filters.dateTo!);
  }

  if (filters?.minAmount !== undefined) {
    transactions = transactions.filter((t) => t.amount >= filters.minAmount!);
  }

  if (filters?.maxAmount !== undefined) {
    transactions = transactions.filter((t) => t.amount <= filters.maxAmount!);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    transactions = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.vendor?.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`[MOCK BUDGET] getTransactions(${budgetId}) → ${transactions.length} transactions`);
  return transactions;
}

export async function getMockTransactionById(
  budgetId: string,
  transactionId: string
): Promise<BudgetTransaction | null> {
  await simulateDelay();

  const transactions = MOCK_BUDGET_TRANSACTIONS[budgetId] || [];
  const transaction = transactions.find((t) => t.id === transactionId);

  console.log(`[MOCK BUDGET] getTransactionById(${transactionId}) → ${transaction ? "found" : "not found"}`);
  return transaction || null;
}

export async function createMockTransaction(
  budgetId: string,
  data: Partial<BudgetTransaction>
): Promise<BudgetTransaction> {
  await simulateDelay();

  const newId = `TXN${String(Date.now()).slice(-6)}`;

  const newTransaction: BudgetTransaction = {
    id: newId,
    budgetId,
    type: data.type || "expense",
    category: data.category || "Miscellaneous",
    amount: data.amount || 0,
    description: data.description || "",
    vendor: data.vendor || "Unknown Vendor",
    date: data.date || new Date().toISOString().split("T")[0],
    status: "pending",
    receiptUrl: data.receiptUrl || null,
    createdBy: data.createdBy || { id: 1, name: "Mrs. Priya Sharma" },
    lineItems: data.lineItems || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!MOCK_BUDGET_TRANSACTIONS[budgetId]) {
    MOCK_BUDGET_TRANSACTIONS[budgetId] = [];
  }
  MOCK_BUDGET_TRANSACTIONS[budgetId].unshift(newTransaction);

  console.log(`[MOCK BUDGET] createTransaction(${budgetId}) → ${newId}`);
  return newTransaction;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetTransactionsProvider = {
  getTransactions: getMockBudgetTransactions,
  getTransactionById: getMockTransactionById,
  createTransaction: createMockTransaction,
};
