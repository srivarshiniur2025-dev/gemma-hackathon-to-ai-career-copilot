const SOURCE_LABELS: Record<string, string> = {
  gemma: "Gemma + Google Search",
  serpapi: "Google Jobs",
  adzuna: "Adzuna",
  remotive: "Remotive",
  arbeitnow: "Arbeitnow",
  jobicy: "Jobicy",
  remoteok: "RemoteOK",
  mock: "Demo listings",
  demo: "Demo mode",
};

/** Format backend source string (comma-separated keys) for display. */
export function formatInternshipSources(source: string | null | undefined): string | null {
  if (!source) return null;
  const labels = source
    .split(",")
    .map((s) => SOURCE_LABELS[s.trim()] ?? s.trim())
    .filter(Boolean);
  return labels.length ? labels.join(", ") : null;
}
