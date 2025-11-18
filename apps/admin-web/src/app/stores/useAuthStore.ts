// ============================================================================
// AUTH STORE - WITH PROFILE CACHING TO PREVENT API SPAM
// ============================================================================
// CRITICAL FIX FOR SUPABASE AUTH POOL EXHAUSTION:
// - Profile caching with 10-minute TTL
// - fetchProfile(force = false) respects cache
// - Only calls /profiles/me when cache expired OR force=true
// - Prevents repeated /profiles/me spam that exhausts Supabase Auth pool
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMyProfile, getPrimaryRole, type Profile } from "../services/profile.api";

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

      clear: () => {
        console.log("[AUTH STORE] Clearing auth state (soft)");
        set({
          userId: undefined,
          schoolId: undefined,
          role: undefined,
          currentAcademicYearId: undefined,
          cachedProfile: undefined,
          profileCachedAt: undefined,
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
