"use client";

import {
  BarChart3,
  Brain,
  Briefcase,
  FileText,
  Map,
  Mic,
} from "lucide-react";
import { PremiumCard } from "@/components/motion/PremiumMotion";
import {
  LineDraw,
  SectionReveal,
  SectionRevealItem,
  SectionRevealStagger,
} from "@/components/motion/SectionReveal";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/lib/mock-data";

const icons = { brain: Brain, map: Map, file: FileText, briefcase: Briefcase, mic: Mic, chart: BarChart3 };

export function FeaturesSection() {
  return (
    <section id="features" className="below-fold-section relative bg-background-secondary px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal variant="mask" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Platform</p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold md:text-4xl">
            Everything you need to <span className="text-gradient">launch your career</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Six Gemma-powered tools. One enterprise-grade experience.
          </p>
          <LineDraw className="mx-auto mt-8 max-w-xs" />
        </SectionReveal>

        <SectionRevealStagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {features.map((f, i) => {
            const Icon = icons[f.icon];
            return (
              <SectionRevealItem key={f.title} variant={i % 2 === 0 ? "slide-up" : "rotate-in"}>
                <PremiumCard className="group h-full bg-white p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-background-secondary transition-transform duration-300 group-hover:scale-[1.02]">
                    <Icon className="h-6 w-6 text-foreground-heading" />
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="font-heading text-lg">{f.title}</CardTitle>
                    <CardDescription className="mt-2">{f.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4 p-0">
                    <ul className="space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </PremiumCard>
              </SectionRevealItem>
            );
          })}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
