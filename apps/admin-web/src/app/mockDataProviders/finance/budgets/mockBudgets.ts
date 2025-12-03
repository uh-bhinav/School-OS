// ============================================================================
// MOCK BUDGETS DATA PROVIDER
// ============================================================================
// Comprehensive mock data for school budget management
// ============================================================================

// NOTE: Types are inferred locally to avoid circular dependency issues
// The actual types are defined in services/budget.schema.ts

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining?: number;
  pending?: number;
  icon?: string;
  color?: string;
}

interface Coordinator {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface Timeline {
  startDate: string;
  eventDate: string;
  closeDate: string;
}

interface ApprovalRules {
  pettyLimit: number;
  level1Limit: number;
  level2Limit: number;
  requiresReceipt: boolean;
  requiresMultipleQuotes: boolean;
  quotesThreshold: number;
}

interface PettyWallet {
  balance: number;
  monthlyLimit: number;
  spent: number;
  lastReloaded: string | null;
}

export interface Budget {
  id: string;
  title: string;
  description: string;
  type: "event" | "department" | "project" | "recurring";
  coordinator: Coordinator;
  status: "planning" | "active" | "completed" | "cancelled" | "closed" | "upcoming";
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  pendingAmount: number;
  categories: BudgetCategory[];
  timeline: Timeline;
  approvalRules: ApprovalRules;
  pettyWallet: PettyWallet;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetKPIs {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  totalPending: number;
  utilizationPercentage: number;
  pendingApprovals: number;
}

export interface BudgetActivity {
  id: string;
  budgetId: string;
  type: "expense" | "approval" | "request" | "petty" | "update";
  description: string;
  amount?: number;
  category?: string;
  userId: number;
  userName: string;
  timestamp: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: "warning" | "info" | "critical";
  message: string;
  severity: "low" | "medium" | "high";
  isRead: boolean;
  createdAt: string;
}

export interface BudgetListFilters {
  status?: string;
  type?: string;
  coordinatorId?: number;
  search?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "BUD001",
    title: "Annual Day 2025",
    description: "Annual day celebration with cultural programs, decorations, and awards ceremony",
    type: "event",
    coordinator: {
      id: 1,
      name: "Mrs. Priya Sharma",
      email: "priya.sharma@school.com",
      phone: "+91-9876543210",
      avatar: null,
    },
    status: "active",
    allocatedAmount: 500000,
    spentAmount: 325000,
    remainingAmount: 175000,
    pendingAmount: 45000,
    categories: [
      { id: "cat1", name: "Decorations", allocated: 120000, spent: 95000, pending: 15000, color: "#3b82f6", icon: "Palette" },
      { id: "cat2", name: "Catering", allocated: 150000, spent: 120000, pending: 20000, color: "#10b981", icon: "Utensils" },
      { id: "cat3", name: "Sound & Lighting", allocated: 80000, spent: 65000, pending: 10000, color: "#f59e0b", icon: "Volume2" },
      { id: "cat4", name: "Prizes & Certificates", allocated: 50000, spent: 25000, pending: 0, color: "#8b5cf6", icon: "Award" },
      { id: "cat5", name: "Costumes", allocated: 60000, spent: 20000, pending: 0, color: "#ec4899", icon: "Shirt" },
      { id: "cat6", name: "Miscellaneous", allocated: 40000, spent: 0, pending: 0, color: "#6b7280", icon: "Box" },
    ],
    timeline: {
      startDate: "2025-11-01",
      eventDate: "2025-12-20",
      closeDate: "2025-12-31",
    },
    approvalRules: {
      pettyLimit: 2000,
      level1Limit: 10000,
      level2Limit: 50000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 25000,
    },
    pettyWallet: {
      balance: 8500,
      monthlyLimit: 15000,
      spent: 6500,
      lastReloaded: "2025-11-15T10:00:00Z",
    },
    createdAt: "2025-10-15T09:00:00Z",
    updatedAt: "2025-11-26T14:30:00Z",
  },
  {
    id: "BUD002",
    title: "Sports Day 2025",
    description: "Inter-house sports competition with track and field events",
    type: "event",
    coordinator: {
      id: 2,
      name: "Mr. Suresh Nair",
      email: "suresh.nair@school.com",
      phone: "+91-9876543211",
      avatar: null,
    },
    status: "active",
    allocatedAmount: 350000,
    spentAmount: 180000,
    remainingAmount: 170000,
    pendingAmount: 25000,
    categories: [
      { id: "cat1", name: "Equipment", allocated: 100000, spent: 75000, pending: 10000, color: "#3b82f6", icon: "Dumbbell" },
      { id: "cat2", name: "Trophies & Medals", allocated: 80000, spent: 45000, pending: 5000, color: "#f59e0b", icon: "Trophy" },
      { id: "cat3", name: "Ground Setup", allocated: 60000, spent: 35000, pending: 10000, color: "#10b981", icon: "Layout" },
      { id: "cat4", name: "Refreshments", allocated: 50000, spent: 25000, pending: 0, color: "#8b5cf6", icon: "Coffee" },
      { id: "cat5", name: "First Aid", allocated: 30000, spent: 0, pending: 0, color: "#ef4444", icon: "Heart" },
      { id: "cat6", name: "Miscellaneous", allocated: 30000, spent: 0, pending: 0, color: "#6b7280", icon: "Box" },
    ],
    timeline: {
      startDate: "2025-11-15",
      eventDate: "2026-01-15",
      closeDate: "2026-01-31",
    },
    approvalRules: {
      pettyLimit: 2000,
      level1Limit: 10000,
      level2Limit: 50000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 20000,
    },
    pettyWallet: {
      balance: 12000,
      monthlyLimit: 15000,
      spent: 3000,
      lastReloaded: "2025-11-20T10:00:00Z",
    },
    createdAt: "2025-10-20T09:00:00Z",
    updatedAt: "2025-11-25T11:00:00Z",
  },
  {
    id: "BUD003",
    title: "Science Fair 2025",
    description: "Annual science exhibition with student projects and guest lectures",
    type: "event",
    coordinator: {
      id: 3,
      name: "Dr. Kavita Verma",
      email: "kavita.verma@school.com",
      phone: "+91-9876543212",
      avatar: null,
    },
    status: "planning",
    allocatedAmount: 250000,
    spentAmount: 35000,
    remainingAmount: 215000,
    pendingAmount: 15000,
    categories: [
      { id: "cat1", name: "Lab Materials", allocated: 80000, spent: 20000, pending: 10000, color: "#3b82f6", icon: "Flask" },
      { id: "cat2", name: "Display Boards", allocated: 40000, spent: 10000, pending: 5000, color: "#10b981", icon: "PresentationChart" },
      { id: "cat3", name: "Guest Speakers", allocated: 50000, spent: 5000, pending: 0, color: "#f59e0b", icon: "Mic" },
      { id: "cat4", name: "Prizes", allocated: 40000, spent: 0, pending: 0, color: "#8b5cf6", icon: "Award" },
      { id: "cat5", name: "Logistics", allocated: 25000, spent: 0, pending: 0, color: "#6b7280", icon: "Truck" },
      { id: "cat6", name: "Miscellaneous", allocated: 15000, spent: 0, pending: 0, color: "#94a3b8", icon: "Box" },
    ],
    timeline: {
      startDate: "2025-12-01",
      eventDate: "2026-02-15",
      closeDate: "2026-02-28",
    },
    approvalRules: {
      pettyLimit: 1500,
      level1Limit: 8000,
      level2Limit: 40000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 15000,
    },
    pettyWallet: {
      balance: 10000,
      monthlyLimit: 10000,
      spent: 0,
      lastReloaded: "2025-11-25T10:00:00Z",
    },
    createdAt: "2025-11-01T09:00:00Z",
    updatedAt: "2025-11-24T16:00:00Z",
  },
  {
    id: "BUD004",
    title: "Independence Day 2025",
    description: "Independence Day celebration with flag hoisting and cultural program",
    type: "event",
    coordinator: {
      id: 4,
      name: "Mr. Manoj Pandey",
      email: "manoj.pandey@school.com",
      phone: "+91-9876543213",
      avatar: null,
    },
    status: "closed",
    allocatedAmount: 150000,
    spentAmount: 142000,
    remainingAmount: 8000,
    pendingAmount: 0,
    categories: [
      { id: "cat1", name: "Stage Setup", allocated: 40000, spent: 38000, pending: 0, color: "#3b82f6", icon: "Layout" },
      { id: "cat2", name: "Decorations", allocated: 35000, spent: 34000, pending: 0, color: "#10b981", icon: "Palette" },
      { id: "cat3", name: "Sound System", allocated: 30000, spent: 28000, pending: 0, color: "#f59e0b", icon: "Volume2" },
      { id: "cat4", name: "Refreshments", allocated: 25000, spent: 24000, pending: 0, color: "#8b5cf6", icon: "Coffee" },
      { id: "cat5", name: "Prizes", allocated: 20000, spent: 18000, pending: 0, color: "#ec4899", icon: "Award" },
    ],
    timeline: {
      startDate: "2025-07-01",
      eventDate: "2025-08-15",
      closeDate: "2025-08-31",
    },
    approvalRules: {
      pettyLimit: 2000,
      level1Limit: 10000,
      level2Limit: 50000,
      requiresReceipt: true,
      requiresMultipleQuotes: false,
      quotesThreshold: 25000,
    },
    pettyWallet: {
      balance: 0,
      monthlyLimit: 10000,
      spent: 10000,
      lastReloaded: "2025-08-01T10:00:00Z",
    },
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2025-08-31T18:00:00Z",
  },
  {
    id: "BUD005",
    title: "Field Trip - Historical Sites",
    description: "Educational field trip to historical monuments for Class 8-10 students",
    type: "event",
    coordinator: {
      id: 5,
      name: "Mr. Amit Gupta",
      email: "amit.gupta@school.com",
      phone: "+91-9876543214",
      avatar: null,
    },
    status: "upcoming",
    allocatedAmount: 200000,
    spentAmount: 0,
    remainingAmount: 200000,
    pendingAmount: 0,
    categories: [
      { id: "cat1", name: "Transport", allocated: 80000, spent: 0, pending: 0, color: "#3b82f6", icon: "Bus" },
      { id: "cat2", name: "Entry Tickets", allocated: 30000, spent: 0, pending: 0, color: "#10b981", icon: "Ticket" },
      { id: "cat3", name: "Meals", allocated: 50000, spent: 0, pending: 0, color: "#f59e0b", icon: "Utensils" },
      { id: "cat4", name: "Guide Fees", allocated: 15000, spent: 0, pending: 0, color: "#8b5cf6", icon: "MapPin" },
      { id: "cat5", name: "Emergency Fund", allocated: 25000, spent: 0, pending: 0, color: "#ef4444", icon: "Shield" },
    ],
    timeline: {
      startDate: "2026-01-01",
      eventDate: "2026-02-20",
      closeDate: "2026-03-15",
    },
    approvalRules: {
      pettyLimit: 2500,
      level1Limit: 12000,
      level2Limit: 60000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 30000,
    },
    pettyWallet: {
      balance: 15000,
      monthlyLimit: 15000,
      spent: 0,
      lastReloaded: null,
    },
    createdAt: "2025-11-10T09:00:00Z",
    updatedAt: "2025-11-20T10:00:00Z",
  },
  {
    id: "BUD006",
    title: "Cultural Fest 2026",
    description: "Annual cultural festival with dance, drama, and music competitions",
    type: "event",
    coordinator: {
      id: 6,
      name: "Ms. Pooja Kapoor",
      email: "pooja.kapoor@school.com",
      phone: "+91-9876543215",
      avatar: null,
    },
    status: "planning",
    allocatedAmount: 400000,
    spentAmount: 50000,
    remainingAmount: 350000,
    pendingAmount: 30000,
    categories: [
      { id: "cat1", name: "Stage & Decor", allocated: 120000, spent: 25000, pending: 15000, color: "#3b82f6", icon: "Sparkles" },
      { id: "cat2", name: "Costumes", allocated: 80000, spent: 15000, pending: 10000, color: "#ec4899", icon: "Shirt" },
      { id: "cat3", name: "Sound & Lighting", allocated: 70000, spent: 10000, pending: 5000, color: "#f59e0b", icon: "Lightbulb" },
      { id: "cat4", name: "Prizes", allocated: 50000, spent: 0, pending: 0, color: "#8b5cf6", icon: "Award" },
      { id: "cat5", name: "Refreshments", allocated: 50000, spent: 0, pending: 0, color: "#10b981", icon: "Coffee" },
      { id: "cat6", name: "Miscellaneous", allocated: 30000, spent: 0, pending: 0, color: "#6b7280", icon: "Box" },
    ],
    timeline: {
      startDate: "2025-12-15",
      eventDate: "2026-03-10",
      closeDate: "2026-03-31",
    },
    approvalRules: {
      pettyLimit: 2000,
      level1Limit: 10000,
      level2Limit: 50000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 20000,
    },
    pettyWallet: {
      balance: 10000,
      monthlyLimit: 12000,
      spent: 2000,
      lastReloaded: "2025-11-22T10:00:00Z",
    },
    createdAt: "2025-11-05T09:00:00Z",
    updatedAt: "2025-11-25T14:00:00Z",
  },
];

// ============================================================================
// MOCK ACTIVITY FEED
// ============================================================================

export const MOCK_BUDGET_ACTIVITIES: Record<string, BudgetActivity[]> = {
  BUD001: [
    { id: "act1", budgetId: "BUD001", type: "expense", description: "Stage decoration materials purchased", amount: 25000, category: "Decorations", userId: 1, userName: "Mrs. Priya Sharma", timestamp: "2025-11-26T10:30:00Z" },
    { id: "act2", budgetId: "BUD001", type: "approval", description: "Catering advance approved", amount: 50000, category: "Catering", userId: 101, userName: "Principal", timestamp: "2025-11-25T15:00:00Z" },
    { id: "act3", budgetId: "BUD001", type: "expense", description: "Sound system rental paid", amount: 35000, category: "Sound & Lighting", userId: 1, userName: "Mrs. Priya Sharma", timestamp: "2025-11-24T11:00:00Z" },
    { id: "act4", budgetId: "BUD001", type: "request", description: "Purchase request for LED lights submitted", amount: 15000, category: "Sound & Lighting", userId: 2, userName: "Mr. Rahul Singh", timestamp: "2025-11-23T14:30:00Z" },
    { id: "act5", budgetId: "BUD001", type: "petty", description: "Petty cash - Stationery purchase", amount: 1200, category: "Miscellaneous", userId: 1, userName: "Mrs. Priya Sharma", timestamp: "2025-11-22T09:00:00Z" },
  ],
  BUD002: [
    { id: "act1", budgetId: "BUD002", type: "expense", description: "Sports equipment purchased", amount: 45000, category: "Equipment", userId: 2, userName: "Mr. Suresh Nair", timestamp: "2025-11-25T14:00:00Z" },
    { id: "act2", budgetId: "BUD002", type: "request", description: "Trophy order request submitted", amount: 25000, category: "Trophies & Medals", userId: 2, userName: "Mr. Suresh Nair", timestamp: "2025-11-24T10:00:00Z" },
    { id: "act3", budgetId: "BUD002", type: "approval", description: "Ground setup vendor approved", amount: 35000, category: "Ground Setup", userId: 101, userName: "Principal", timestamp: "2025-11-23T16:30:00Z" },
  ],
  BUD003: [
    { id: "act1", budgetId: "BUD003", type: "expense", description: "Lab chemicals purchased", amount: 12000, category: "Lab Materials", userId: 3, userName: "Dr. Kavita Verma", timestamp: "2025-11-24T11:30:00Z" },
    { id: "act2", budgetId: "BUD003", type: "request", description: "Display boards quote received", amount: 15000, category: "Display Boards", userId: 3, userName: "Dr. Kavita Verma", timestamp: "2025-11-22T09:00:00Z" },
  ],
};

// ============================================================================
// MOCK ALERTS
// ============================================================================

export const MOCK_BUDGET_ALERTS: Record<string, BudgetAlert[]> = {
  BUD001: [
    { id: "alert1", budgetId: "BUD001", type: "warning", message: "Catering budget 80% utilized", severity: "medium", isRead: false, createdAt: "2025-11-26T08:00:00Z" },
    { id: "alert2", budgetId: "BUD001", type: "info", message: "3 pending approvals require attention", severity: "low", isRead: false, createdAt: "2025-11-25T10:00:00Z" },
    { id: "alert3", budgetId: "BUD001", type: "warning", message: "Petty cash balance low - ₹8,500 remaining", severity: "medium", isRead: true, createdAt: "2025-11-24T09:00:00Z" },
  ],
  BUD002: [
    { id: "alert1", budgetId: "BUD002", type: "info", message: "Equipment purchase completed successfully", severity: "low", isRead: false, createdAt: "2025-11-25T15:00:00Z" },
  ],
  BUD003: [
    { id: "alert1", budgetId: "BUD003", type: "info", message: "Budget planning phase initiated", severity: "low", isRead: true, createdAt: "2025-11-20T10:00:00Z" },
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

export async function getMockBudgets(filters?: BudgetListFilters): Promise<Budget[]> {
  await simulateDelay();

  let results = [...MOCK_BUDGETS];

  if (filters?.status) {
    results = results.filter((b) => b.status === filters.status);
  }

  if (filters?.type) {
    results = results.filter((b) => b.type === filters.type);
  }

  if (filters?.coordinatorId) {
    results = results.filter((b) => b.coordinator.id === filters.coordinatorId);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(searchLower) ||
        b.description.toLowerCase().includes(searchLower) ||
        b.coordinator.name.toLowerCase().includes(searchLower)
    );
  }

  // Sort by updatedAt descending
  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  console.log(`[MOCK BUDGET] getBudgets → ${results.length} budgets`);
  return results;
}

export async function getMockBudgetById(id: string): Promise<Budget | null> {
  await simulateDelay();

  const budget = MOCK_BUDGETS.find((b) => b.id === id);
  console.log(`[MOCK BUDGET] getBudgetById(${id}) → ${budget ? "found" : "not found"}`);
  return budget || null;
}

export async function getMockBudgetKPIs(): Promise<BudgetKPIs> {
  await simulateDelay();

  const activeBudgets = MOCK_BUDGETS.filter((b) => b.status === "active" || b.status === "planning");
  const totalAllocated = activeBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalPending = activeBudgets.reduce((sum, b) => sum + b.pendingAmount, 0);
  const totalRemaining = activeBudgets.reduce((sum, b) => sum + b.remainingAmount, 0);

  const kpis: BudgetKPIs = {
    totalBudgets: MOCK_BUDGETS.length,
    activeBudgets: MOCK_BUDGETS.filter((b) => b.status === "active").length,
    totalAllocated,
    totalSpent,
    totalRemaining,
    totalPending,
    utilizationPercentage: Math.round((totalSpent / totalAllocated) * 100),
    pendingApprovals: 7, // Hardcoded for demo
  };

  console.log(`[MOCK BUDGET] getKPIs →`, kpis);
  return kpis;
}

export async function getMockBudgetActivities(budgetId: string, limit?: number): Promise<BudgetActivity[]> {
  await simulateDelay();

  const activities = MOCK_BUDGET_ACTIVITIES[budgetId] || [];
  const result = limit ? activities.slice(0, limit) : activities;

  console.log(`[MOCK BUDGET] getActivities(${budgetId}) → ${result.length} activities`);
  return result;
}

export async function getMockAllActivities(limit?: number): Promise<BudgetActivity[]> {
  await simulateDelay();

  const allActivities = Object.values(MOCK_BUDGET_ACTIVITIES)
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const result = limit ? allActivities.slice(0, limit) : allActivities;
  console.log(`[MOCK BUDGET] getAllActivities → ${result.length} activities`);
  return result;
}

export async function getMockBudgetAlerts(budgetId: string): Promise<BudgetAlert[]> {
  await simulateDelay();

  const alerts = MOCK_BUDGET_ALERTS[budgetId] || [];
  console.log(`[MOCK BUDGET] getAlerts(${budgetId}) → ${alerts.length} alerts`);
  return alerts;
}

export async function getMockAllAlerts(): Promise<BudgetAlert[]> {
  await simulateDelay();

  const allAlerts = Object.values(MOCK_BUDGET_ALERTS)
    .flat()
    .filter((a) => !a.isRead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  console.log(`[MOCK BUDGET] getAllAlerts → ${allAlerts.length} unread alerts`);
  return allAlerts;
}

export async function createMockBudget(data: Partial<Budget>): Promise<Budget> {
  await simulateDelay();

  const newBudget: Budget = {
    id: `BUD${String(MOCK_BUDGETS.length + 1).padStart(3, "0")}`,
    title: data.title || "New Budget",
    description: data.description || "",
    type: data.type || "event",
    coordinator: data.coordinator || {
      id: 1,
      name: "Mrs. Priya Sharma",
      email: "priya.sharma@school.com",
      phone: "+91-9876543210",
      avatar: null,
    },
    status: "planning",
    allocatedAmount: data.allocatedAmount || 0,
    spentAmount: 0,
    remainingAmount: data.allocatedAmount || 0,
    pendingAmount: 0,
    categories: data.categories || [],
    timeline: data.timeline || {
      startDate: new Date().toISOString().split("T")[0],
      eventDate: "",
      closeDate: "",
    },
    approvalRules: data.approvalRules || {
      pettyLimit: 2000,
      level1Limit: 10000,
      level2Limit: 50000,
      requiresReceipt: true,
      requiresMultipleQuotes: true,
      quotesThreshold: 25000,
    },
    pettyWallet: {
      balance: 0,
      monthlyLimit: 15000,
      spent: 0,
      lastReloaded: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_BUDGETS.push(newBudget);
  console.log(`[MOCK BUDGET] createBudget → ${newBudget.id}`);
  return newBudget;
}

export async function updateMockBudget(id: string, data: Partial<Budget>): Promise<Budget> {
  await simulateDelay();

  const index = MOCK_BUDGETS.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error(`Budget ${id} not found`);
  }

  MOCK_BUDGETS[index] = {
    ...MOCK_BUDGETS[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  console.log(`[MOCK BUDGET] updateBudget(${id}) → updated`);
  return MOCK_BUDGETS[index];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetsProvider = {
  getBudgets: getMockBudgets,
  getBudgetById: getMockBudgetById,
  getKPIs: getMockBudgetKPIs,
  getActivities: getMockBudgetActivities,
  getAllActivities: getMockAllActivities,
  getAlerts: getMockBudgetAlerts,
  getAllAlerts: getMockAllAlerts,
  createBudget: createMockBudget,
  updateBudget: updateMockBudget,
};
