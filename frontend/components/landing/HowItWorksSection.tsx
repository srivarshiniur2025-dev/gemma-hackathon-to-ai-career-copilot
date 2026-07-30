"use client";

import {
  LineDraw,
  ProgressIndicator,
  SectionReveal,
  SectionRevealItem,
  SectionRevealStagger,
} from "@/components/motion/SectionReveal";
import { steps } from "@/lib/mock-data";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="below-fold-section px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionReveal variant="slide-up" className="text-center">
          <h2 className="font-heading text-3xl font-extrabold md:text-4xl">How it works</h2>
          <p className="mt-4 text-muted">From signup to internship in six clear steps.</p>
          <LineDraw className="mx-auto mt-8 max-w-xs" />
        </SectionReveal>

        <div className="relative mt-16">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px">
            <LineDraw direction="vertical" className="h-full bg-accent/30" />
          </div>

          <SectionRevealStagger stagger={0.12}>
            {steps.map((s, i) => (
              <SectionRevealItem
                key={s.step}
                variant={i % 2 === 0 ? "slide-left" : "slide-right"}
              >
                <div className={`relative flex gap-8 pb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="hidden flex-1 md:block" />
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white card-shadow md:absolute md:left-1/2 md:-translate-x-1/2">
                    {s.step}
                  </div>
                  <div className="flex-1 rounded-[18px] border border-border bg-white p-6 card-shadow hover:border-border-hover md:max-w-sm">
                    <h3 className="font-heading font-bold text-foreground-heading">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.description}</p>
                    <ProgressIndicator value={(i + 1) * (100 / steps.length)} className="mt-4" />
                  </div>
                </div>
              </SectionRevealItem>
            ))}
          </SectionRevealStagger>
        </div>
      </div>
    </section>
  );
}
