// ============================================================================
// AUTH PROVIDER - FIXED TO PREVENT /profiles/me SPAM + AUTO TOKEN REFRESH
// ============================================================================
// CRITICAL FIX FOR SUPABASE AUTH POOL EXHAUSTION:
//
// Root cause:
// - AuthProvider re-ran bootstrap multiple times
// - onAuthStateChange fired for INITIAL_SESSION, TOKEN_REFRESHED, etc.
// - Each event triggered fresh /profiles/me call
// - Multiple components mounting triggered additional calls
// - Result: 10-20 /profiles/me calls within seconds → Supabase Auth pool exhaustion
//
// Solution:
// - Single bootstrap with useRef guard
// - Only fetch profile on SIGNED_IN (new login)
// - Use cached profile for INITIAL_SESSION
// - Ignore TOKEN_REFRESHED events (don't refetch profile)
// - Profile cache in useAuthStore prevents redundant API calls
//
// TOKEN REFRESH STRATEGY:
// - Supabase autoRefreshToken handles most refreshes automatically
// - AuthProvider monitors token expiry and proactively refreshes 5 min before
// - On TOKEN_REFRESHED event: Update Zustand session (NO profile refetch)
// - On ALL auth events: Sync session to Zustand store via setSession()
// - axios interceptor handles reactive refresh on 401 errors
// - Multi-tab sync via localStorage events
// ============================================================================

import { PropsWithChildren, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../stores/useAuthStore";

export function AuthRoot({ children }: PropsWithChildren) {
  const { clear, fetchProfile, setSession } = useAuthStore();
  const hasBootstrapped = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);

  // ========================================================================
  // PROACTIVE TOKEN REFRESH - Check every minute, refresh 5min before expiry
  // ========================================================================
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          return; // No session, nothing to refresh
        }

        // Check if token is expiring soon (within 5 minutes)
        const expiresAt = session.expires_at; // Unix timestamp in seconds
        if (!expiresAt) return;

        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const timeUntilExpiry = expiresAt - now;

        // If token expires in less than 5 minutes (300 seconds), refresh it
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          console.log(`[AUTH PROVIDER] ⏰ Token expiring in ${timeUntilExpiry}s - refreshing proactively...`);

          const { data, error } = await supabase.auth.refreshSession();

          if (error) {
            console.error("[AUTH PROVIDER] ❌ Proactive refresh failed:", error);
            return;
          }

          if (data.session) {
            console.log("[AUTH PROVIDER] ✅ Token refreshed proactively");
            // Note: TOKEN_REFRESHED event will be fired, handled by onAuthStateChange below
          }
        }
      } catch (error) {
        console.error("[AUTH PROVIDER] ❌ Error checking token expiry:", error);
      }
    };

    // Check token expiry every minute
    refreshTimerRef.current = setInterval(checkAndRefreshToken, 60 * 1000);

    // Also check immediately
    checkAndRefreshToken();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // ========================================================================
    // CRITICAL: ONLY BOOTSTRAP ONCE
    // ========================================================================
    if (hasBootstrapped.current) {
      console.log("[AUTH PROVIDER] ⏭️ Skipping bootstrap (already initialized)");
      return;
    }

    hasBootstrapped.current = true;
    console.log("[AUTH PROVIDER] 🔐 Initializing auth listener (ONCE)");

    // ========================================================================
    // INITIAL SESSION CHECK
    // ========================================================================
    // Check if user already has session (page reload, new tab, etc.)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("[AUTH PROVIDER] ❌ Session check error:", error);
        clear();
        return;
      }

      // CRITICAL: Always sync session to Zustand store
      // This ensures accessToken is available for API calls immediately
      setSession(session);

      if (session) {
        console.log("[AUTH PROVIDER] 📦 Restoring session from storage");

        // Use cached profile if available (prevents /profiles/me on every page load)
        fetchProfile(false).catch((error) => {
          console.error("[AUTH PROVIDER] ❌ Failed to restore profile:", error);
          // Don't clear on first failure - might be a transient network issue
          console.log("[AUTH PROVIDER] ⚠️ Will retry on next navigation");
        });
      } else {
        console.log("[AUTH PROVIDER] 👤 No existing session");
      }
    });

    // ========================================================================
    // AUTH STATE LISTENER
    // ========================================================================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH PROVIDER] 📡 Auth event: ${event}`, session ? "✅ Session exists" : "❌ No session");

      // ======================================================================
      // CRITICAL: Always sync session to Zustand store
      // This ensures accessToken is updated on EVERY auth event
      // Including TOKEN_REFRESHED which gives us the new rotated token
      // ======================================================================
      setSession(session);

      // ======================================================================
      // SIGNED OUT - Clear everything
      // ======================================================================
      if (event === "SIGNED_OUT" || !session) {
        console.log("[AUTH PROVIDER] 👋 Signed out - clearing state");
        clear();
        return;
      }

      // ======================================================================
      // SIGNED IN - New login, fetch fresh profile
      // ======================================================================
      if (event === "SIGNED_IN") {
        console.log("[AUTH PROVIDER] 🎉 New sign in - fetching fresh profile");

        try {
          await fetchProfile(true); // Force fresh fetch on new login
          console.log("[AUTH PROVIDER] ✅ Profile loaded successfully");
        } catch (error: any) {
          console.error("[AUTH PROVIDER] ❌ Profile fetch failed:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });

          // Check if it's a 401 (token issue)
          if (error.response?.status === 401) {
            console.error("[AUTH PROVIDER] 🚨 401 Unauthorized - clearing session");
          }

          clear();
          await supabase.auth.signOut();
        }
        return;
      }

      // ======================================================================
      // TOKEN_REFRESHED - Session already synced above, NO profile refetch
      // ======================================================================
      if (event === "TOKEN_REFRESHED") {
        console.log("[AUTH PROVIDER] 🔄 Token refreshed - session synced to Zustand (NO profile refetch)");
        // CRITICAL: Session is already synced via setSession() above
        // DO NOT call fetchProfile() here
        // Token refresh should be completely transparent to user
        // Profile data doesn't change when token refreshes
        // This prevents /profiles/me spam that exhausts Supabase Auth pool
        return;
      }

      // ======================================================================
      // INITIAL_SESSION - Use cached profile
      // ======================================================================
      if (event === "INITIAL_SESSION") {
        console.log("[AUTH PROVIDER] 🔄 Initial session - session synced, using cached profile");
        // CRITICAL: Session is already synced via setSession() above
        // DO NOT call fetchProfile() here
        // This event fires on page load when session exists
        // We already loaded cached profile in getSession() above
        return;
      }

      // ======================================================================
      // USER_UPDATED, PASSWORD_RECOVERY, etc. - Keep cached profile
      // ======================================================================
      console.log(`[AUTH PROVIDER] ℹ️ Event ${event} - session synced, no additional action needed`);
    });

    return () => {
      console.log("[AUTH PROVIDER] 🧹 Cleanup");
      subscription.unsubscribe();
    };
  }, []); // Empty deps - run ONCE on mount

  return <>{children}</>;
}
