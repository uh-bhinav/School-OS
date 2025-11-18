/**
 * Auth State Migration/Cleanup Utility
 *
 * This utility helps clean up stale auth state from previous sessions.
 * It can be imported and called in main.tsx before app initialization
 * to ensure clean auth state.
 */

/**
 * Check if there's a mismatch between persisted auth and actual session
 * If found, clear everything and force re-login
 */
export function validateAuthState(): boolean {
  try {
    // Get persisted auth state
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      console.log('[AUTH CLEANUP] No persisted auth found - OK');
      return true;
    }

    const authState = JSON.parse(authStorage);
    const persistedSchoolId = authState?.state?.schoolId;

    console.log('[AUTH CLEANUP] Found persisted auth:', {
      schoolId: persistedSchoolId,
      userId: authState?.state?.userId,
      role: authState?.state?.role
    });

    // If schoolId is unexpected, clear everything
    // You can customize this check based on your needs
    if (persistedSchoolId === 2) {
      console.warn('[AUTH CLEANUP] ⚠️ Found stale school_id: 2 - CLEARING AUTH STATE');
      clearAllAuthState();
      return false;
    }

    return true;
  } catch (error) {
    console.error('[AUTH CLEANUP] Error validating auth state:', error);
    // Clear on error to be safe
    clearAllAuthState();
    return false;
  }
}

/**
 * Force clear all auth-related storage
 * Use when you need to completely reset authentication state
 */
export function clearAllAuthState(): void {
  console.log('[AUTH CLEANUP] 🧹 Clearing all auth state...');

  // Clear localStorage
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('supabase.auth.token');

  // Clear all Supabase keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  sessionStorage.clear();

  console.log('[AUTH CLEANUP] ✅ Auth state cleared');
}

/**
 * One-time migration: Run this to fix stale school_id in existing sessions
 * Call this in main.tsx before app initialization
 */
export function runAuthMigration(): void {
  const AUTH_MIGRATION_KEY = 'auth-migration-v1';

  // Check if migration already ran
  if (localStorage.getItem(AUTH_MIGRATION_KEY)) {
    console.log('[AUTH MIGRATION] Already completed - skipping');
    return;
  }

  console.log('[AUTH MIGRATION] 🔧 Running one-time auth cleanup...');

  const isValid = validateAuthState();

  if (!isValid) {
    console.log('[AUTH MIGRATION] ❌ Invalid auth state detected - forcing re-login');

    // Redirect to login after cleanup
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
  }

  // Mark migration as complete
  localStorage.setItem(AUTH_MIGRATION_KEY, new Date().toISOString());
  console.log('[AUTH MIGRATION] ✅ Migration complete');
}

/**
 * Debug utility: Log current auth state
 */
export function debugAuthState(): void {
  console.group('🔍 AUTH STATE DEBUG');

  try {
    // localStorage auth
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      console.log('localStorage auth-storage:', parsed);
    } else {
      console.log('localStorage auth-storage: NULL');
    }

    // Supabase session
    const supabaseKeys = Object.keys(localStorage).filter(k =>
      k.startsWith('supabase.auth') || k.startsWith('sb-')
    );
    console.log('Supabase keys:', supabaseKeys);

    // Session storage
    console.log('sessionStorage items:', sessionStorage.length);

  } catch (error) {
    console.error('Error debugging auth state:', error);
  }

  console.groupEnd();
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
  (window as any).clearAllAuthState = clearAllAuthState;
}
