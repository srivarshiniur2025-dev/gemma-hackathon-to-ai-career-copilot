type HealthPayload = {
  status: string;
  model: string;
  model_chain?: string[];
  version: string;
};

const CACHE_KEY = "career-copilot:health";
const TTL_MS = 60_000;

let memoryCache: { data: HealthPayload; fetchedAt: number } | null = null;

function readSessionCache(): { data: HealthPayload; fetchedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: HealthPayload; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(entry: { data: HealthPayload; fetchedAt: number }) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
}

export function getCachedHealth(): HealthPayload | null {
  const fresh =
    memoryCache && Date.now() - memoryCache.fetchedAt <= TTL_MS ? memoryCache : readSessionCache();
  return fresh?.data ?? null;
}

export function setCachedHealth(data: HealthPayload) {
  const entry = { data, fetchedAt: Date.now() };
  memoryCache = entry;
  writeSessionCache(entry);
}
