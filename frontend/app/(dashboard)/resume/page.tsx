"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { resumeRoles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sections = ["Personal", "Education", "Skills", "Projects", "Experience", "Achievements"];

export default function ResumePage() {
  const [role, setRole] = useState("Software Engineer");
  const [atsScore, setAtsScore] = useState(89);
  const [generated, setGenerated] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      <FadeIn className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Gemma Resume Builder</h1>
          <p className="text-muted">Gemma rewrites bullet points and optimizes for ATS — role by role.</p>
        </div>
        <Button variant="secondary" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        {resumeRoles.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              role === r ? "bg-primary text-white" : "bg-white border border-border text-muted hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s}>
              <CardHeader className="pb-3"><CardTitle className="text-base">{s}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-xs">Title / Detail</Label><Input placeholder={`Enter ${s.toLowerCase()} details...`} className="mt-1" /></div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full gap-2" onClick={() => { setGenerated(true); setAtsScore(94); }}>
            <Sparkles className="h-4 w-4" /> Generate with Gemma
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">ATS Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-accent">{atsScore}%</span>
                <span className="mb-1 text-sm text-muted">match for {role}</span>
              </div>
              <Progress value={atsScore} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="min-h-[500px]">
            <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
            <CardContent>
              {generated ? (
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h3 className="text-lg font-bold">Alex Johnson</h3>
                    <p className="text-muted">alex@university.edu · github.com/alexj</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Summary</p>
                    <p className="mt-1 text-muted">Motivated {role} with strong Python and React skills. Built 3 production-grade projects with measurable impact.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Projects</p>
                    <ul className="mt-1 list-disc pl-5 text-muted space-y-1">
                      <li>Built AI Career Copilot using Gemma — adaptive assessments for 100+ users</li>
                      <li>Developed REST API with FastAPI handling 10K+ daily requests</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Skills</p>
                    <p className="mt-1 text-muted">Python, React, TypeScript, FastAPI, MongoDB, Git, Docker</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted py-20">Click &ldquo;Generate via AI&rdquo; to preview your resume.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
