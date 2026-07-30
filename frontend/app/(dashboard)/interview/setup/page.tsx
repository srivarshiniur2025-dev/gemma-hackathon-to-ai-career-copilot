"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Layers, MessageSquare, Server, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { createDemoInterviewSession } from "@/lib/mock-fallbacks";
import type { InterviewFocus } from "@/lib/interview-types";
import { cn } from "@/lib/utils";

const ROLES = [
  "SDE Intern",
  "Software Engineer",
  "Data Analyst Intern",
  "AI/ML Intern",
  "Frontend Developer Intern",
  "Backend Developer Intern",
];

const FOCUS_OPTIONS: {
  id: InterviewFocus;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "fundamentals", label: "Fundamentals", desc: "DSA, Python, core concepts", icon: Layers },
  { id: "system_design", label: "System Design", desc: "Architecture & scalability", icon: Server },
  { id: "behavioral", label: "Behavioral", desc: "STAR method questions", icon: MessageSquare },
  { id: "full_pipeline", label: "Full Pipeline", desc: "All 3 stages sequentially", icon: Sparkles },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [role, setRole] = useState(ROLES[0]);
  const [focus, setFocus] = useState<InterviewFocus>("full_pipeline");
  const [companyContext, setCompanyContext] = useState("a fast-growing technology startup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await api.createInterviewSession(role, focus, {
        companyContext,
      });
      router.push(`/interview/${session.session_id}`);
    } catch {
      const demo = createDemoInterviewSession(role, focus, companyContext);
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
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">Gemma 4 Interview Simulation</h1>
        <p className="mt-2 text-muted leading-relaxed">
          Structured mock interview powered by Gemma 4 — adaptive questions from your resume and skills,
          with real-time WebSocket conversation and post-interview analytics.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <form onSubmit={handleSubmit}>
          <Card className="card-shadow-lg">
            <CardHeader>
              <CardTitle>Configure your interview</CardTitle>
              <CardDescription>Gemma 4 adapts questions from your profile, role, and company context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="role">Target Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-border-focus focus:ring-[3px] focus:ring-accent/18"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="company">Company Context</Label>
                <Input
                  id="company"
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  placeholder="e.g. a fast-growing fintech startup like Stripe"
                  className="mt-2"
                />
                <p className="mt-1.5 text-xs text-muted">
                  Gemma 4 tailors questions to this company style. Resume and skills load from your profile.
                </p>
              </div>

              <div>
                <Label>Interview Focus</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {FOCUS_OPTIONS.map(({ id, label, desc, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFocus(id)}
                      className={cn(
                        "cursor-pointer rounded-xl border p-4 text-left transition-all",
                        focus === id
                          ? "border-primary bg-primary/5 card-shadow"
                          : "border-border bg-white hover:border-border-hover"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", focus === id ? "text-accent" : "text-muted")} />
                      <p className="mt-2 font-semibold text-sm">{label}</p>
                      <p className="mt-1 text-xs text-muted">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? "Creating session..." : "Start Gemma 4 Interview"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </form>
      </FadeIn>
    </div>
  );
}
