"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, Filter, Flame, Sparkles } from "lucide-react";
import { SKILL_CATALOG, SKILL_CATALOG_COUNT, SKILL_DOMAINS } from "@/lib/skills/catalog";
import { loadSkillProgress } from "@/lib/skills/progress";
import type { SkillDomainId, SkillKind, SkillTestMeta } from "@/lib/skills/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOMAIN_STYLES: Record<string, string> = {
  python: "bg-blue-50 text-blue-700 border-blue-100",
  javascript: "bg-amber-50 text-amber-800 border-amber-100",
  dsa: "bg-violet-50 text-violet-800 border-violet-100",
  sql: "bg-teal-50 text-teal-800 border-teal-100",
  react: "bg-sky-50 text-sky-800 border-sky-100",
  "system-design": "bg-zinc-900 text-white border-zinc-800",
  git: "bg-orange-50 text-orange-800 border-orange-100",
  ml: "bg-emerald-50 text-emerald-800 border-emerald-100",
  mixed: "bg-accent/10 text-accent border-accent/20",
};

const TABS: { id: SkillKind | "all"; label: string }[] = [
  { id: "all", label: "All tests" },
  { id: "chapter", label: "Core" },
  { id: "sectional", label: "Deep dives" },
  { id: "interview", label: "Intern screens" },
  { id: "full", label: "Full checkpoint" },
  { id: "rapid", label: "Rapid fire" },
];

export function SkillCatalog() {
  const [tab, setTab] = useState<SkillKind | "all">("all");
  const [domain, setDomain] = useState<SkillDomainId | "all">("all");
  const progress = useMemo(() => loadSkillProgress(), []);

  const visible = SKILL_CATALOG.filter((t) => {
    if (tab !== "all" && t.kind !== tab) return false;
    if (domain === "all") return true;
    return t.domain === domain || t.domain === "mixed";
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-accent/15 bg-gradient-to-br from-white via-[#F0FDFA] to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Developer certification</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-foreground-heading">Skill assessments</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {SKILL_CATALOG_COUNT} timed papers across Python, JavaScript, DSA, SQL, React, system design, Git and ML.
              Original intern-screen items with explanations — scored locally, same pattern as NEET mocks.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-border bg-white px-4 py-3">
              <Flame className="mb-1 h-4 w-4 text-accent" />
              <p className="text-lg font-extrabold">{SKILL_CATALOG_COUNT}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted">In bank</p>
            </div>
            <div className="rounded-2xl border border-border bg-white px-4 py-3">
              <CheckCircle2 className="mb-1 h-4 w-4 text-accent" />
              <p className="text-lg font-extrabold">{Object.keys(progress.bestByTest).length}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted">You finished</p>
            </div>
          </div>
        </div>
        <Link href="/assessment/live" className="mt-6 inline-flex">
          <Button variant="accent" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Live Gemma interview (6 adaptive questions)
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                tab === t.id ? "border-accent bg-accent text-white" : "border-border bg-white text-muted-secondary hover:border-accent/40"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          <button
            type="button"
            onClick={() => setDomain("all")}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium",
              domain === "all" ? "border-accent bg-accent/10 text-accent" : "border-border bg-white text-muted"
            )}
          >
            All domains
          </button>
          {SKILL_DOMAINS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDomain(d.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium",
                domain === d.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-white text-muted"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">{visible.length} tests in this view</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((test, i) => (
          <SkillTestCard key={test.id} test={test} delay={Math.min(i * 0.02, 0.3)} best={progress.bestByTest[test.id]} />
        ))}
      </div>
    </div>
  );
}

function SkillTestCard({ test, delay, best }: { test: SkillTestMeta; delay: number; best?: number }) {
  const label = test.domain === "mixed" ? "Mixed" : SKILL_DOMAINS.find((d) => d.id === test.domain)?.label ?? test.domain;
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex flex-col rounded-[22px] border border-border bg-white p-5 shadow-[0_2px_8px_rgba(24,24,27,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(13,148,136,0.12)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", DOMAIN_STYLES[test.domain])}>
          {label}
        </span>
        {best != null ? (
          <span className="text-xs font-semibold text-accent">Best {best}%</span>
        ) : (
          <span className="text-xs text-muted">Not attempted</span>
        )}
      </div>
      <h3 className="font-heading text-base font-bold text-foreground-heading">{test.title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{test.subtitle}</p>
      <div className="mb-4 mt-4 flex items-center gap-3 text-xs text-muted-secondary">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {test.durationMin} min
        </span>
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" /> {test.questionCount} Q
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> {test.difficulty}
        </span>
      </div>
      <Link href={`/assessment/${test.id}`}>
        <Button variant="accent" size="sm" className="w-full">
          {best != null ? "Retake" : "Start"}
        </Button>
      </Link>
    </motion.article>
  );
}
