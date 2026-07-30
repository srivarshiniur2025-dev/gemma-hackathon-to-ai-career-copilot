"use client";

import { Sparkles } from "lucide-react";
import { GEMMA_BADGE_LABEL, GEMMA_FULL_LABEL, GEMMA_MODEL_ID, GEMMA_VERSION } from "@/lib/gemma";
import { cn } from "@/lib/utils";

/** Reusable Gemma 4 branding — use prominently across the hackathon app. */
export function GemmaBadge({ className, size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background-secondary font-semibold text-muted-secondary",
        sizes[size],
        className
      )}
    >
      <Sparkles className={cn("text-accent", size === "lg" ? "h-4 w-4" : "h-3 w-3")} />
      {GEMMA_BADGE_LABEL}
    </span>
  );
}

export function GemmaModelTag({ model = GEMMA_MODEL_ID }: { model?: string }) {
  return (
    <span className="rounded-lg border border-border bg-background-secondary px-2 py-0.5 font-mono text-[10px] text-muted">
      {GEMMA_VERSION} · {model}
    </span>
  );
}

export function GemmaChatAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold",
        className
      )}
      title={`${GEMMA_VERSION} AI`}
    >
      G
    </div>
  );
}

export function GemmaBanner() {
  return (
    <div className="rounded-[18px] border border-border bg-background-secondary p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <GemmaBadge size="md" className="mb-3" />
          <h3 className="text-lg font-bold text-foreground-heading">Powered by Google {GEMMA_VERSION}</h3>
          <p className="mt-2 max-w-xl text-sm text-muted leading-relaxed">
            Every feature in AI Career Copilot runs on {GEMMA_VERSION} ({GEMMA_MODEL_ID}) — adaptive assessments,
            roadmap reasoning, resume rewriting, internship matching, and mock interviews. Gemma 4 is the core
            intelligence, not an add-on.
          </p>
        </div>
        <GemmaModelTag />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Adaptive Q&A", "Skill reasoning", "Resume generation", "Interview simulation", "Explainable matching"].map(
          (cap) => (
            <span
              key={cap}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-secondary"
            >
              {cap}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export { GEMMA_FULL_LABEL, GEMMA_MODEL_ID, GEMMA_VERSION };
