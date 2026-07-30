"use client";

import { memo } from "react";
import { ChevronDown, ChevronUp, ExternalLink, MapPin } from "lucide-react";
import { SpamVerdictBadge } from "@/components/internships/SpamVerdictBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InternshipSearchResult } from "@/lib/types";

interface InternshipResultCardProps {
  item: InternshipSearchResult;
  index: number;
  expanded: string | null;
  onToggle: (key: string | null) => void;
}

export const InternshipResultCard = memo(function InternshipResultCard({
  item,
  index,
  expanded,
  onToggle,
}: InternshipResultCardProps) {
  const key = item.posting.source_url || `${item.posting.title}-${index}`;
  const isOpen = expanded === key;
  const trustScore = item.trust_score ?? 100 - item.spam_risk_score;
  const isVerified = item.verdict === "legitimate" && trustScore >= 80;
  const flags = item.flags ?? item.red_flags;

  return (
    <Card className="h-full transition-shadow hover:card-shadow-lg">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-foreground-heading">{item.posting.title}</h3>
              <SpamVerdictBadge
                verdict={item.verdict}
                verified={isVerified}
                trustScore={isVerified ? trustScore : undefined}
                score={item.spam_risk_score}
              />
            </div>
            <p className="text-sm text-muted">{item.posting.company_name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.posting.location}
              {item.posting.salary && ` · ${item.posting.salary}`}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {item.posting.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.posting.source_url && (
            <a
              href={item.posting.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm", className: "gap-1 bg-accent hover:bg-accent-hover" })}
            >
              Apply Now <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={() => onToggle(isOpen ? null : key)}
          >
            {isOpen ? (
              <>
                Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Safety details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-3 rounded-xl border border-border bg-background-secondary/50 p-4 text-sm">
            <p className="leading-relaxed text-muted">{item.reasoning}</p>
            {flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Flags</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted">
                  {flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
