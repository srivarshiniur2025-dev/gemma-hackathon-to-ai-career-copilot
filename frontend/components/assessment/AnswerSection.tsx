"use client";

import { Code2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/lib/assessment-types";

interface AnswerSectionProps {
  question: AssessmentQuestion;
  answer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AnswerSection({ question, answer, onChange, disabled }: AnswerSectionProps) {
  const isCoding = question.type === "coding";

  return (
    <div className="rounded-[24px] border border-border bg-white p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCoding ? (
            <Code2 className="h-4 w-4 text-accent" />
          ) : (
            <FileText className="h-4 w-4 text-accent" />
          )}
          <h3 className="text-sm font-semibold text-foreground-heading">
            {isCoding ? "Code Editor" : "Your Answer"}
          </h3>
        </div>
        {isCoding && question.language && (
          <Badge variant="outline" className="font-mono uppercase">
            {question.language}
          </Badge>
        )}
      </div>

      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={
          isCoding
            ? `# Write your ${question.language ?? "code"} solution here\n`
            : "Type your detailed answer here. Be specific and structured."
        }
        spellCheck={!isCoding}
        className={cn(
          "min-h-[200px] w-full resize-y rounded-[16px] border border-border bg-background-secondary px-4 py-4 text-sm leading-relaxed outline-none transition-all duration-200",
          "focus:border-accent focus:ring-2 focus:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isCoding && "font-mono text-[13px] text-foreground-heading"
        )}
        rows={isCoding ? 12 : 8}
      />

      <p className="mt-3 text-xs text-muted">
        {isCoding
          ? "Use proper indentation. Gemma evaluates logic, correctness, and complexity."
          : "Explain concepts clearly — interviewers value structured reasoning."}
      </p>
    </div>
  );
}
