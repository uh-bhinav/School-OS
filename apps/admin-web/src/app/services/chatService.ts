/**
 * Chat Service for ADK Multi-Agent Backend Integration
 *
 * This service handles communication with the FastAPI backend running
 * the Google ADK multi-agent orchestration system.
 *
 * Backend URL: http://localhost:8000
 * Endpoints:
 *   - POST /api/chat/new_session - Create new session
 *   - POST /api/chat/send - Send message to agents
 */

const API_BASE_URL = import.meta.env.VITE_ADK_API_URL || "http://localhost:8004";

// Debug: Log the API URL being used
console.log("🔍 ADK API URL:", API_BASE_URL);
console.log("🔍 Environment variable VITE_ADK_API_URL:", import.meta.env.VITE_ADK_API_URL);

/**
 * Response from the ADK backend
 */
export interface AgentResponse {
  message: string;
  agentId: string;
  timestamp: string;
  session_id: string;
}

/**
 * Session management - maps frontend session IDs to backend session IDs
 * This allows us to maintain separate sessions for multi-session support
 */
const sessionMap = new Map<string, string>();

/**
 * Send a message to the ADK backend and get a response
 *
 * @param frontendSessionId - The frontend session ID from useChatStore
 * @param message - The user's message
 * @returns Promise<AgentResponse> - The agent's response
 * @throws Error if the request fails
 */
export const sendMessageToBackend = async (
  frontendSessionId: string,
  message: string
): Promise<AgentResponse> => {
  try {
    // Get or create backend session ID
    let backendSessionId = sessionMap.get(frontendSessionId);

    // If no backend session exists for this frontend session, create one
    if (!backendSessionId) {
      console.log("📝 Creating new backend session...");
      console.log("📡 Calling:", `${API_BASE_URL}/api/chat/new_session`);

      const newSessionResponse = await fetch(
        `${API_BASE_URL}/api/chat/new_session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      sessionMap.set(frontendSessionId, backendSessionId);
      console.log("✅ Backend session created:", backendSessionId);
    }

    // Send message to backend with session ID
    console.log("📤 Sending message to:", `${API_BASE_URL}/api/chat/send`);
    console.log("📝 Message:", message);
    console.log("🔑 Session ID:", backendSessionId);

    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: backendSessionId,
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
