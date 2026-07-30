"use client";

import { ChevronRight, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/lib/assessment-types";

interface QuestionCardProps {
  question: AssessmentQuestion;
  className?: string;
}

const difficultyStyles = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-error/10 text-error",
};

export function QuestionCard({ question, className }: QuestionCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border bg-white p-6 lg:p-8",
        className
      )}
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="outline">Q{question.id}</Badge>
        <Badge className={difficultyStyles[question.difficulty]}>{question.difficulty}</Badge>
        <Badge variant="secondary">{question.category}</Badge>
        <Badge variant="accent">{question.domain}</Badge>
      </div>

      <h2 className="font-heading text-xl font-bold leading-snug text-foreground-heading lg:text-2xl">
        {question.question}
      </h2>

      {question.example && (
        <div className="mt-6 rounded-[16px] bg-background-secondary p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Example
          </p>
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-muted-secondary">
            {question.example}
          </pre>
        </div>
      )}

      {question.hints.length > 0 && (
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="hints" className="border-none">
            <AccordionTrigger className="rounded-[14px] bg-background-secondary px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground-heading">
                <Lightbulb className="h-4 w-4 text-accent" />
                View Hints ({question.hints.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-3">
              <ul className="space-y-2">
                {question.hints.map((hint, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {hint}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
