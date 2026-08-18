/**
 * Frontend-only auth for hackathon demo.
 * Replace this module with Firebase (or another provider) later — keep the same public API shape.
 */

export type StoredUser = {
  name: string;
  email: string;
  password: string;
  college: string;
};

export type SessionUser = {
  uid?: string;
  name: string;
  email: string;
  college: string;
  /** Alias for dashboard components that expect Firebase-style displayName */
  displayName: string;
};

export const STORAGE_KEYS = {
  USER: "careerCopilotUser",
  IS_LOGGED_IN: "isLoggedIn",
  SESSION: "careerCopilotSession",
  USE_LOCAL: "careerCopilotUseLocalStorage",
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pre-seeded hackathon demo account */
export const DEMO_USER: StoredUser = {
  name: "Demo Student",
  email: "demo@student.edu",
  password: "demo12345",
  college: "Demo University",
};

/** Writes demo credentials to localStorage when no user exists, or when force is true. */
export function seedDemoUser(force = false): void {
  if (!isBrowser()) return;
  if (!force && getRegisteredUser()) return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
}

export type RegisterInput = {
  name: string;
  college?: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getRegisteredUser(): StoredUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function getActiveStorage(): Storage | null {
  if (!isBrowser()) return null;
  if (localStorage.getItem(STORAGE_KEYS.USE_LOCAL) === "true") return localStorage;
  if (sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true") return sessionStorage;
  if (localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true") return localStorage;
  return null;
}

export function isAuthenticated(): boolean {
  const storage = getActiveStorage();
  return storage?.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true";
}

export function getCurrentUser(): SessionUser | null {
  const storage = getActiveStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function register(input: RegisterInput): { success: true } | { success: false; error: string } {
  const name = input.name.trim();
  const college = (input.college ?? "").trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name) return { success: false, error: "Full name is required" };
  if (!email) return { success: false, error: "Email is required" };
  if (!validateEmail(email)) return { success: false, error: "Enter a valid email address" };
  if (!validatePassword(password)) return { success: false, error: "Password must be at least 8 characters" };

  const existing = getRegisteredUser();
  if (existing && existing.email.toLowerCase() === email) {
    return { success: false, error: "An account with this email already exists" };
  }

  const user: StoredUser = { name, college, email, password };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return { success: true };
}

export function login(
  input: LoginInput
): { success: true; user: SessionUser } | { success: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const stored = getRegisteredUser();

  if (!stored || stored.email.toLowerCase() !== email || stored.password !== password) {
    return { success: false, error: "Invalid email or password" };
  }

  const sessionUser: SessionUser = {
    uid: stored.email,
    name: stored.name,
    email: stored.email,
    college: stored.college,
    displayName: stored.name,
  };

  if (input.rememberMe) {
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.setItem(STORAGE_KEYS.USE_LOCAL, "true");
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.setItem(STORAGE_KEYS.USE_LOCAL, "false");
    sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
  }

  return { success: true, user: sessionUser };
}

export function logout(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.USE_LOCAL);
  sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function deleteLocalAccountData(): void {
  if (!isBrowser()) return;

  // Remove demo credential + session flags
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.USE_LOCAL);
  sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);

  // Purge app data tied to Career Copilot
  const prefixes = ["careerCopilotCareer:", "careerCopilotProfile:", "careerCopilotSkills:", "careerCopilotMocks:"];
  const resumeDraftKey = "careerCopilotResumeDraft";
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k === resumeDraftKey || prefixes.some((p) => k.startsWith(p))) {
      localStorage.removeItem(k);
    }
  }
}

/** Demo token for API calls — replace with Firebase getIdToken() later */
export function getDemoToken(): string {
  const user = getCurrentUser();
  if (!user) return "";
  return `demo.${btoa(user.email)}.${Date.now()}`;
}
