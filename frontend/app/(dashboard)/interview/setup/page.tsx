"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Briefcase, Layers, MessageSquare, Server, Sparkles, Wand2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { generateRoleInterviewQuestions } from "@/lib/interview-demo-questions";
import { createDemoInterviewSession, storeDemoInterviewConfig } from "@/lib/mock-fallbacks";
import type { InterviewFocus } from "@/lib/interview-types";
import { cn } from "@/lib/utils";

const ROLE_PRESETS = [
  { id: "sde", label: "SDE Intern", icon: "💻" },
  { id: "fe", label: "Frontend Developer Intern", icon: "🎨" },
  { id: "be", label: "Backend Developer Intern", icon: "⚙️" },
  { id: "ml", label: "AI/ML Intern", icon: "🧠" },
  { id: "data", label: "Data Analyst Intern", icon: "📊" },
  { id: "pm", label: "Product Manager Intern", icon: "📋" },
  { id: "devops", label: "DevOps / SRE Intern", icon: "☁️" },
  { id: "custom", label: "Custom role", icon: "✨" },
];

const FOCUS_OPTIONS: {
  id: InterviewFocus;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "fundamentals", label: "Fundamentals", desc: "DSA, core concepts", icon: Layers },
  { id: "system_design", label: "System Design", desc: "Architecture & scale", icon: Server },
  { id: "behavioral", label: "Behavioral", desc: "STAR method", icon: MessageSquare },
  { id: "full_pipeline", label: "Full Pipeline", desc: "All stages", icon: Sparkles },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [preset, setPreset] = useState("sde");
  const [customRole, setCustomRole] = useState("");
  const [focus, setFocus] = useState<InterviewFocus>("full_pipeline");
  const [companyContext, setCompanyContext] = useState("a fast-growing technology startup");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const targetRole =
    preset === "custom"
      ? customRole.trim() || "Software Engineering Intern"
      : ROLE_PRESETS.find((r) => r.id === preset)?.label ?? "SDE Intern";

  async function handleGeneratePreview() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.generateInterviewQuestions({
        targetRole,
        focus,
        companyContext,
        jobDescription,
      });
      setPreviewQuestions(res.questions);
    } catch {
      const local = generateRoleInterviewQuestions({
        targetRole,
        focus,
        companyContext,
        jobDescription,
      });
      setPreviewQuestions(local);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let questions = previewQuestions;
    if (questions.length === 0) {
      try {
        const res = await api.generateInterviewQuestions({
          targetRole,
          focus,
          companyContext,
          jobDescription,
        });
        questions = res.questions;
      } catch {
        questions = generateRoleInterviewQuestions({
          targetRole,
          focus,
          companyContext,
          jobDescription,
        });
      }
    }

    try {
      const session = await api.createInterviewSession(targetRole, focus, {
        companyContext,
        jobDescription,
      });
      storeDemoInterviewConfig(session.session_id, {
        targetRole,
        focus,
        companyContext,
        jobDescription,
        questions,
      });
      router.push(`/interview/${session.session_id}`);
    } catch {
      const demo = createDemoInterviewSession(targetRole, focus, companyContext, jobDescription, questions);
      router.push(`/interview/${demo.session_id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-center gap-3">
          <GemmaBadge />
          <GemmaModelTag />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl text-foreground-heading">
          Gemma Mock Interview
        </h1>
        <p className="mt-2 text-muted leading-relaxed">
          Pick a role or paste a job description — Gemma generates tailored interview questions for that
          specific position, not generic prompts.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                Choose your target role
              </CardTitle>
              <CardDescription>Select a preset or enter a custom role title.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROLE_PRESETS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setPreset(r.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 text-left transition-all",
                      preset === r.id
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:border-border-hover"
                    )}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <p className="mt-1 text-xs font-semibold leading-tight">{r.label}</p>
                  </button>
                ))}
              </div>
              {preset === "custom" && (
                <Input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Blockchain Developer Intern at Coinbase"
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Job description (optional)</CardTitle>
              <CardDescription>
                Paste the internship posting — Gemma tailors every question to the skills and requirements listed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste the job listing here: responsibilities, required skills, qualifications..."
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-accent/15"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 gap-2 cursor-pointer rounded-xl"
                disabled={generating}
                onClick={() => void handleGeneratePreview()}
              >
                <Wand2 className="h-4 w-4" />
                {generating ? "Gemma is generating…" : "Preview Gemma questions"}
              </Button>
              {previewQuestions.length > 0 && (
                <ul className="mt-4 space-y-2 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
                  {previewQuestions.map((q, i) => (
                    <li key={i} className="flex gap-2 text-foreground">
                      <span className="font-bold text-accent">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Interview settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="company">Company context</Label>
                <Input
                  id="company"
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  placeholder="e.g. a Series B fintech like Razorpay"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Interview focus</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {FOCUS_OPTIONS.map(({ id, label, desc, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFocus(id)}
                      className={cn(
                        "cursor-pointer rounded-xl border p-4 text-left transition-all",
                        focus === id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-white hover:border-border-hover"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", focus === id ? "text-accent" : "text-muted")} />
                      <p className="mt-2 text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs text-muted">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer" disabled={loading}>
                {loading ? "Starting interview…" : "Start tailored mock interview"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </form>
      </FadeIn>
    </div>
  );
}
