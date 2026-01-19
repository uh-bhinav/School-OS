// ============================================================================
// DEMO MODE STORE - Controls mock vs real API usage
// ============================================================================
// When isDemoMode = true:
//   - All feature modules use mock data providers
//   - Only auth & config hit real backend
//   - Protects Supabase connection pool
//
// When isDemoMode = false:
//   - All modules use real backend APIs
//   - Mock providers are bypassed
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DemoModeState {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set, get) => ({
      // ✅ Read from environment variable
      isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true',

      setDemoMode: (enabled: boolean) => {
        console.log(`[DEMO MODE] ${enabled ? 'ENABLED' : 'DISABLED'} - Using ${enabled ? 'mock' : 'real'} data`);
        set({ isDemoMode: enabled });
      },

      toggleDemoMode: () => {
        const current = get().isDemoMode;
        get().setDemoMode(!current);
      },
    }),
    {
      name: 'demo-mode-storage',
      partialize: (state) => ({
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);

/**
 * Helper function to check demo mode
 * Can be used outside React components
 */
export const isDemoMode = () => useDemoModeStore.getState().isDemoMode;
