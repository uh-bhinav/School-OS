// ============================================================================
// HTTP CLIENT - OPTIMIZED FOR CONNECTION POOL MANAGEMENT
// ============================================================================
// Base URL already includes /api/v1, so all service calls should use relative paths
// Example: http.get("/profiles/me") → http://localhost:8000/api/v1/profiles/me
//
// OPTIMIZATION FEATURES:
// - Request deduplication: Prevents duplicate concurrent requests
// - Connection limiting: Caps max concurrent requests
// - Token refresh: Handles 401s with single refresh attempt
// - Timeout handling: Shorter timeouts to release connections faster
// ============================================================================

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAccessToken, supabase } from "./supabase";
import { useAuthStore } from "../stores/useAuthStore";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// In development mode, allow empty baseURL for MSW (Mock Service Worker)
// In production, baseURL must be set
if (!baseURL && import.meta.env.PROD) {
  throw new Error(
    "Missing API base URL. Please check your .env file for VITE_API_BASE_URL."
  );
}

// If baseURL is empty (dev mode with MSW), use relative URLs
// MSW will intercept these requests and return mock data
const resolvedBaseURL = baseURL || "";

if (!baseURL && import.meta.env.DEV) {
  console.log("🔶 HTTP Client: Running in MOCK mode (MSW will intercept all requests)");
} else {
  console.log("🔶 HTTP Client: API Base URL:", resolvedBaseURL);
}

// ============================================================================
// REQUEST DEDUPLICATION - Prevent duplicate concurrent requests
// ============================================================================
const pendingRequests = new Map<string, Promise<AxiosResponse>>();
const MAX_CONCURRENT_REQUESTS = 6; // Browser limit per domain
let activeRequests = 0;

function getRequestKey(config: AxiosRequestConfig): string {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
}

async function waitForSlot(): Promise<void> {
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export const http = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 15000, // Reduced from 30s to 15s - release connections faster
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Optimized with connection management
// ============================================================================
// Features:
// - Request deduplication for GET requests
// - Connection throttling
// - Minimal logging (production-ready)
// ============================================================================
http.interceptors.request.use(
  async (config) => {
    // ========================================================================
    // CONNECTION THROTTLING - Wait for available slot
    // ========================================================================
    await waitForSlot();
    activeRequests++;

    // Check for duplicate GET requests (deduplication)
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(config);
      const pending = pendingRequests.get(requestKey);
      if (pending) {
        // Return cached promise instead of making new request
        console.log(`[HTTP] ♻️ Deduplicating request: ${config.url}`);
        activeRequests--;
        throw { __DEDUPE__: true, promise: pending };
      }
    }

    // ========================================================================
    // AUTH TOKEN - Get from Zustand or localStorage
    // ========================================================================
    try {
      let token: string | null | undefined = useAuthStore.getState().getAccessToken();
      if (!token) {
        token = getAccessToken();
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error(`[HTTP] Token error:`, error);
    }

    // Minimal logging in production
    if (import.meta.env.DEV) {
      console.log(`[HTTP] → ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors + auto-refresh on 401
// ============================================================================
// Features:
// - Tracks active requests for connection management
// - Handles deduplication responses
// - Auto-refresh on 401 (single attempt)
// - Minimal logging for production
// ============================================================================

// Track ongoing refresh to prevent race conditions
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

http.interceptors.response.use(
  (response) => {
    // Decrement active requests counter
    activeRequests = Math.max(0, activeRequests - 1);

    // Remove from pending requests (for deduplication)
    if (response.config.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);
    }

    // Minimal logging
    if (import.meta.env.DEV) {
      console.log(`[HTTP] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Decrement active requests counter
    activeRequests = Math.max(0, activeRequests - 1);

    // Handle deduplicated request - return the cached promise
    if (error.__DEDUPE__) {
      return error.promise;
    }

    const originalRequest = error.config;

    // Remove from pending requests on error
    if (originalRequest?.method?.toLowerCase() === 'get') {
      const requestKey = getRequestKey(originalRequest);
      pendingRequests.delete(requestKey);
    }

    // Handle timeout errors - don't retry to avoid connection spam
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`[HTTP] ⏰ Timeout: ${error.config?.url}`);
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;

      if (import.meta.env.DEV) {
        console.error(`[HTTP] ← ${status} ${error.config?.url}`, data);
      }

      // ========================================================================
      // 401 UNAUTHORIZED - Try token refresh before logging out
      // ========================================================================
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite retry loop

        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log("[HTTP] ⏳ Token refresh in progress, queueing request...");

          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(http(originalRequest));
            });
          });
        }

        isRefreshing = true;
        console.log("[HTTP] 🔄 401 Unauthorized - attempting token refresh...");

        try {
          // Attempt to refresh the session
          const { data, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !data.session) {
            throw new Error(refreshError?.message || "No session after refresh");
          }

          const newToken = data.session.access_token;
          console.log("[HTTP] ✅ Token refreshed successfully");

          // CRITICAL: Update Zustand store with new session
          // This ensures subsequent requests use the new token
          // Note: AuthProvider's onAuthStateChange will also fire, but this ensures immediate update
          useAuthStore.getState().setSession(data.session);

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Notify all queued requests
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request
          console.log("[HTTP] 🔁 Retrying original request with new token...");
          return http(originalRequest);

        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          console.error("[HTTP] ❌ Token refresh failed:", refreshError);
          isRefreshing = false;
          refreshSubscribers = [];

          console.error("❌ Session expired - clearing auth state and redirecting to login");
          useAuthStore.getState().logout();

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = "/auth/login";
          }

          return Promise.reject(error);
        }
      }

      // ========================================================================
      // OTHER HTTP ERRORS
      // ========================================================================
      if (status === 403) {
        console.error("❌ Forbidden:", data);
      } else if (status === 404) {
        console.warn("⚠️ Not Found:", error.config?.url);
      } else if (status >= 500) {
        console.error("❌ Server error:", data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("❌ Network error: No response received", error.request);
    } else {
      // Something else happened
      console.error("❌ Request error:", error.message);
    }

    return Promise.reject(error);
  }
);
