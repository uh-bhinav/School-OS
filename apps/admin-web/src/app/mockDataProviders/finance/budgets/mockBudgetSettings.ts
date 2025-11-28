// ============================================================================
// MOCK BUDGET SETTINGS DATA PROVIDER
// ============================================================================
// Mock data for budget settings and configuration
// ============================================================================

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

export interface ApprovalRule {
  id: string;
  name: string;
  condition: string;
  approverRole: string;
  autoApprove: boolean;
  order: number;
}

export interface NotificationPreference {
  event: string;
  enabled: boolean;
  recipients: string[];
}

interface CategoryDefault {
  name: string;
  icon: string;
  color: string;
}

interface RolePermission {
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
// MOCK DATA
// ============================================================================

export const MOCK_BUDGET_SETTINGS: BudgetSettings = {
  general: {
    fiscalYearStart: "April",
    defaultCurrency: "INR",
    currencySymbol: "₹",
    dateFormat: "DD/MM/YYYY",
    autoNumbering: {
      enabled: true,
      prefix: "BUD",
      padLength: 3,
    },
  },
  approvalWorkflow: {
    enabled: true,
    defaultRules: [
      {
        id: "RULE001",
        name: "Coordinator Approval",
        condition: "amount <= 5000",
        approverRole: "Event Coordinator",
        autoApprove: false,
        order: 1,
      },
      {
        id: "RULE002",
        name: "Admin Approval",
        condition: "amount > 5000 && amount <= 15000",
        approverRole: "Finance Admin",
        autoApprove: false,
        order: 2,
      },
      {
        id: "RULE003",
        name: "Principal Approval",
        condition: "amount > 15000",
        approverRole: "Principal",
        autoApprove: false,
        order: 3,
      },
    ],
    escalationEnabled: true,
    escalationDays: 3,
    reminderFrequency: "daily",
  },
  notifications: {
    channels: ["email", "in-app"],
    preferences: [
      {
        event: "budget_created",
        enabled: true,
        recipients: ["creator", "finance_admin"],
      },
      {
        event: "budget_approved",
        enabled: true,
        recipients: ["creator", "finance_admin"],
      },
      {
        event: "budget_rejected",
        enabled: true,
        recipients: ["creator"],
      },
      {
        event: "expense_logged",
        enabled: true,
        recipients: ["budget_owner"],
      },
      {
        event: "approval_needed",
        enabled: true,
        recipients: ["approver"],
      },
      {
        event: "threshold_warning",
        enabled: true,
        recipients: ["budget_owner", "finance_admin"],
      },
      {
        event: "budget_overspent",
        enabled: true,
        recipients: ["budget_owner", "finance_admin", "principal"],
      },
      {
        event: "petty_low_balance",
        enabled: true,
        recipients: ["budget_owner", "finance_admin"],
      },
    ],
  },
  alerts: {
    budgetThreshold: 80, // Alert at 80% utilization
    categoryThreshold: 90, // Alert at 90% category utilization
    pendingApprovalDays: 2, // Alert if approval pending > 2 days
    pettyLowBalance: 3000, // Alert if petty balance < 3000
  },
  categories: {
    defaults: [
      { name: "Stage & Venue", icon: "theater_comedy", color: "#4CAF50" },
      { name: "Decorations", icon: "celebration", color: "#FF9800" },
      { name: "Costumes", icon: "checkroom", color: "#9C27B0" },
      { name: "Sound & Lighting", icon: "speaker", color: "#2196F3" },
      { name: "Catering", icon: "restaurant", color: "#F44336" },
      { name: "Printing", icon: "print", color: "#795548" },
      { name: "Awards & Prizes", icon: "emoji_events", color: "#FFC107" },
      { name: "Transportation", icon: "directions_bus", color: "#607D8B" },
      { name: "Miscellaneous", icon: "category", color: "#9E9E9E" },
    ],
    allowCustom: true,
    maxCategories: 15,
  },
  pettyWallet: {
    enabled: true,
    monthlyLimit: 15000,
    transactionLimit: 2000,
    requireReceipt: true,
    receiptThreshold: 500, // Receipt required above this amount
    approvalRequired: false, // Petty expenses don't need approval
  },
  audit: {
    enabled: true,
    retentionDays: 365,
    trackAllChanges: true,
    exportFormats: ["csv", "pdf"],
  },
  permissions: {
    roles: [
      {
        id: "finance_admin",
        name: "Finance Admin",
        permissions: [
          "create_budget",
          "edit_budget",
          "delete_budget",
          "approve_all",
          "view_reports",
          "export_reports",
          "manage_settings",
        ],
      },
      {
        id: "principal",
        name: "Principal",
        permissions: [
          "approve_all",
          "view_reports",
          "export_reports",
          "view_audit",
        ],
      },
      {
        id: "coordinator",
        name: "Event Coordinator",
        permissions: [
          "create_budget",
          "edit_own_budget",
          "log_expense",
          "view_own_reports",
          "request_approval",
        ],
      },
      {
        id: "teacher",
        name: "Teacher",
        permissions: [
          "view_assigned_budgets",
          "log_expense",
          "request_approval",
        ],
      },
    ],
  },
  integrations: {
    accounting: {
      enabled: false,
      provider: null,
      syncFrequency: "daily",
    },
    banking: {
      enabled: false,
      provider: null,
    },
    calendar: {
      enabled: true,
      provider: "google",
      syncEvents: true,
    },
  },
};

// Approval rules can be customized per budget
export const MOCK_CUSTOM_APPROVAL_RULES: Record<string, ApprovalRule[]> = {
  BUD001: [
    {
      id: "RULE_BUD001_1",
      name: "Quick Approval",
      condition: "amount <= 2000",
      approverRole: "Event Coordinator",
      autoApprove: true,
      order: 1,
    },
    {
      id: "RULE_BUD001_2",
      name: "Coordinator Review",
      condition: "amount > 2000 && amount <= 10000",
      approverRole: "Event Coordinator",
      autoApprove: false,
      order: 2,
    },
    {
      id: "RULE_BUD001_3",
      name: "Principal Sign-off",
      condition: "amount > 10000",
      approverRole: "Principal",
      autoApprove: false,
      order: 3,
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

export async function getMockBudgetSettings(): Promise<BudgetSettings> {
  await simulateDelay();
  console.log(`[MOCK BUDGET] getSettings() → loaded`);
  return { ...MOCK_BUDGET_SETTINGS };
}

export async function updateMockBudgetSettings(
  updates: Partial<BudgetSettings>
): Promise<BudgetSettings> {
  await simulateDelay();

  // Deep merge updates (simplified - in real app use lodash merge)
  Object.assign(MOCK_BUDGET_SETTINGS, updates);

  console.log(`[MOCK BUDGET] updateSettings() → updated`);
  return { ...MOCK_BUDGET_SETTINGS };
}

export async function getMockApprovalRules(budgetId?: string): Promise<ApprovalRule[]> {
  await simulateDelay();

  if (budgetId && MOCK_CUSTOM_APPROVAL_RULES[budgetId]) {
    console.log(`[MOCK BUDGET] getApprovalRules(${budgetId}) → custom rules`);
    return [...MOCK_CUSTOM_APPROVAL_RULES[budgetId]];
  }

  console.log(`[MOCK BUDGET] getApprovalRules() → default rules`);
  return [...MOCK_BUDGET_SETTINGS.approvalWorkflow.defaultRules];
}

export async function updateMockApprovalRules(
  budgetId: string,
  rules: ApprovalRule[]
): Promise<ApprovalRule[]> {
  await simulateDelay();

  MOCK_CUSTOM_APPROVAL_RULES[budgetId] = rules;

  console.log(`[MOCK BUDGET] updateApprovalRules(${budgetId}) → ${rules.length} rules`);
  return [...rules];
}

export async function getMockNotificationPreferences(): Promise<NotificationPreference[]> {
  await simulateDelay();
  console.log(`[MOCK BUDGET] getNotificationPreferences() → loaded`);
  return [...MOCK_BUDGET_SETTINGS.notifications.preferences];
}

export async function updateMockNotificationPreference(
  event: string,
  updates: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  await simulateDelay();

  const pref = MOCK_BUDGET_SETTINGS.notifications.preferences.find(
    (p) => p.event === event
  );

  if (pref) {
    Object.assign(pref, updates);
    console.log(`[MOCK BUDGET] updateNotificationPreference(${event}) → updated`);
    return { ...pref };
  }

  throw new Error(`Notification preference not found: ${event}`);
}

export async function getMockCategoryDefaults(): Promise<BudgetSettings["categories"]["defaults"]> {
  await simulateDelay();
  console.log(`[MOCK BUDGET] getCategoryDefaults() → loaded`);
  return [...MOCK_BUDGET_SETTINGS.categories.defaults];
}

export async function addMockCategoryDefault(
  category: BudgetSettings["categories"]["defaults"][0]
): Promise<BudgetSettings["categories"]["defaults"]> {
  await simulateDelay();

  MOCK_BUDGET_SETTINGS.categories.defaults.push(category);

  console.log(`[MOCK BUDGET] addCategoryDefault(${category.name}) → added`);
  return [...MOCK_BUDGET_SETTINGS.categories.defaults];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockBudgetSettingsProvider = {
  getSettings: getMockBudgetSettings,
  updateSettings: updateMockBudgetSettings,
  getApprovalRules: getMockApprovalRules,
  updateApprovalRules: updateMockApprovalRules,
  getNotificationPreferences: getMockNotificationPreferences,
  updateNotificationPreference: updateMockNotificationPreference,
  getCategoryDefaults: getMockCategoryDefaults,
  addCategoryDefault: addMockCategoryDefault,
};
