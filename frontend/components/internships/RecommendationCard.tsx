"use client";

import { memo } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { SpamVerdictBadge } from "@/components/internships/SpamVerdictBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { VerifiedInternshipRecommendation } from "@/lib/types";

interface RecommendationCardProps {
  item: VerifiedInternshipRecommendation;
  index: number;
  expanded: string | null;
  onToggle: (key: string | null) => void;
}

export const RecommendationCard = memo(function RecommendationCard({
  item,
  index,
  expanded,
  onToggle,
}: RecommendationCardProps) {
  const key = item.posting.source_url || `${item.posting.title}-${index}`;
  const isOpen = expanded === key;

  return (
    <Card className="h-full transition-shadow hover:card-shadow-lg">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-foreground-heading">{item.posting.title}</h3>
              <SpamVerdictBadge verdict={item.verdict} verified trustScore={item.trust_score} />
            </div>
            <p className="text-sm text-muted">{item.posting.company_name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.posting.location}
              {item.posting.salary && ` · ${item.posting.salary}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-accent">{item.match_score}%</p>
            <p className="text-xs text-muted">match</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">{item.why_recommended}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {item.missing_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Skill gaps</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.missing_skills.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
          <Button variant="secondary" size="sm" onClick={() => onToggle(isOpen ? null : key)}>
            {isOpen ? "Hide plan" : "Improvement plan"}
          </Button>
        </div>

        {isOpen && item.improvement_plan.length > 0 && (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
            {item.improvement_plan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
});
