// ============================================================================
// HTTP CLIENT - FIXED FOR PROPER API ROUTING
// ============================================================================
// Base URL already includes /api/v1, so all service calls should use relative paths
// Example: http.get("/profiles/me") → http://localhost:8000/api/v1/profiles/me
// ============================================================================

import axios from "axios";
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

export const http = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Add auth token + debug logging (ENHANCED)
// ============================================================================
http.interceptors.request.use(
  (config) => {
    console.log(`[HTTP] 🔍 Interceptor triggered for ${config.method?.toUpperCase()} ${config.url}`);

    // ============================================================================
    // CRITICAL: Get access token from Supabase session (SYNCHRONOUS)
    // ============================================================================
    try {
      const token = getAccessToken(); // Now synchronous!

      console.log(`[HTTP] 🔑 Token status:`, {
        exists: !!token,
        length: token?.length || 0,
        preview: token ? `${token.substring(0, 30)}...` : 'NULL'
      });

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[HTTP] ✅ Authorization header SET`);
      } else {
        console.error(`[HTTP] ❌ NO TOKEN - Request will fail with 401`);
      }
    } catch (error) {
      console.error(`[HTTP] 💥 Exception getting token:`, error);
    }

    // Debug logging - shows final resolved URL
    const fullURL = config.baseURL
      ? `${config.baseURL}${config.url}`
      : config.url;

    console.log(`[HTTP] 📡 Final request:`, {
      url: fullURL,
      method: config.method?.toUpperCase(),
      hasAuthHeader: !!config.headers.Authorization,
      authHeaderPreview: config.headers.Authorization ? 'Bearer ***' : 'MISSING',
    });

    return config;
  },
  (error) => {
    console.error("[HTTP] ❌ Interceptor error:", error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors + auto-refresh on 401
// ============================================================================
// CRITICAL: Implements automatic token refresh without breaking pool fixes
// - On 401: Try to refresh token ONCE before logging out
// - Prevents retry loops with _retry flag
// - Respects profile cache (doesn't refetch profile)
// - Only logs out if refresh fails
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
    // Debug logging for successful responses
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      console.error(`[API ERROR] ${status} ${error.config?.url}`, data);

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
