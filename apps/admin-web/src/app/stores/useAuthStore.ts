// ============================================================================
// AUTH STORE - WITH PROFILE CACHING TO PREVENT API SPAM
// ============================================================================
// CRITICAL FIX FOR SUPABASE AUTH POOL EXHAUSTION:
// - Profile caching with 10-minute TTL
// - fetchProfile(force = false) respects cache
// - Only calls /profiles/me when cache expired OR force=true
// - Prevents repeated /profiles/me spam that exhausts Supabase Auth pool
//
// SESSION REFRESH SUPPORT:
// - setSession(session) allows AuthProvider to sync Supabase session with Zustand
// - accessToken getter returns the latest JWT for API calls
// - Session version tracking to trigger re-fetches when tokens rotate
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMyProfile, getPrimaryRole, type Profile } from "../services/profile.api";
import type { Session } from "@supabase/supabase-js";

type Role = "admin" | "teacher" | "student" | "parent";

// Profile cache TTL: 10 minutes (in milliseconds)
const PROFILE_CACHE_TTL = 10 * 60 * 1000;

interface AuthState {
  userId?: string;
  schoolId?: number;
  role?: Role;
  currentAcademicYearId?: number;

  // Profile cache (NEW)
  cachedProfile?: Profile;
  profileCachedAt?: number;

  // Session tracking for token refresh (NEW)
  sessionVersion: number; // Incremented when session changes (for triggering re-renders/refetches)
  accessToken?: string; // Current access token from Supabase session
  sessionExpiresAt?: number; // Token expiry timestamp (Unix seconds)

  // Actions
  setAuth: (payload: {
    userId: string;
    schoolId: number;
    role: Role;
    currentAcademicYearId?: number;
  }) => void;
  setAcademicYear: (academicYearId: number) => void;
  clear: () => void;
  reset: () => void;
  logout: () => void;

  // NEW: Session management for token refresh
  setSession: (session: Session | null) => void;
  getAccessToken: () => string | undefined;
  isSessionValid: () => boolean;

  // NEW: Smart profile fetching with cache
  fetchProfile: (force?: boolean) => Promise<Profile>;
  isCacheValid: () => boolean;

  // NEW: Authentication check
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: undefined,
      schoolId: undefined,
      role: undefined,
      currentAcademicYearId: undefined,
      cachedProfile: undefined,
      profileCachedAt: undefined,
      sessionVersion: 0,
      accessToken: undefined,
      sessionExpiresAt: undefined,

      setAuth: (payload) => {
        console.log("[AUTH STORE] Setting auth:", {
          userId: payload.userId,
          schoolId: payload.schoolId,
          role: payload.role,
          academicYearId: payload.currentAcademicYearId,
        });
        set(payload);
      },

      setAcademicYear: (academicYearId) => {
        console.log("[AUTH STORE] Setting academic year:", academicYearId);
        set({ currentAcademicYearId: academicYearId });
      },

      // ========================================================================
      // SESSION MANAGEMENT - CRITICAL FOR TOKEN REFRESH
      // ========================================================================

      /**
       * Update session from Supabase auth state change
       * Called by AuthProvider when onAuthStateChange fires
       * Ensures Zustand always has the latest access_token
       */
      setSession: (session) => {
        if (!session) {
          console.log("[AUTH STORE] 🔄 Session cleared (signed out)");
          set({
            accessToken: undefined,
            sessionExpiresAt: undefined,
            sessionVersion: get().sessionVersion + 1,
          });
          return;
        }

        const newToken = session.access_token;
        const expiresAt = session.expires_at; // Unix timestamp in seconds
        const currentToken = get().accessToken;

        // Only update and log if token actually changed
        if (newToken !== currentToken) {
          console.log("[AUTH STORE] 🔄 Session updated:", {
            tokenChanged: true,
            expiresAt: expiresAt ? new Date(expiresAt * 1000).toLocaleTimeString() : 'unknown',
            expiresIn: expiresAt ? `${Math.round((expiresAt - Date.now() / 1000) / 60)} minutes` : 'unknown',
          });

          set({
            accessToken: newToken,
            sessionExpiresAt: expiresAt,
            sessionVersion: get().sessionVersion + 1,
          });
        }
      },

      /**
       * Get current access token
       * Used by HTTP interceptor for API calls
       */
      getAccessToken: () => {
        return get().accessToken;
      },

