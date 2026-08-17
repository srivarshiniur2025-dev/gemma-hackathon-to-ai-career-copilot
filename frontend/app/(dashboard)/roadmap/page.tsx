"use client";

import { motion } from "framer-motion";
import { ArrowDown, BookOpen, Clock, FolderGit2, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { api } from "@/lib/api";
import { mockRoadmapSteps } from "@/lib/mock-data";
import { useState } from "react";

export default function RoadmapPage() {
  const { profile, mergeFromProfile } = useCareerProfile();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const roadmap = profile?.roadmap;

  async function regenerate() {
    setGenerating(true);
    setError("");
    try {
      await api.generateRoadmap();
      const next = await api.getMe();
      mergeFromProfile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate roadmap");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <FadeIn className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Your learning roadmap</h1>
          <p className="text-muted">
            {roadmap?.overview ||
              "Gemma builds this path from your track, onboarding answers, and assessments."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void regenerate()} disabled={generating}>
          <Sparkles className="h-4 w-4" />
          {generating ? "Updating…" : "Regenerate"}
        </Button>
      </FadeIn>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {roadmap?.priority_skills?.length ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {roadmap.priority_skills.map((skill) => (
            <Badge key={skill.skill} variant="secondary">
              {skill.skill}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <div className="absolute bottom-0 left-6 top-0 w-px bg-border" />
        {roadmap?.milestones?.length
          ? roadmap.milestones.map((step, i) => (
              <FadeIn key={`${step.week}-${step.title}`} delay={i * 0.04}>
                <div className="relative pb-8 pl-16">
                  <div className="absolute left-3.5 top-6 h-5 w-5 rounded-full border-2 border-primary bg-white" />
                  {i < roadmap.milestones.length - 1 && (
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -bottom-1 left-[22px] text-muted"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </motion.div>
                  )}
                  <Card className="transition-shadow hover:card-shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-bold">
                          Week {step.week}: {step.title}
                        </h3>
                        <Badge variant="secondary">{Math.min(100, Math.round(((i + 1) / roadmap.milestones.length) * 12))}%</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted">{step.why}</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
                        {step.tasks.map((task) => (
                          <li key={task}>{task}</li>
                        ))}
                      </ul>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2 text-sm text-muted">
                          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {step.resources[0] || "Curated resources"}
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted">
                          <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {step.tasks[0]}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            ))
          : mockRoadmapSteps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.06}>
                <div className="relative pb-8 pl-16">
                  <div className="absolute left-3.5 top-6 h-5 w-5 rounded-full border-2 border-primary bg-white" />
                  <Card className="transition-shadow hover:card-shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-bold">{step.title}</h3>
                        <Badge variant="secondary">{step.progress}% complete</Badge>
                      </div>
                      <Progress value={step.progress} className="mt-3" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Clock className="h-4 w-4 text-accent" /> {step.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <BookOpen className="h-4 w-4 text-accent" /> {step.resources[0]}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <FolderGit2 className="h-4 w-4 text-accent" /> {step.projects[0]}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
