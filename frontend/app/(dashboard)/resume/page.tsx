"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { api } from "@/lib/api";
import {
  defaultDraft,
  exportResumePdf,
  loadResumeDraft,
  saveResumeDraft,
  bulletsFromText,
  type ResumeDraft,
} from "@/lib/resume-export";
import { resumeRoles } from "@/lib/mock-data";
import type { Resume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const fieldClass =
  "flex min-h-[88px] w-full rounded-[14px] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20";

const sections: { key: keyof ResumeDraft; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "github", label: "GitHub URL" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "education", label: "Education", multiline: true },
  { key: "skills", label: "Skills (comma or newline)", multiline: true },
  { key: "projects", label: "Projects (one per line)", multiline: true },
  { key: "experience", label: "Experience (one per line)", multiline: true },
  { key: "certifications", label: "Certifications", multiline: true },
];

export default function ResumePage() {
  const { user } = useAuth();
  const { profile, refresh } = useCareerProfile();
  const { toast } = useToast();
  const [role, setRole] = useState(profile?.target_role || "Software Engineer");
  const [draft, setDraft] = useState<ResumeDraft>(() =>
    defaultDraft(user?.name ?? "Student", user?.email ?? "")
  );
  const [resume, setResume] = useState<Resume | null>(profile?.resume ?? null);
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const saved = loadResumeDraft(user?.email);
    if (saved) setDraft(saved);
    else if (user) setDraft(defaultDraft(user.name, user.email));
  }, [user]);

  useEffect(() => {
    if (profile?.resume) setResume(profile.resume);
    if (profile?.target_role) setRole(profile.target_role);
  }, [profile]);

  const atsScore =
    resume?.tailoring?.match_score ??
    (resume?.ats_keywords?.length ? Math.min(96, 72 + resume.ats_keywords.length * 2) : 0);

  const updateDraft = useCallback(
    (key: keyof ResumeDraft, value: string) => {
      setDraft((prev) => {
        const next = { ...prev, [key]: value };
        saveResumeDraft(next, user?.email);
        return next;
      });
    },
    [user?.email]
  );

  async function handleGenerate() {
    setGenerating(true);
    try {
      saveResumeDraft(draft, user?.email);
      await api.updateMe({
        name: draft.name,
        target_role: role,
        skills: draft.skills.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
        projects: bulletsFromText(draft.projects),
        certifications: bulletsFromText(draft.certifications),
        degree: draft.education.split("\n")[0] || profile?.degree || "",
      });
      const generated = await api.generateResume(role);
      setResume(generated);
      refresh();
      toast("Resume generated with Gemma", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not generate resume", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleOptimize() {
    if (!jobDescription.trim()) {
      toast("Paste a job description to tailor the resume", "error");
      return;
    }
    setGenerating(true);
    try {
      const tailoring = await api.optimizeResume(jobDescription.trim(), role);
      setResume((prev) => (prev ? { ...prev, tailoring } : prev));
      refresh();
      toast(`Tailored — ATS match ${tailoring.match_score}%`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Tailoring failed", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport() {
    if (!resume) {
      toast("Generate your resume first", "error");
      return;
    }
    setExporting(true);
    try {
      await exportResumePdf(resume, draft, role);
      toast("PDF downloaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "PDF export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <FadeIn className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Gemma Resume Builder</h1>
          <p className="text-muted">Real Gemma generation, ATS tailoring, and PDF export — not a placeholder preview.</p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={() => void handleExport()} disabled={!resume || exporting}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export PDF
        </Button>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        {resumeRoles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              role === r ? "bg-primary text-white" : "border border-border bg-white text-muted hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {sections.map(({ key, label, multiline }) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                {multiline ? (
                  <textarea
                    className={fieldClass}
                    value={draft[key]}
                    onChange={(e) => updateDraft(key, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${label.toLowerCase()}…`}
                  />
                ) : (
                  <Input value={draft[key]} onChange={(e) => updateDraft(key, e.target.value)} />
                )}
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tailor to job description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className={fieldClass}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste an internship JD — Gemma will rewrite bullets and score keyword match."
              />
              <Button variant="outline" className="w-full" onClick={() => void handleOptimize()} disabled={generating}>
                Tailor for this role
              </Button>
            </CardContent>
          </Card>
          <Button className="w-full gap-2" onClick={() => void handleGenerate()} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate with Gemma
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-accent">{resume ? atsScore : "—"}%</span>
                <span className="mb-1 text-sm text-muted">match for {role}</span>
              </div>
              {resume ? <Progress value={atsScore} className="mt-4" /> : null}
            </CardContent>
          </Card>

          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {!resume ? (
                <p className="py-20 text-center text-muted">Fill your details and click Generate with Gemma.</p>
              ) : (
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h3 className="text-lg font-bold">{draft.name || user?.name}</h3>
                    <p className="text-muted">
                      {[draft.email, draft.phone, draft.github].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Summary</p>
                    <p className="mt-1 text-muted">{resume.tailoring?.tailored_summary || resume.summary}</p>
                  </div>
                  {resume.projects?.length ? (
                    <div>
                      <p className="font-semibold text-primary">Projects</p>
                      <ul className="mt-1 list-disc space-y-2 pl-5 text-muted">
                        {resume.projects.map((p) => (
                          <li key={p.name}>
                            <span className="font-medium text-foreground">{p.name}</span>
                            <ul className="mt-1 list-disc pl-4">
                              {p.bullets.map((b) => (
                                <li key={b}>{b}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div>
                    <p className="font-semibold text-primary">Skills</p>
                    <p className="mt-1 text-muted">{resume.skills.join(" · ")}</p>
                  </div>
                  {resume.tips?.length ? (
                    <div>
                      <p className="font-semibold text-primary">Gemma tips</p>
                      <ul className="mt-1 list-disc pl-5 text-muted">
                        {resume.tips.slice(0, 3).map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
