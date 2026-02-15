// ============================================================================
// AGENT BOOTSTRAP - Configure agents based on authenticated user role
// ============================================================================
// This module initializes AI agents with the correct persona and permissions
// based on the user's role from the auth context.
//
// CRITICAL CONSTRAINTS:
// - Agents must NOT call Supabase directly
// - Agents receive role + school_id as parameters
// - All configuration comes from AuthContext (NOT from API calls)
// - No additional backend calls besides what AuthProvider already made
//
// USAGE:
//   import { bootstrapAgents } from './agentBootstrap';
//
//   // In your component after auth is confirmed:
//   const { role, schoolId } = useAuth();
//   const agents = bootstrapAgents({ role, schoolId });
// ============================================================================

export type AgentRole = "super_admin" | "admin" | "teacher" | "student" | "parent";

export interface AgentContext {
  role: AgentRole;
  schoolId: number;
  userId?: string;
  academicYearId?: number;
}

export interface AgentConfig {
  persona: string;
  capabilities: string[];
  restrictions: string[];
  defaultPrompts: string[];
}

export interface AgentBootstrapResult {
  isInitialized: boolean;
  agentConfig: AgentConfig;
  schoolContext: {
    schoolId: number;
    academicYearId?: number;
  };
}

// ============================================================================
// AGENT CONFIGURATIONS BY ROLE
// ============================================================================

const ADMIN_AGENT_CONFIG: AgentConfig = {
  persona: "School Principal Assistant",
  capabilities: [
    "View and manage all school data",
    "Access student records and academic performance",
    "Manage teacher assignments and schedules",
    "Review financial reports and fee collections",
    "Send announcements to parents and staff",
    "Generate attendance and academic reports",
    "Manage exam schedules and results",
    "Access HR and staff management",
  ],
  restrictions: [
    "Cannot access other schools' data",
    "Cannot modify system-level configurations",
    "Cannot access super admin analytics",
  ],
  defaultPrompts: [
    "Show me today's attendance summary",
    "Which classes have pending fee dues?",
    "Generate monthly academic performance report",
    "List teachers with leave requests pending",
  ],
};

const SUPER_ADMIN_AGENT_CONFIG: AgentConfig = {
  persona: "Group Administrator Assistant",
  capabilities: [
    "View aggregated data across all schools",
    "Compare school performance metrics",
    "Access group-level financial analytics",
    "Review compliance status across schools",
    "Generate cross-school reports",
    "Monitor attendance health across campuses",
    "Track fee collection across the group",
  ],
  restrictions: [
    "Cannot modify individual school data directly",
    "Cannot access student PII without purpose",
    "Must maintain audit trail for data access",
  ],
  defaultPrompts: [
    "Compare attendance rates across all schools",
    "Show group-wide fee collection status",
    "Which schools have compliance issues?",
    "Generate monthly group performance summary",
  ],
};

const TEACHER_AGENT_CONFIG: AgentConfig = {
  persona: "Teacher Assistant",
  capabilities: [
    "View assigned classes and subjects",
    "Record and view attendance",
    "Enter and view marks",
    "Access student information for assigned classes",
    "View personal leave balance",
    "Create lesson plans",
  ],
  restrictions: [
    "Cannot access other teachers' classes",
    "Cannot view financial data",
    "Cannot modify school-wide settings",
    "Cannot access HR data",
  ],
  defaultPrompts: [
    "Show my class schedule for today",
    "Which students were absent this week?",
    "Enter marks for my latest exam",
    "Show pending assignments",
  ],
};

const DEFAULT_AGENT_CONFIG: AgentConfig = {
  persona: "School Assistant",
  capabilities: [
    "View basic school information",
    "Access help and documentation",
  ],
  restrictions: [
    "Limited to read-only access",
    "Cannot access sensitive data",
  ],
  defaultPrompts: [
    "Help me navigate the system",
    "What can I do here?",
  ],
};

// ============================================================================
// BOOTSTRAP FUNCTIONS
// ============================================================================

/**
 * Get agent configuration based on role
 */