      /**
       * Check if current session is valid (not expired)
       */
      isSessionValid: () => {
        const { accessToken, sessionExpiresAt } = get();

        if (!accessToken) {
          return false;
        }

        if (!sessionExpiresAt) {
          // If we have token but no expiry, assume valid (Supabase will handle refresh)
          return true;
        }

        // Check if token expires in less than 60 seconds
        const now = Math.floor(Date.now() / 1000);
        const isValid = sessionExpiresAt > now + 60; // 60 second buffer

        if (!isValid) {
          console.log("[AUTH STORE] ⚠️ Session expired or expiring soon");
        }

        return isValid;
      },

      clear: () => {
        console.log("[AUTH STORE] Clearing auth state (soft)");
        set({
          userId: undefined,
          schoolId: undefined,
          role: undefined,
          currentAcademicYearId: undefined,
          cachedProfile: undefined,
          profileCachedAt: undefined,
          accessToken: undefined,
          sessionExpiresAt: undefined,
          // Don't reset sessionVersion - keep it for tracking
        });
      },

      reset: () => {
        console.log("[AUTH STORE] Resetting auth state (hard - clears persisted storage)");
        set({
          userId: undefined,
          schoolId: undefined,
          role: undefined,
          currentAcademicYearId: undefined,
          cachedProfile: undefined,
          profileCachedAt: undefined,
          accessToken: undefined,
          sessionExpiresAt: undefined,
          sessionVersion: 0,
        });
        // Clear persisted storage
        localStorage.removeItem("auth-storage");
      },

      logout: () => {
        console.log("[AUTH STORE] Logging out (full cleanup)");

        // Clear auth state
        set({
          userId: undefined,
          schoolId: undefined,
          role: undefined,
          currentAcademicYearId: undefined,
          cachedProfile: undefined,
          profileCachedAt: undefined,
          accessToken: undefined,
          sessionExpiresAt: undefined,
          sessionVersion: 0,
        });

        // Clear all localStorage keys
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("supabase.auth.token");

        // Clear all session storage
        sessionStorage.clear();

        console.log("[AUTH STORE] Logout complete");
      },

      // ========================================================================
      // PROFILE CACHING - CRITICAL FIX FOR API SPAM
      // ========================================================================

      /**
       * Check if cached profile is still valid
       */
      isCacheValid: () => {
        const { cachedProfile, profileCachedAt } = get();

        if (!cachedProfile || !profileCachedAt) {
          return false;
        }

        const age = Date.now() - profileCachedAt;
        const isValid = age < PROFILE_CACHE_TTL;

        if (!isValid) {
          console.log(`[AUTH STORE] 🕐 Cache expired (age: ${Math.round(age / 1000)}s)`);
        }

        return isValid;
      },

      /**
       * Fetch profile with intelligent caching
       * @param force - If true, bypass cache and fetch fresh profile
       */
      fetchProfile: async (force = false) => {
        const { cachedProfile, isCacheValid } = get();

        // Return cached profile if valid and not forced
        if (!force && isCacheValid()) {
          const cacheAge = Math.round((Date.now() - (get().profileCachedAt || 0)) / 1000);
          console.log(`[AUTH STORE] ✅ Using cached profile (age: ${cacheAge}s)`);
          return cachedProfile!;
        }

        // Fetch fresh profile
        console.log(`[AUTH STORE] 📥 Fetching fresh profile ${force ? '(forced)' : '(cache expired)'}`);

        try {
          const profile = await getMyProfile();
          const role = getPrimaryRole(profile);

          // Update store with profile data AND cache
          set({
            userId: profile.user_id,
            schoolId: profile.school_id,
            role,
            cachedProfile: profile,
            profileCachedAt: Date.now(),
          });

          console.log("[AUTH STORE] ✅ Profile fetched and cached:", {
            userId: profile.user_id,
            schoolId: profile.school_id,
            role,
            cacheExpires: new Date(Date.now() + PROFILE_CACHE_TTL).toLocaleTimeString(),
          });

          return profile;
        } catch (error) {
          console.error("[AUTH STORE] ❌ Profile fetch failed:", error);
          throw error;
        }
      },

      /**
       * Check if user is authenticated
       * CRITICAL: Used by all module queries to prevent unauthorized API calls
       */
      isAuthenticated: () => {
        const { userId, schoolId, role } = get();
        return !!(userId && schoolId && role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        userId: state.userId,
        schoolId: state.schoolId,
        role: state.role,
        currentAcademicYearId: state.currentAcademicYearId,
        // IMPORTANT: We cache profile in memory only, not localStorage
        // This prevents stale data after logout/login cycles
      }),
    }
  )
);
