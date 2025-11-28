// ============================================================================
// CONFIG PROVIDER - FIXED FOR STRICT AUTH-GATED LOADING + TOKEN REFRESH
// ============================================================================
// CRITICAL RULES:
// 1. Only runs INSIDE Protected route (after auth check passes)
// 2. Only runs when schoolId exists in auth store
// 3. Only runs when valid Supabase session exists
// 4. Re-fetches config when session refreshes (sessionVersion changes)
// 5. Never retries on 401/403 errors (handled by HTTP interceptor)
// 6. Shows clear error messages with retry/logout options
// 7. Gracefully handles timeout by refreshing session first
// ============================================================================

import { PropsWithChildren, useEffect, useState, useRef, useCallback } from "react";
import { Box, CircularProgress, Typography, Button, Snackbar, Alert } from "@mui/material";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { fetchSchoolConfig } from "../services/config";
import { supabase } from "../services/supabase";

// Maximum retries for transient errors (not auth errors)
const MAX_AUTO_RETRIES = 2;

export function ConfigRoot({ children }: PropsWithChildren) {
  const { schoolId, sessionVersion, isSessionValid } = useAuthStore();
  const setConfig = useConfigStore((s) => s.set);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Track if we've already fetched for this session version
  const lastFetchedSessionVersion = useRef<number>(-1);

  // Helper to show toast without blocking
  const showInfoToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  useEffect(() => {
    // ============================================================================
    // GUARD: Don't run if no schoolId
    // ============================================================================
    if (!schoolId) {
      console.log("[CONFIG PROVIDER] ⏸️  No schoolId - waiting for auth");
      setReady(false);
      return;
    }

    // ============================================================================
    // GUARD: Skip if already fetched for this session version (unless manual retry)
    // ============================================================================
    if (
      lastFetchedSessionVersion.current === sessionVersion &&
      retryCount === 0 &&
      autoRetryCount === 0
    ) {
      console.log("[CONFIG PROVIDER] ⏭️ Already fetched for this session version");
      return;
    }

    console.log(`[CONFIG PROVIDER] 🔧 Loading config for school_id: ${schoolId} (session v${sessionVersion})`);

    const loadConfig = async () => {
      try {
        // ============================================================================
        // GUARD: Verify we have a valid session before making API call
        // ============================================================================
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Try to refresh session before giving up
          console.log("[CONFIG PROVIDER] ⚠️ No session found - attempting refresh...");

          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !refreshData.session) {
            throw new Error("Session expired - please log in again");
          }

          console.log("[CONFIG PROVIDER] ✅ Session refreshed successfully");
          // Session refresh will trigger onAuthStateChange → setSession → sessionVersion bump
          // This effect will re-run with the new session
          return;
        }

        // Check if session is close to expiry
        if (!isSessionValid()) {
          console.log("[CONFIG PROVIDER] ⚠️ Session expiring soon - refreshing proactively...");
          showInfoToast("Refreshing session...");

          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.warn("[CONFIG PROVIDER] ⚠️ Proactive refresh failed, continuing with current session");
          } else {
            console.log("[CONFIG PROVIDER] ✅ Session refreshed proactively");
          }
        }

        console.log("[CONFIG PROVIDER] ✅ Valid session found, fetching config");
        const cfg = await fetchSchoolConfig(schoolId);
        setConfig(cfg);
        setError(null);
        setAutoRetryCount(0); // Reset auto-retry count on success
        lastFetchedSessionVersion.current = sessionVersion;
        console.log(`[CONFIG PROVIDER] ✅ Config loaded:`, cfg.identity?.display_name);

      } catch (err: any) {
        console.error("[CONFIG PROVIDER] ❌ Config load failed:", err);

        // Check if this is a timeout that might be due to expired session
        const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
        const is401 = err?.response?.status === 401;

        // Auto-retry for transient errors (not auth errors)
        if ((isTimeout || err?.response?.status >= 500) && autoRetryCount < MAX_AUTO_RETRIES) {
          console.log(`[CONFIG PROVIDER] 🔄 Auto-retry ${autoRetryCount + 1}/${MAX_AUTO_RETRIES}...`);
          showInfoToast(`Retrying... (${autoRetryCount + 1}/${MAX_AUTO_RETRIES})`);
          setAutoRetryCount((c) => c + 1);
          return; // Will trigger re-run of effect
        }

        // Provide user-friendly error messages
        let errorMessage = "Failed to load school configuration";

        if (err?.response) {
          const status = err.response.status;

          if (status === 404) {
            errorMessage = `School #${schoolId} configuration not found. Please contact your administrator.`;
          } else if (status === 403) {
            errorMessage = `Access denied to school #${schoolId}. Please check your permissions.`;
          } else if (status === 401 || is401) {
            errorMessage = `Authentication expired. Redirecting to login...`;
            // Let HTTP interceptor handle logout/redirect
            // Don't show error screen, just wait for redirect
            setTimeout(() => {
              if (!window.location.pathname.includes('/auth/login')) {
                useAuthStore.getState().logout();
                window.location.href = "/auth/login";
              }
            }, 1500);
          } else if (status >= 500) {
            errorMessage = `Server error (${status}). Please try again later.`;
          }
        } else if (isTimeout) {
          errorMessage = "Request timed out. Your session may have expired. Please try again.";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setReady(true);
      }
    };

    loadConfig();
  }, [schoolId, setConfig, retryCount, sessionVersion, autoRetryCount, isSessionValid, showInfoToast]);

  // ============================================================================
  // GUARD: If no schoolId, show error (shouldn't happen in Protected route)
  // ============================================================================
  if (!schoolId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          ⚠️ Configuration Error
        </Typography>
        <Typography color="text.secondary">
          No school ID found in auth state
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = "/auth/login";
          }}
        >
          Return to Login
        </Button>
      </Box>
    );
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary" variant="body1">
          {autoRetryCount > 0
            ? `Retrying... (${autoRetryCount}/${MAX_AUTO_RETRIES})`
            : "Loading school configuration..."}
        </Typography>
        <Typography color="text.disabled" variant="caption">
          School ID: {schoolId}
        </Typography>
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3,
          p: 4,
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography color="error" variant="h5" fontWeight={600}>
            ⚠️ Configuration Error
          </Typography>
          <Typography color="text.secondary" variant="body1">
            {error}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              onClick={async () => {
                // Try to refresh session before retrying
                showInfoToast("Refreshing session...");
                try {
                  await supabase.auth.refreshSession();
                } catch (e) {
                  console.warn("[CONFIG PROVIDER] Session refresh before retry failed:", e);
                }
                setReady(false);
                setError(null);
                setAutoRetryCount(0);
                setRetryCount((c) => c + 1);
              }}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                useAuthStore.getState().logout();
                window.location.href = "/auth/login";
              }}
            >
              Logout
            </Button>
          </Box>
          <Typography color="text.disabled" variant="caption" sx={{ mt: 2 }}>
            If this problem persists, please contact support.
          </Typography>
        </Box>

        {/* Toast notification */}
        <Snackbar
          open={showToast}
          autoHideDuration={3000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="info" onClose={() => setShowToast(false)}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // ============================================================================
  // SUCCESS - Render children with toast support
  // ============================================================================
  return (
    <>
      {children}
      {/* Toast notification for background operations */}
      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setShowToast(false)}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
