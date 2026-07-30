"use client";

import {
  LineDraw,
  SectionReveal,
  SectionRevealItem,
  SectionRevealStagger,
} from "@/components/motion/SectionReveal";
import { GemmaBanner } from "@/components/gemma/GemmaBrand";

const gemmaFeatures = [
  {
    title: "Adaptive reasoning",
    desc: "Gemma adjusts each question based on your last answer — estimating real proficiency, not checkbox skills.",
  },
  {
    title: "Structured career outputs",
    desc: "Roadmaps, resumes, and internship matches are generated as structured JSON via Gemma's reasoning.",
  },
  {
    title: "Explainable recommendations",
    desc: "Gemma explains why each internship fits and what's missing — not black-box keyword matching.",
  },
  {
    title: "Open & hackathon-ready",
    desc: "Built on Gemma 4 open models via the Gemini API — lightweight, capable, and purpose-built for this sprint.",
  },
];

export function WhyGemmaSection() {
  return (
    <section id="why-gemma" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal variant="mask" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Built with Gemma</p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold md:text-4xl">
            Why Gemma powers everything
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            AI Career Copilot isn&apos;t AI-washed — Gemma 4 is the engine behind every assessment, roadmap, resume, and interview.
          </p>
          <LineDraw className="mx-auto mt-8 max-w-xs" />
        </SectionReveal>

        <SectionReveal variant="scale" delay={0.1} className="mt-12">
          <GemmaBanner />
        </SectionReveal>

        <SectionRevealStagger className="mt-12 grid gap-6 md:grid-cols-2" stagger={0.1}>
          {gemmaFeatures.map((f, i) => (
            <SectionRevealItem key={f.title} variant={i % 2 === 0 ? "slide-left" : "slide-right"}>
              <div className="rounded-[18px] border border-border bg-white p-6 card-shadow hover:border-border-hover">
                <h3 className="font-heading font-bold text-foreground-heading">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            </SectionRevealItem>
          ))}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