function getAgentConfigForRole(role: AgentRole): AgentConfig {
  switch (role) {
    case "super_admin":
      return SUPER_ADMIN_AGENT_CONFIG;
    case "admin":
      return ADMIN_AGENT_CONFIG;
    case "teacher":
      return TEACHER_AGENT_CONFIG;
    default:
      return DEFAULT_AGENT_CONFIG;
  }
}

/**
 * Load admin-specific agents
 * Called when role = admin (school principal)
 */
export function loadAdminAgents(context: AgentContext): AgentConfig {
  console.log("[AGENT BOOTSTRAP] 🎓 Loading Admin agents for school:", context.schoolId);

  return {
    ...ADMIN_AGENT_CONFIG,
    // Add any dynamic configuration based on context
  };
}

/**
 * Load super admin-specific agents
 * Called when role = super_admin (group administrator)
 */
export function loadSuperAdminAgents(_context: AgentContext): AgentConfig {
  console.log("[AGENT BOOTSTRAP] 👑 Loading Super Admin agents");

  return {
    ...SUPER_ADMIN_AGENT_CONFIG,
    // Add any dynamic configuration based on context
  };
}

/**
 * Load teacher-specific agents
 * Called when role = teacher
 */
export function loadTeacherAgents(context: AgentContext): AgentConfig {
  console.log("[AGENT BOOTSTRAP] 👨‍🏫 Loading Teacher agents for school:", context.schoolId);

  return {
    ...TEACHER_AGENT_CONFIG,
    // Add any dynamic configuration based on context
  };
}

/**
 * Main bootstrap function - Initialize agents based on auth context
 *
 * @param context - Auth context containing role and schoolId
 * @returns Agent bootstrap result with configuration
 *
 * @example
 * const { role, schoolId, userId } = useAuth();
 *
 * if (role && schoolId) {
 *   const agents = bootstrapAgents({ role, schoolId, userId });
 *   // Use agents.agentConfig for chatbot persona
 * }
 */
export function bootstrapAgents(context: AgentContext): AgentBootstrapResult {
  console.log("[AGENT BOOTSTRAP] 🚀 Initializing agents:", {
    role: context.role,
    schoolId: context.schoolId,
    userId: context.userId?.substring(0, 8) + "...",
  });

  // Validate context
  if (!context.role || !context.schoolId) {
    console.error("[AGENT BOOTSTRAP] ❌ Invalid context - missing role or schoolId");
    return {
      isInitialized: false,
      agentConfig: DEFAULT_AGENT_CONFIG,
      schoolContext: {
        schoolId: context.schoolId || 0,
        academicYearId: context.academicYearId,
      },
    };
  }

  // Load role-specific agents
  let agentConfig: AgentConfig;

  switch (context.role) {
    case "admin":
      agentConfig = loadAdminAgents(context);
      break;
    case "super_admin":
      agentConfig = loadSuperAdminAgents(context);
      break;
    case "teacher":
      agentConfig = loadTeacherAgents(context);
      break;
    default:
      console.warn("[AGENT BOOTSTRAP] ⚠️ Unknown role, using default config:", context.role);
      agentConfig = getAgentConfigForRole(context.role);
  }

  console.log("[AGENT BOOTSTRAP] ✅ Agents initialized with persona:", agentConfig.persona);

  return {
    isInitialized: true,
    agentConfig,
    schoolContext: {
      schoolId: context.schoolId,
      academicYearId: context.academicYearId,
    },
  };
}

/**
 * Get agent persona string for chatbot system prompt
 *
 * @param role - User role
 * @returns Persona description for system prompt
 */
export function getAgentPersona(role: AgentRole): string {
  const config = getAgentConfigForRole(role);
  return config.persona;
}

/**
 * Get agent capabilities for display or system prompt
 *
 * @param role - User role
 * @returns List of capabilities
 */
export function getAgentCapabilities(role: AgentRole): string[] {
  const config = getAgentConfigForRole(role);
  return config.capabilities;
}

/**
 * Get default prompts/suggestions for the chatbot UI
 *
 * @param role - User role
 * @returns List of suggested prompts
 */
export function getDefaultPrompts(role: AgentRole): string[] {
  const config = getAgentConfigForRole(role);
  return config.defaultPrompts;
}

export default bootstrapAgents;
