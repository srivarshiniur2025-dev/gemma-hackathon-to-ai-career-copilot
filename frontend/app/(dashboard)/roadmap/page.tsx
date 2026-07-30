"use client";

import { motion } from "framer-motion";
import { ArrowDown, BookOpen, Clock, FolderGit2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockRoadmapSteps } from "@/lib/mock-data";

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <FadeIn className="mb-8">
        <h1 className="text-2xl font-extrabold">Gemma Learning Roadmap</h1>
        <p className="text-muted">Gemma generated this personalized path to internship readiness.</p>
      </FadeIn>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
        {mockRoadmapSteps.map((step, i) => (
          <FadeIn key={step.title} delay={i * 0.06}>
            <div className="relative pb-8 pl-16">
              <div className="absolute left-3.5 top-6 h-5 w-5 rounded-full border-2 border-primary bg-white" />
              {i < mockRoadmapSteps.length - 1 && (
                <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute left-[22px] -bottom-1 text-muted">
                  <ArrowDown className="h-4 w-4" />
                </motion.div>
              )}
              <Card className="transition-shadow hover:card-shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-lg">{step.title}</h3>
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
