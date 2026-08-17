"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  firebaseAuthErrorMessage,
  firebaseGoogleSignIn,
  firebaseLogout,
  firebaseResetPassword,
  firebaseSignIn,
  firebaseSignUp,
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase";
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
  firebaseEnabled: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function sessionFromFirebase(fbUser: FirebaseUser): SessionUser {
  const name = fbUser.displayName || fbUser.email?.split("@")[0] || "Student";
  return {
    uid: fbUser.uid,
    name,
    email: fbUser.email ?? "",
    college: "",
    displayName: name,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseEnabled = isFirebaseConfigured();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        setUser(fbUser ? sessionFromFirebase(fbUser) : null);
        setLoading(false);
      });
      return () => unsub();
    }

    seedDemoUser();
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, [firebaseEnabled]);

  const login = useCallback(
    async (input: LoginInput) => {
      if (firebaseEnabled) {
        const fbUser = await firebaseSignIn(input.email, input.password, input.rememberMe);
        setUser(sessionFromFirebase(fbUser));
        return;
      }
      const result = fakeLogin(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      setUser(result.user);
    },
    [firebaseEnabled]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      if (firebaseEnabled) {
        const fbUser = await firebaseSignUp(input.name, input.email, input.password);
        setUser(sessionFromFirebase(fbUser));
        return;
      }
      const result = fakeRegister(input);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [firebaseEnabled]
  );

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseEnabled) {
      throw new Error("Google sign-in requires Firebase. Add your Firebase keys to go live.");
    }
    const fbUser = await firebaseGoogleSignIn();
    setUser(sessionFromFirebase(fbUser));
  }, [firebaseEnabled]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!firebaseEnabled) {
        throw new Error("Password reset is only available when Firebase is connected.");
      }
      await firebaseResetPassword(email);
    },
    [firebaseEnabled]
  );

  const logout = useCallback(async () => {
    if (firebaseEnabled) {
      await firebaseLogout();
    } else {
      fakeLogout();
    }
    setUser(null);
  }, [firebaseEnabled]);

  const getIdToken = useCallback(async () => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      const current = auth?.currentUser;
      if (!current) return null;
      return current.getIdToken();
    }
    if (!isAuthenticated()) return null;
    return getDemoToken();
  }, [firebaseEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      firebaseEnabled,
      login,
      register,
      loginWithGoogle,
      resetPassword,
      logout,
      getIdToken,
    }),
    [user, loading, firebaseEnabled, login, register, loginWithGoogle, resetPassword, logout, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { firebaseAuthErrorMessage };
export type AuthUser = SessionUser;
export type { SessionUser };
