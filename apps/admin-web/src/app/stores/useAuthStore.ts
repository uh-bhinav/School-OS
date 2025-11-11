import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "admin" | "teacher" | "student" | "parent";

interface AuthState {
  userId?: string;
  schoolId?: number;
  role?: Role;
  setAuth: (payload: { userId: string; schoolId: number; role: Role }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: undefined,
      schoolId: undefined,
      role: undefined,
      setAuth: (payload) => set(payload),
      clear: () => set({ userId: undefined, schoolId: undefined, role: undefined }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        userId: state.userId,
        schoolId: state.schoolId,
        role: state.role,
      }),
    }
  )
);
