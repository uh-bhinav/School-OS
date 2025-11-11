import { PropsWithChildren, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../stores/useAuthStore";

export function AuthRoot({ children }: PropsWithChildren) {
  const { setAuth, clear } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // TODO: Replace with real /me endpoint call to get schoolId and role
        // For now, assume admin of school 2 while you wire backend
        setAuth({ userId: session.user.id, schoolId: 2, role: "admin" });
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clear();
      } else if (event === "SIGNED_IN" && session) {
        // TODO: Replace with real /me endpoint call
        setAuth({ userId: session.user.id, schoolId: 2, role: "admin" });
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, clear]);

  return <>{children}</>;
}
