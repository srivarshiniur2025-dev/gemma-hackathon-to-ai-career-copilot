"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

/**
 * Keeps API bearer token in sync with auth state (Firebase ID token when configured).
 */
export function AuthSync() {
  const { user, getIdToken } = useAuth();

  useEffect(() => {
    if (!user) {
      api.clearToken();
      return;
    }
    getIdToken().then((token) => {
      if (token) api.setToken(token);
    });
  }, [user, getIdToken]);

  return null;
}

export async function ensureBackendProfile(name: string) {
  try {
    return await api.getMe();
  } catch {
    try {
      return await api.registerUser(name);
    } catch {
      return null;
    }
  }
}
