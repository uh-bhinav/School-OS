// ============================================================================
// CACHE CLEARING UTILITY - Flush old SchoolOS data
// ============================================================================
// Use this to clear all cached data when switching schools, debugging issues,
// or after major data model changes

import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { useMarksStore } from "../stores/useMarksStore";

/**
 * Clear all SchoolOS cached data
 * - localStorage entries (Zustand persist + custom keys)
 * - sessionStorage
 * - React Query cache (requires queryClient)
 *
 * Usage:
 * ```ts
 * import { clearAllSchoolOSCache } from '@/app/utils/cache';
 * clearAllSchoolOSCache();
 * ```
 */
export function clearAllSchoolOSCache(options?: {
  keepAuth?: boolean; // If true, preserve auth state
  reload?: boolean;   // If true, reload page after clearing
}) {
  const { keepAuth = false, reload = true } = options || {};

  console.log("🧹 Clearing all SchoolOS cache...");

  // 1. Clear Zustand stores
  if (!keepAuth) {
    useAuthStore.getState().reset();
    console.log("  ✓ Cleared auth store");
  }

  useConfigStore.getState().clear();
  console.log("  ✓ Cleared config store");

  useMarksStore.getState().clearFilters();
  console.log("  ✓ Cleared marks store");

  // 2. Clear all SchoolOS-related localStorage keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith("schoolos_") ||
      key.startsWith("marks-") ||
      key.startsWith("config-") ||
      (!keepAuth && key === "auth-storage")
    )) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`  ✓ Removed localStorage: ${key}`);
  });

  // 3. Clear sessionStorage
  sessionStorage.clear();
  console.log("  ✓ Cleared sessionStorage");

  // 4. Note: React Query cache is cleared on page reload
  // queryClient.clear() should be called if you have access to it

  console.log("✅ Cache clearing complete");

  if (reload) {
    console.log("🔄 Reloading page...");
    window.location.reload();
  }
}

/**
 * Clear only marks-related cache
 * Useful when you need to refetch marks data without affecting auth
 */
export function clearMarksCache() {
  useMarksStore.getState().clearFilters();

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("marks-")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  console.log("✅ Marks cache cleared");
}

/**
 * Clear config cache
 * Useful when school configuration has been updated
 */
export function clearConfigCache() {
  useConfigStore.getState().clear();
  localStorage.removeItem("config-storage");
  console.log("✅ Config cache cleared");
}

/**
 * Add to window for easy debugging in console
 * Usage in browser console: window.clearSchoolOSCache()
 */
if (typeof window !== "undefined") {
  (window as any).clearSchoolOSCache = clearAllSchoolOSCache;
  (window as any).clearMarksCache = clearMarksCache;
  (window as any).clearConfigCache = clearConfigCache;
}
