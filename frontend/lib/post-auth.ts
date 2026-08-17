import { ensureBackendProfile } from "@/components/AuthSync";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

export async function syncSession(getIdToken: () => Promise<string | null>, name: string): Promise<Profile | null> {
  const token = await getIdToken();
  if (token) api.setToken(token);
  return ensureBackendProfile(name);
}

export async function resolvePostAuthPath(
  getIdToken: () => Promise<string | null>,
  name: string
): Promise<"/onboarding" | "/dashboard"> {
  const profile = await syncSession(getIdToken, name);
  if (profile && !profile.onboarding_complete) return "/onboarding";
  if (!profile) return "/onboarding";
  return "/dashboard";
}
