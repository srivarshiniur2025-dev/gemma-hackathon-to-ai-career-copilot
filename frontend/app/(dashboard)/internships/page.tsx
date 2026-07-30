"use client";

import { useCallback, useEffect, useMemo, useDeferredValue, useState } from "react";
import {
  Loader2,
  Search,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { FadeIn, HoverCard } from "@/components/motion/FadeIn";
import { InternshipResultCard } from "@/components/internships/InternshipResultCard";
import { RecommendationCard } from "@/components/internships/RecommendationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  MOCK_INTERNSHIP_RECOMMENDATIONS,
  MOCK_INTERNSHIP_SEARCH,
} from "@/lib/mock-fallbacks";
import type { InternshipSearchResult, VerifiedInternshipRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatInternshipSources } from "@/lib/internship-sources";

const tabs = ["Find Internships", "Gemma Match"] as const;

export default function InternshipsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Find Internships");

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [results, setResults] = useState<InternshipSearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRisky, setShowRisky] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<VerifiedInternshipRecommendation[]>([]);
  const [overallAdvice, setOverallAdvice] = useState<string | null>(null);
  const [recommendMessage, setRecommendMessage] = useState<string | null>(null);
  const [recommendSource, setRecommendSource] = useState<string | null>(null);
  const [recommendCached, setRecommendCached] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendExpanded, setRecommendExpanded] = useState<string | null>(null);

  const visibleResults = useMemo(() => {
    if (showRisky) return results;
    return results.filter((r) => r.verdict === "legitimate" && (r.trust_score ?? 100 - r.spam_risk_score) >= 80);
  }, [results, showRisky]);

  const debouncedQuery = useDebouncedValue(query, 250);
  const deferredResults = useDeferredValue(visibleResults);
  const deferredRecommendations = useDeferredValue(recommendations);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim() || results.length === 0) return deferredResults;
    const q = debouncedQuery.trim().toLowerCase();
    return deferredResults.filter(
      (r) =>
        r.posting.title.toLowerCase().includes(q) ||
        r.posting.company_name.toLowerCase().includes(q)
    );
  }, [debouncedQuery, deferredResults, results.length]);

  const toggleExpanded = useCallback((key: string | null) => {
    setExpanded(key);
  }, []);

  const toggleRecommendExpanded = useCallback((key: string | null) => {
    setRecommendExpanded(key);
  }, []);

  const riskyCount = results.filter(
    (r) => r.verdict !== "legitimate" || (r.trust_score ?? 100 - r.spam_risk_score) < 80
  ).length;

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearchMessage(null);
    setExpanded(null);

    try {
      const data = await api.searchInternships({
        query: query.trim(),
        location: location.trim() || undefined,
        skills: skills.length ? skills : undefined,
      });
      setResults(data.results);
      setSearchMessage(data.message);
      setSearchSource(data.source);
      setCached(data.cached);
    } catch {
      setResults(MOCK_INTERNSHIP_SEARCH);
      setSearchMessage("Demo mode — showing sample verified internships (backend unavailable).");
      setSearchSource("demo");
      setCached(false);
    } finally {
      setLoading(false);
    }
  }

  const loadRecommendations = useCallback(async () => {
    setRecommendLoading(true);
    setRecommendMessage(null);
    setRecommendExpanded(null);

    try {
      const data = await api.recommendInternships();
      setRecommendations(data.recommendations);
      setOverallAdvice(data.overall_advice);
      setRecommendMessage(data.message);
      setRecommendSource(data.source);
      setRecommendCached(data.cached);
    } catch {
      setRecommendations(MOCK_INTERNSHIP_RECOMMENDATIONS);
      setOverallAdvice(
        "Demo mode — personalized matches based on your profile template. Connect the backend for live job fetching and scam screening."
      );
      setRecommendMessage(null);
      setRecommendSource("demo");
      setRecommendCached(false);
    } finally {
      setRecommendLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Gemma Match" && recommendations.length === 0 && !recommendLoading && !recommendMessage) {
      void loadRecommendations();
    }
  }, [activeTab, recommendations.length, recommendLoading, recommendMessage, loadRecommendations]);

  return (
    <div className="mx-auto max-w-5xl">
      <FadeIn className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground-heading">Internships</h1>
        <p className="text-muted">
          Live postings fetched from the web — link-validated and scam-screened by Gemma before you apply.
        </p>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-accent text-white"
                : "border border-border bg-white text-muted hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Find Internships" ? (
        <>
          <FadeIn>
            <Card className="mb-6 border-border/80 bg-white shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="query" className="text-xs font-semibold uppercase text-muted">
                        Role / keyword
                      </Label>
                      <Input
                        id="query"
                        placeholder="e.g. Python developer intern"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-xs font-semibold uppercase text-muted">
                        Location (optional)
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="skills" className="text-xs font-semibold uppercase text-muted">
                      Skills (optional)
                    </Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="skills"
                        placeholder="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" variant="secondary" onClick={addSkill}>
                        Add
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {skills.map((s) => (
                          <Badge key={s} variant="secondary" className="gap-1 pr-1">
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSkill(s)}
                              className="cursor-pointer rounded-full p-0.5 hover:bg-black/5"
                              aria-label={`Remove ${s}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={loading || !query.trim()} className="gap-2 bg-accent hover:bg-accent-hover">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching, validating &amp; screening…
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Find Internships
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>

          {(results.length > 0 || searchMessage) && (
            <FadeIn className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted">
                {results.length > 0 && (
                  <>
                    {filteredResults.length} verified result{filteredResults.length !== 1 ? "s" : ""}
                    {searchSource && ` · via ${formatInternshipSources(searchSource) ?? searchSource}`}
                    {cached && " · cached"}
                  </>
                )}
                {searchMessage && !results.length && <span>{searchMessage}</span>}
              </div>
              {riskyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRisky((v) => !v)}
                  className={cn(
                    "cursor-pointer flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                    showRisky
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-border bg-white text-muted hover:text-foreground"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  {showRisky ? "Hide" : "Show"} flagged ({riskyCount})
                </button>
              )}
            </FadeIn>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredResults.map((item, i) => {
              const key = item.posting.source_url || `${item.posting.title}-${i}`;
              return (
                <FadeIn key={key} delay={Math.min(i * 0.04, 0.4)}>
                  <HoverCard>
                    <InternshipResultCard
                      item={item}
                      index={i}
                      expanded={expanded}
                      onToggle={toggleExpanded}
                    />
                  </HoverCard>
                </FadeIn>
              );
            })}
          </div>

          {!loading && results.length === 0 && !searchMessage && (
            <Card className="mt-4 border-dashed">
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted">
                <Search className="h-8 w-8 text-accent/60" />
                <p className="font-medium">Search for internships above</p>
                <p className="text-sm">Gemma searches the internet via Google Search, then validates links and screens each listing.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <FadeIn className="mb-6">
            <Card className="border-border/80 bg-white shadow-sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <h2 className="font-bold text-foreground-heading">Personalized Gemma Match</h2>
                  <p className="text-sm text-muted">
                    Fetches live internships across the web from your profile, validates links, screens for scams, then explains fit.
                  </p>
                </div>
                <Button
                  onClick={() => void loadRecommendations()}
                  disabled={recommendLoading}
                  className="gap-2 bg-accent hover:bg-accent-hover"
                >
                  {recommendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching &amp; verifying…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Refresh matches
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </FadeIn>

          {recommendLoading && recommendations.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="font-medium">Building your verified shortlist…</p>
                <p className="text-sm">Fetching jobs · validating links · running scam checks · scoring fit</p>
              </CardContent>
            </Card>
          )}

          {!recommendLoading && (recommendMessage || overallAdvice) && recommendations.length === 0 && (
            <FadeIn className="mb-4">
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4 text-sm text-amber-900">
                  {recommendMessage || overallAdvice}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {overallAdvice && recommendations.length > 0 && (
            <FadeIn className="mb-4">
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-4 text-sm leading-relaxed text-foreground">
                  {overallAdvice}
                  {recommendSource && (
                    <span className="mt-2 block text-xs text-muted">
                      Sources: {formatInternshipSources(recommendSource) ?? recommendSource}
                      {recommendCached && " · cached"}
                    </span>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {deferredRecommendations.map((item, i) => {
              const key = item.posting.source_url || `${item.posting.title}-${i}`;
              return (
                <FadeIn key={key} delay={Math.min(i * 0.05, 0.4)}>
                  <HoverCard>
                    <RecommendationCard
                      item={item}
                      index={i}
                      expanded={recommendExpanded}
                      onToggle={toggleRecommendExpanded}
                    />
                  </HoverCard>
                </FadeIn>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
