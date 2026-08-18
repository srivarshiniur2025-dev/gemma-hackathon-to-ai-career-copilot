"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, Filter, Flame, Sparkles } from "lucide-react";
import { catalogForAudience, CATALOG_COUNTS } from "@/lib/neet/catalog";
import { loadMockProgress } from "@/lib/neet/progress";
import type { TrackExperience } from "@/lib/learner-track";
import { trackCopy } from "@/lib/learner-track";
import type { Audience, ExamSubject, MockKind, MockTestMeta } from "@/lib/neet/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBJECT_STYLES: Record<string, string> = {
  physics: "bg-blue-50 text-blue-700 border-blue-100",
  chemistry: "bg-amber-50 text-amber-800 border-amber-100",
  biology: "bg-teal-50 text-teal-800 border-teal-100",
  pcb: "bg-zinc-900 text-white border-zinc-800",
  science: "bg-emerald-50 text-emerald-800 border-emerald-100",
};

const TABS: { id: "chapter" | "sectional" | "full" | "pyq" | "rapid" | "all"; label: string; kinds: MockKind[] }[] = [
  { id: "all", label: "All tests", kinds: ["chapter", "sectional", "full", "pyq", "rapid"] },
  { id: "chapter", label: "Chapter assessments", kinds: ["chapter"] },
  { id: "sectional", label: "Sectionals", kinds: ["sectional"] },
  { id: "full", label: "Full mocks", kinds: ["full"] },
  { id: "pyq", label: "PYQ-style papers", kinds: ["pyq"] },
  { id: "rapid", label: "Rapid fire", kinds: ["rapid"] },
];

function subjectLabel(subject: ExamSubject) {
  if (subject === "pcb") return "PCB";
  return subject[0].toUpperCase() + subject.slice(1);
}

export function MockCatalog({ audience, experience }: { audience: Audience; experience: TrackExperience }) {
  const params = useSearchParams();
  const copy = trackCopy(experience);
  const initialTab = (params.get("tab") as (typeof TABS)[number]["id"]) || "all";
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "all"
  );
  const [subject, setSubject] = useState<ExamSubject | "all">("all");
  const progress = useMemo(() => loadMockProgress(), []);
  const tests = catalogForAudience(audience);
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  const visible = tests.filter((t) => {
    if (!active.kinds.includes(t.kind)) return false;
    if (audience === "school" && (tab === "pyq" || tab === "sectional")) return t.kind === "chapter" || t.kind === "full";
    if (subject === "all") return true;
    return t.subject === subject || (subject === "pcb" && t.subject === "pcb");
  });

  const subjects: (ExamSubject | "all")[] =
    audience === "school" ? ["all", "science"] : ["all", "physics", "chemistry", "biology", "pcb"];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-accent/15 bg-gradient-to-br from-white via-[#F0FDFA] to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{copy.mocksEyebrow}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-foreground-heading">{copy.mocksTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {experience === "neet"
                ? `${CATALOG_COUNTS.neet} timed papers across Physics, Chemistry and Biology. ${copy.mocksDescription}`
                : copy.mocksDescription}
            </p>
          </div>
          <div className="flex gap-3">
            <StatChip icon={Flame} label="In bank" value={`${tests.length}`} />
            <StatChip icon={CheckCircle2} label="You finished" value={`${Object.keys(progress.bestByTest).length}`} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.filter((t) => (audience === "school" ? t.id === "all" || t.id === "chapter" || t.id === "full" : true)).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200",
                tab === t.id
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-white text-muted-secondary hover:border-accent/40 hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                subject === s ? "border-accent bg-accent/10 text-accent" : "border-border bg-white text-muted"
              )}
            >
              {s === "all" ? "All subjects" : subjectLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">{visible.length} tests in this view</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((test, i) => (
          <TestCard key={test.id} test={test} delay={Math.min(i * 0.02, 0.3)} best={progress.bestByTest[test.id]} />
        ))}
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white px-4 py-3">
      <Icon className="mb-1 h-4 w-4 text-accent" />
      <p className="text-lg font-extrabold text-foreground-heading">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function TestCard({ test, delay, best }: { test: MockTestMeta; delay: number; best?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex flex-col rounded-[22px] border border-border bg-white p-5 shadow-[0_2px_8px_rgba(24,24,27,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(13,148,136,0.12)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", SUBJECT_STYLES[test.subject] ?? SUBJECT_STYLES.biology)}>
          {subjectLabel(test.subject)}
        </span>
        {best != null ? (
          <span className="text-xs font-semibold text-accent">Best {best}%</span>
        ) : (
          <span className="text-xs text-muted">Not attempted</span>
        )}
      </div>
      <h3 className="font-heading text-base font-bold text-foreground-heading">{test.title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{test.subtitle}</p>
      <div className="mt-4 mb-4 flex items-center gap-3 text-xs text-muted-secondary">
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
      <Link href={`/mocks/${test.id}`}>
        <Button variant="accent" size="sm" className="w-full">
          {best != null ? "Retake" : "Start"}
        </Button>
      </Link>
    </motion.article>
  );
}
