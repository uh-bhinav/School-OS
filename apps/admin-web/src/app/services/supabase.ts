import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // Let Supabase handle automatic refresh
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
});

/**
 * Get access token from Supabase session
 * This is called by the Axios request interceptor
 *
 * CRITICAL: Must return valid token for authenticated requests
 * FIXED: Now synchronous, reads from localStorage directly to avoid race conditions
 */
export function getAccessToken(): string | null {
  try {
    // Read directly from localStorage (synchronous, no await needed)
    const storageKey = 'supabase.auth.token';
    const storedSession = localStorage.getItem(storageKey);

    if (!storedSession) {
      console.warn("[SUPABASE] ⚠️ No session in localStorage");
      return null;
    }

    const session = JSON.parse(storedSession);
    const token = session?.currentSession?.access_token || session?.access_token;

    if (!token) {
      console.error("[SUPABASE] ❌ Session exists but no access_token!");
      return null;
    }

    console.log(`[SUPABASE] ✅ Token retrieved from localStorage:`, {
      length: token.length,
      preview: token.substring(0, 30) + '...',
    });

    return token;
  } catch (error) {
    console.error("[SUPABASE] 💥 Exception getting access token:", error);
    return null;
  }
}
