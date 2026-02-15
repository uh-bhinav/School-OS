/**
 * Chat Service for ADK Multi-Agent Backend Integration
 *
 * This service handles communication with the FastAPI backend running
 * the Google ADK multi-agent orchestration system.
 *
 * Backend URL: http://localhost:8004
 * Endpoints:
 *   - POST /api/chat/new_session - Create new session (with role)
 *   - POST /api/chat/send - Send message to agents (with role)
 *
 * ROLE-BASED ROUTING:
 *   - role="principal" → Principal/Admin agents (attendance, marks, fees, etc.)
 *   - role="super_admin" → Super Admin agents (group overview, compliance, etc.)
 */

const API_BASE_URL = import.meta.env.VITE_ADK_API_URL || "http://localhost:8004";

// Debug: Log the API URL being used
console.log("🔍 ADK API URL:", API_BASE_URL);
console.log("🔍 Environment variable VITE_ADK_API_URL:", import.meta.env.VITE_ADK_API_URL);

/**
 * User role type for routing to appropriate agents
 */
export type ChatRole = "principal" | "super_admin";

/**
 * Chart data from backend graph_tool
 */
export interface ChartResponse {
  /** Base64 encoded PNG image */
  base64_image: string;
  /** Chart title (optional) */
  title?: string;
  /** Chart type: line, bar, pie, scatter, etc. */
  chart_type?: string;
}

/**
 * Response from the ADK backend
 */
export interface AgentResponse {
  message: string;
  agentId: string;
  timestamp: string;
  session_id: string;
  /** Optional chart visualization */
  chart?: ChartResponse;
}

/**
 * Session management - maps frontend session IDs to backend session IDs
 * Sessions are stored per role to prevent cross-pollution
 */
const sessionMap = new Map<string, { backendSessionId: string; role: ChatRole }>();

/**
 * Get the current chat role based on URL path
 * This allows automatic role detection for the chat service
 */
export const getChatRoleFromPath = (): ChatRole => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/group-overview")) {
      return "super_admin";
    }
  }
  return "principal";
};

/**
 * Send a message to the ADK backend and get a response
 *
 * @param frontendSessionId - The frontend session ID from useChatStore
 * @param message - The user's message
 * @param role - The user role (principal or super_admin), auto-detected if not provided
 * @returns Promise<AgentResponse> - The agent's response
 * @throws Error if the request fails
 */
export const sendMessageToBackend = async (
  frontendSessionId: string,
  message: string,
  role?: ChatRole
): Promise<AgentResponse> => {
  // Auto-detect role from current path if not provided
  const effectiveRole = role || getChatRoleFromPath();

  console.log("🎭 Chat role:", effectiveRole);

  try {
    // Get existing session info
    const sessionInfo = sessionMap.get(frontendSessionId);
    let backendSessionId = sessionInfo?.backendSessionId;

    // Create new session if:
    // 1. No session exists
    // 2. Role changed (need new session for different agent set)
    const needsNewSession = !backendSessionId || (sessionInfo && sessionInfo.role !== effectiveRole);

    if (needsNewSession) {
      console.log("📝 Creating new backend session for role:", effectiveRole);
      console.log("📡 Calling:", `${API_BASE_URL}/api/chat/new_session`);

      const newSessionResponse = await fetch(
        `${API_BASE_URL}/api/chat/new_session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: effectiveRole }),
        }
      );

      console.log("✅ New session response status:", newSessionResponse.status);

      if (!newSessionResponse.ok) {
        throw new Error(
          `Failed to create session: ${newSessionResponse.statusText}`
        );
      }

      const sessionData = await newSessionResponse.json();
      backendSessionId = sessionData.session_id;

      if (!backendSessionId) {
        throw new Error("Backend did not return a valid session_id");
      }

      sessionMap.set(frontendSessionId, { backendSessionId, role: effectiveRole });
      console.log("✅ Backend session created:", backendSessionId, "for role:", effectiveRole);
    }

    // Send message to backend with session ID AND role
    console.log("📤 Sending message to:", `${API_BASE_URL}/api/chat/send`);
    console.log("📝 Message:", message);
    console.log("🔑 Session ID:", backendSessionId);
    console.log("🎭 Role:", effectiveRole);

    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: backendSessionId,
        role: effectiveRole,  // CRITICAL: Pass role to route to correct agents
      }),
    });

    console.log("✅ Send message response status:", response.status);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data: AgentResponse = await response.json();
    console.log("✅ Received response:", data);
    return data;
  } catch (error) {
    console.error("❌ Error communicating with ADK backend:", error);
    if (error instanceof Error) {
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

/**
 * Reset the backend session for a frontend session
 * Useful when starting a new conversation
 *
 * @param frontendSessionId - The frontend session ID to reset
 */
export const resetBackendSession = (frontendSessionId: string): void => {
  sessionMap.delete(frontendSessionId);
};

/**
 * Clear all backend sessions
 * Useful when logging out or clearing all chats
 */
export const clearAllBackendSessions = (): void => {
  sessionMap.clear();
};

/**
 * Check if the ADK backend is reachable
 *
 * @returns Promise<boolean> - True if backend is healthy
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
};
