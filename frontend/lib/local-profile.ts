import type { Profile } from "@/lib/types";
import { getCurrentUser } from "@/lib/fake-auth";

const PREFIX = "careerCopilotProfile:";

function key(email?: string | null): string {
  const user = email ?? getCurrentUser()?.email ?? "guest";
  return `${PREFIX}${user.toLowerCase()}`;
}

export function saveLocalProfile(profile: Profile, email?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(email ?? profile.email), JSON.stringify(profile));
}

export function loadLocalProfile(email?: string | null): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}
