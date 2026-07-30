"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  getDemoToken,
  isAuthenticated,
  login as fakeLogin,
  logout as fakeLogout,
  register as fakeRegister,
  seedDemoUser,
  type LoginInput,
  type RegisterInput,
  type SessionUser,
} from "@/lib/fake-auth";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Demo token — swap for Firebase user.getIdToken() when migrating */
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoUser();
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = fakeLogin(input);
    if (!result.success) {
      throw new Error(result.error);
    }
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = fakeRegister(input);
    if (!result.success) {
      throw new Error(result.error);
    }
  }, []);

  const logout = useCallback(async () => {
    fakeLogout();
    setUser(null);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!isAuthenticated()) return null;
    return getDemoToken();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      login,
      register,
      logout,
      getIdToken,
    }),
    [user, loading, login, register, logout, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** @deprecated Use SessionUser from fake-auth — kept for gradual migration */
export type AuthUser = SessionUser;
