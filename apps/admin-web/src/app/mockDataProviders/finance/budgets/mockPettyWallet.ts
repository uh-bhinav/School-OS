// ============================================================================
// MOCK PETTY WALLET DATA PROVIDER
// ============================================================================
// Mock data for petty cash management
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface UserRef {
  id: number;
  name: string;
}

export interface PettyWalletTransaction {
  id: string;
  budgetId: string;
  type: "expense" | "reload";
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
// MOCK DATA
// ============================================================================

export const MOCK_PETTY_TRANSACTIONS: Record<string, PettyWalletTransaction[]> = {
  BUD001: [
    {
      id: "PTY001",
      budgetId: "BUD001",
      type: "expense",
      amount: 1200,
      description: "Stationery purchase - markers and chart papers",
      category: "Miscellaneous",
      paidTo: "Lakshmi Stationery",
      date: "2025-11-26",
      receiptUrl: "/receipts/petty001.jpg",
      loggedBy: { id: 1, name: "Mrs. Priya Sharma" },
      createdAt: "2025-11-26T09:30:00Z",
    },
    {
      id: "PTY002",
      budgetId: "BUD001",
      type: "expense",
      amount: 800,
      description: "Printing of event schedule sheets",
      category: "Miscellaneous",
      paidTo: "Quick Print Shop",
      date: "2025-11-25",
      receiptUrl: "/receipts/petty002.jpg",
      loggedBy: { id: 1, name: "Mrs. Priya Sharma" },
      createdAt: "2025-11-25T14:00:00Z",
    },
    {
      id: "PTY003",
      budgetId: "BUD001",
      type: "expense",
      amount: 500,
      description: "Tape and adhesive materials",
      category: "Decorations",
      paidTo: "Hardware Store",
      date: "2025-11-24",
      receiptUrl: "/receipts/petty003.jpg",
      loggedBy: { id: 2, name: "Mr. Rahul Singh" },
      createdAt: "2025-11-24T11:00:00Z",
    },
    {
      id: "PTY004",
      budgetId: "BUD001",
      type: "expense",
      amount: 1500,
      description: "Emergency thread and needle purchase for costumes",
      category: "Costumes",
      paidTo: "Textile Mart",
      date: "2025-11-23",
      receiptUrl: "/receipts/petty004.jpg",
      loggedBy: { id: 3, name: "Ms. Anjali" },
      createdAt: "2025-11-23T16:30:00Z",
    },
    {
      id: "PTY005",
      budgetId: "BUD001",
      type: "expense",
      amount: 700,
      description: "Cable ties and extension cords",
      category: "Sound & Lighting",
      paidTo: "Electrical Shop",
      date: "2025-11-22",
      receiptUrl: "/receipts/petty005.jpg",
      loggedBy: { id: 2, name: "Mr. Rahul Singh" },
      createdAt: "2025-11-22T10:00:00Z",
    },
    {
      id: "PTY006",
      budgetId: "BUD001",
      type: "expense",
      amount: 400,
      description: "Bottled water for rehearsal team",
      category: "Miscellaneous",
      paidTo: "Local Store",
      date: "2025-11-21",
      receiptUrl: null,
      loggedBy: { id: 1, name: "Mrs. Priya Sharma" },
      createdAt: "2025-11-21T15:00:00Z",
    },
    {
      id: "PTY007",
      budgetId: "BUD001",
      type: "expense",
      amount: 900,
      description: "Safety pins and clips for decorations",
      category: "Decorations",
      paidTo: "Variety Store",
      date: "2025-11-20",
      receiptUrl: "/receipts/petty007.jpg",
      loggedBy: { id: 1, name: "Mrs. Priya Sharma" },
      createdAt: "2025-11-20T09:30:00Z",
    },
    {
      id: "PTY008",
      budgetId: "BUD001",
      type: "reload",
      amount: 15000,
      description: "Petty cash reload for November",
      category: "Reload",
      date: "2025-11-15",
      loggedBy: { id: 101, name: "Accounts Department" },
      createdAt: "2025-11-15T10:00:00Z",
    },
    {
      id: "PTY009",
      budgetId: "BUD001",
      type: "expense",
      amount: 500,
      description: "Scissors and cutters",
      category: "Miscellaneous",
      paidTo: "Stationery Shop",
      date: "2025-11-14",
      receiptUrl: "/receipts/petty009.jpg",
      loggedBy: { id: 1, name: "Mrs. Priya Sharma" },
      createdAt: "2025-11-14T11:00:00Z",
    },
  ],
  BUD002: [
    {
      id: "PTY101",
      budgetId: "BUD002",
      type: "expense",
      amount: 600,
      description: "First aid supplies restock",
      category: "First Aid",
      paidTo: "Medical Store",
      date: "2025-11-25",
      receiptUrl: "/receipts/petty101.jpg",
      loggedBy: { id: 2, name: "Mr. Suresh Nair" },
      createdAt: "2025-11-25T10:00:00Z",
    },
    {
      id: "PTY102",
      budgetId: "BUD002",
      type: "expense",
      amount: 800,
      description: "Whistle and stopwatches",
      category: "Equipment",
      paidTo: "Sports Zone",
      date: "2025-11-24",
      receiptUrl: "/receipts/petty102.jpg",
      loggedBy: { id: 2, name: "Mr. Suresh Nair" },
      createdAt: "2025-11-24T14:00:00Z",
    },
    {
      id: "PTY103",
      budgetId: "BUD002",
      type: "expense",
      amount: 500,
      description: "Marking chalk powder",
      category: "Ground Setup",
      paidTo: "Hardware Store",
      date: "2025-11-23",
      receiptUrl: null,
      loggedBy: { id: 2, name: "Mr. Suresh Nair" },
      createdAt: "2025-11-23T09:00:00Z",
    },
    {
      id: "PTY104",
      budgetId: "BUD002",
      type: "expense",
      amount: 1100,
      description: "Rope and boundary tape",
      category: "Ground Setup",
      paidTo: "General Store",
      date: "2025-11-22",
      receiptUrl: "/receipts/petty104.jpg",
      loggedBy: { id: 2, name: "Mr. Suresh Nair" },
      createdAt: "2025-11-22T11:00:00Z",
    },
    {
      id: "PTY105",
      budgetId: "BUD002",
      type: "reload",
      amount: 15000,
      description: "Initial petty cash allocation",
      category: "Reload",
      date: "2025-11-20",
      loggedBy: { id: 101, name: "Accounts Department" },
      createdAt: "2025-11-20T10:00:00Z",
    },
  ],
  BUD003: [
    {
      id: "PTY201",
      budgetId: "BUD003",
      type: "reload",
      amount: 10000,
      description: "Initial petty cash allocation",
      category: "Reload",
      date: "2025-11-25",
      loggedBy: { id: 101, name: "Accounts Department" },
      createdAt: "2025-11-25T10:00:00Z",
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

export async function getMockPettyTransactions(budgetId: string): Promise<PettyWalletTransaction[]> {
  await simulateDelay();

  const transactions = [...(MOCK_PETTY_TRANSACTIONS[budgetId] || [])];
  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  console.log(`[MOCK BUDGET] getPettyTransactions(${budgetId}) → ${transactions.length} transactions`);
  return transactions;
}

export async function getMockPettySummary(budgetId: string): Promise<PettyWalletSummary> {
  await simulateDelay();

  const transactions = MOCK_PETTY_TRANSACTIONS[budgetId] || [];

  const totalReloads = transactions
    .filter((t) => t.type === "reload")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalReloads - totalExpenses;
  const monthlyLimit = 15000;
  const thisMonthExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const txDate = new Date(t.date);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastReload = transactions.find((t) => t.type === "reload");

  const summary: PettyWalletSummary = {
    balance,
    monthlyLimit,
    thisMonthSpent: thisMonthExpenses,
    monthlyRemaining: monthlyLimit - thisMonthExpenses,
    transactionCount: transactions.filter((t) => t.type === "expense").length,
    lastReloadDate: lastReload?.date || null,
    lowBalanceAlert: balance < 3000,
  };

  console.log(`[MOCK BUDGET] getPettySummary(${budgetId}) →`, summary);
  return summary;
}

export async function logMockPettyExpense(
  budgetId: string,
  data: Partial<PettyWalletTransaction>
): Promise<PettyWalletTransaction> {
  await simulateDelay();

  const newId = `PTY${String(Date.now()).slice(-6)}`;

  const newTransaction: PettyWalletTransaction = {
    id: newId,
    budgetId,
    type: "expense",
    amount: data.amount || 0,
    description: data.description || "",
    category: data.category || "Miscellaneous",
    paidTo: data.paidTo,
    date: data.date || new Date().toISOString().split("T")[0],
    receiptUrl: data.receiptUrl || null,
    loggedBy: data.loggedBy || { id: 1, name: "Mrs. Priya Sharma" },
    createdAt: new Date().toISOString(),
  };

  if (!MOCK_PETTY_TRANSACTIONS[budgetId]) {
    MOCK_PETTY_TRANSACTIONS[budgetId] = [];
  }
  MOCK_PETTY_TRANSACTIONS[budgetId].unshift(newTransaction);

  console.log(`[MOCK BUDGET] logPettyExpense(${budgetId}) → ${newId}`);
  return newTransaction;
}

export async function reloadMockPettyWallet(
  budgetId: string,
  amount: number
): Promise<PettyWalletTransaction> {
  await simulateDelay();

  const newId = `PTY${String(Date.now()).slice(-6)}`;

  const reloadTransaction: PettyWalletTransaction = {
    id: newId,
    budgetId,
    type: "reload",
    amount,
    description: "Petty cash reload",
    category: "Reload",
    date: new Date().toISOString().split("T")[0],
    loggedBy: { id: 101, name: "Accounts Department" },
    createdAt: new Date().toISOString(),
  };

  if (!MOCK_PETTY_TRANSACTIONS[budgetId]) {
    MOCK_PETTY_TRANSACTIONS[budgetId] = [];
  }
  MOCK_PETTY_TRANSACTIONS[budgetId].unshift(reloadTransaction);

  console.log(`[MOCK BUDGET] reloadPettyWallet(${budgetId}, ${amount}) → ${newId}`);
  return reloadTransaction;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockPettyWalletProvider = {
  getTransactions: getMockPettyTransactions,
  getSummary: getMockPettySummary,
  logExpense: logMockPettyExpense,
  reload: reloadMockPettyWallet,
};
