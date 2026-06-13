/**
 * Auth store — JWT token + user state, persisted to localStorage.
 * Used by the axios interceptor in api.ts (already reads evalai_token from localStorage).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  institution_name: string | null;
  role: "teacher" | "admin";
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        // Keep in sync with the key the axios interceptor reads
        if (typeof window !== "undefined") {
          localStorage.setItem("evalai_token", token);
        }
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("evalai_token");
        }
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: "evalai_auth",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
