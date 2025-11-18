// ============================================================================
// CONFIG PROVIDER - FIXED FOR STRICT AUTH-GATED LOADING
// ============================================================================
// CRITICAL RULES:
// 1. Only runs INSIDE Protected route (after auth check passes)
// 2. Only runs when schoolId exists in auth store
// 3. Only runs when valid Supabase session exists
// 4. Never retries on 401/403 errors
// 5. Shows clear error messages with retry/logout options
// ============================================================================

import { PropsWithChildren, useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { fetchSchoolConfig } from "../services/config";
import { supabase } from "../services/supabase";

export function ConfigRoot({ children }: PropsWithChildren) {
  const { schoolId } = useAuthStore();
  const setConfig = useConfigStore((s) => s.set);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // ============================================================================
    // GUARD: Don't run if no schoolId
    // ============================================================================
    if (!schoolId) {
      console.log("[CONFIG PROVIDER] ⏸️  No schoolId - waiting for auth");
      setReady(false);
      return;
    }

    console.log(`[CONFIG PROVIDER] 🔧 Loading config for school_id: ${schoolId}`);

    (async () => {
      try {
        // ============================================================================
        // GUARD: Verify we have a valid session before making API call
        // ============================================================================
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No valid session found - please log in again");
        }

        console.log("[CONFIG PROVIDER] ✅ Valid session found, fetching config");
        const cfg = await fetchSchoolConfig(schoolId);
        setConfig(cfg);
        setError(null);
        console.log(`[CONFIG PROVIDER] ✅ Config loaded:`, cfg.identity?.display_name);
      } catch (err) {
        console.error("[CONFIG PROVIDER] ❌ Config load failed:", err);

        // Provide user-friendly error messages
        let errorMessage = "Failed to load school configuration";

        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as any;
          const status = axiosError.response?.status;

          if (status === 404) {
            errorMessage = `School #${schoolId} configuration not found. Please contact your administrator.`;
          } else if (status === 403) {
            errorMessage = `Access denied to school #${schoolId}. Please check your permissions.`;
          } else if (status === 401) {
            errorMessage = `Authentication expired. Please log in again.`;
            // Auto-logout on 401
            setTimeout(() => {
              useAuthStore.getState().logout();
              window.location.href = "/auth/login";
            }, 2000);
          } else if (status >= 500) {
            errorMessage = `Server error (${status}). Please try again later.`;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setReady(true);
      }
    })();
  }, [schoolId, setConfig, retryCount]);

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
          Loading school configuration...
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
              onClick={() => {
                setReady(false);
                setError(null);
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
      </Box>
    );
  }

  // ============================================================================
  // SUCCESS - Render children
  // ============================================================================
  return <>{children}</>;
}
