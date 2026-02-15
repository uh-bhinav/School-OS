// ============================================================================
// USE AUTH HOOK - Convenient access to authentication state
// ============================================================================
// This hook provides a clean interface to access auth state from components.
// It wraps the Zustand store and provides common auth operations.
//
// USAGE:
//   const { user, profile, isAuthenticated, logout } = useAuth();
//
// IMPORTANT:
// - Do NOT use this hook for auth checks inside route guards (use useAuthStore directly)
// - This hook is for components that need to display user info or trigger logout
// - All auth state comes from Zustand store (single source of truth)
// ============================================================================

import { useCallback } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { supabase } from "../services/supabase";

/**
 * Auth state interface matching system requirements
 */
export interface AuthState {
  // Core user info
  userId: string | undefined;
  email: string | undefined;

  // Profile info (from /profiles/me)
  profile: {
    id: string;
    email: string;
    role: "super_admin" | "admin" | "teacher" | "student" | "parent";
    school_id: number;
    first_name?: string | null;
    last_name?: string | null;
  } | null;

  // Role and school
  role: "super_admin" | "admin" | "teacher" | "student" | "parent" | undefined;
  schoolId: number | undefined;

  // Session state
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | undefined;

  // Actions
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Custom hook for accessing authentication state
 *
 * @example
 * function UserProfile() {
 *   const { profile, isAuthenticated, logout } = useAuth();
 *
 *   if (!isAuthenticated) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {profile?.first_name}</h1>
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 */
export function useAuth(): AuthState {
  // Get state from Zustand store
  const userId = useAuthStore((state) => state.userId);
  const schoolId = useAuthStore((state) => state.schoolId);
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);
  const cachedProfile = useAuthStore((state) => state.cachedProfile);
  const isAuthenticatedFn = useAuthStore((state) => state.isAuthenticated);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logoutFn = useAuthStore((state) => state.logout);

  // Compute derived state
  const isAuthenticated = isAuthenticatedFn();

  // Build profile object from cached profile
  const profile = cachedProfile ? {
    id: cachedProfile.user_id,
    email: cachedProfile.first_name && cachedProfile.last_name
      ? `${cachedProfile.first_name.toLowerCase()}.${cachedProfile.last_name.toLowerCase()}@school.com`
      : undefined,
    role: role!,
    school_id: cachedProfile.school_id,
    first_name: cachedProfile.first_name,
    last_name: cachedProfile.last_name,
  } as AuthState["profile"] : null;

  /**
   * Logout - Signs out from Supabase and clears all local state
   */
  const logout = useCallback(async () => {
    console.log("[useAuth] 🚪 Logging out...");

    try {
      // Clear Zustand store first (prevents race conditions)
      logoutFn();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[useAuth] ❌ Supabase signOut error:", error);
      } else {
        console.log("[useAuth] ✅ Signed out successfully");
      }
    } catch (err) {
      console.error("[useAuth] ❌ Logout error:", err);
    }
  }, [logoutFn]);

  /**
   * Refresh profile - Force fetch fresh profile from backend
   */
  const refreshProfile = useCallback(async () => {
    console.log("[useAuth] 🔄 Refreshing profile...");
    await fetchProfile(true);
  }, [fetchProfile]);

  return {
    userId,
    email: profile?.email,
    profile,
    role,
    schoolId,
    isAuthenticated,
    isLoading: false, // Auth loading is handled by AuthProvider
    accessToken,
    logout,
    refreshProfile,
  };
}

/**
 * Hook to get just the user role (optimized for role checks)
 */
export function useUserRole() {
  return useAuthStore((state) => state.role);
}

/**
 * Hook to get just the school ID (optimized for API calls)
 */
export function useSchoolId() {
  return useAuthStore((state) => state.schoolId);
}

/**
 * Hook to check if user is authenticated (optimized for guards)
 */
export function useIsAuthenticated() {
  const isAuthenticatedFn = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticatedFn();
}

export default useAuth;
