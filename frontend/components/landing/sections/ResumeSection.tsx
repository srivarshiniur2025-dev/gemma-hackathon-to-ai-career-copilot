"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { PaperTextureBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  { key: "header", label: "Header", text: "Alex Chen · SDE Intern Candidate" },
  { key: "skills", label: "Skills", text: "Python · FastAPI · React · MongoDB · Gemma 4", highlight: ["Python", "Gemma 4"] },
  { key: "exp", label: "Experience", text: "Built AI Career Copilot — full-stack internship platform with adaptive assessments.", weak: ["adaptive"] },
  { key: "projects", label: "Projects", text: "AI Resume Parser · Skill Radar Dashboard · Mock Interview Bot", highlight: ["AI Resume Parser"] },
  { key: "edu", label: "Education", text: "B.Tech Computer Science · CGPA 8.7" },
];

export function ResumeSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const docRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleSections(SECTIONS.map((s) => s.key));
      setTyped(Object.fromEntries(SECTIONS.map((s) => [s.key, s.text])));
      setScore(92);
      setShowSuggestions(true);
      return;
    }

    const doc = docRef.current;
    if (!doc) return;

    const st = ScrollTrigger.create({
      trigger: doc,
      start: "top 68%",
      once: true,
      onEnter: () => {
        SECTIONS.forEach((sec, i) => {
          gsap.delayedCall(i * 0.45, () => {
            setVisibleSections((prev) => [...prev, sec.key]);
            let idx = 0;
            const interval = setInterval(() => {
              idx++;
              setTyped((prev) => ({
                ...prev,
                [sec.key]: sec.text.slice(0, idx),
              }));
              if (idx >= sec.text.length) clearInterval(interval);
            }, 18);
          });
        });

        const obj = { val: 0 };
        gsap.to(obj, {
          val: 92,
          duration: 2,
          delay: 2.2,
          ease: "power2.out",
          onUpdate: () => setScore(Math.round(obj.val)),
        });

        gsap.delayedCall(2.8, () => setShowSuggestions(true));
      },
    });

    return () => st.kill();
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<PaperTextureBg />}>
      <div ref={docRef} className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_8px_40px_rgba(24,24,27,0.08)]">
          <div className="flex items-center justify-between border-b border-[#F4F4F5] bg-[#FAFAFA] px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Resume · Building
            </span>
            <span className="font-heading text-sm font-bold tabular-nums text-[#0D9488]">
              ATS {score}%
            </span>
          </div>
          <div className="space-y-5 p-5">
            {SECTIONS.map((sec) => {
              const visible = visibleSections.includes(sec.key);
              const text = typed[sec.key] ?? "";
              return (
                <div
                  key={sec.key}
                  className={cn(
                    "transition-opacity duration-300",
                    visible ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                  )}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    {sec.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#18181B]">
                    {text.split(/(\s+)/).map((word, wi) => {
                      const clean = word.trim();
                      const isHighlight = sec.highlight?.some((h) => clean.includes(h));
                      const isWeak = sec.weak?.some((w) => clean.includes(w));
                      return (
                        <span
                          key={wi}
                          className={cn(
                            isHighlight && "rounded bg-[#0D9488]/10 px-0.5 text-[#0D9488]",
                            isWeak && showSuggestions && "rounded bg-amber-500/10 px-0.5"
                          )}
                        >
                          {word}
                        </span>
                      );
                    })}
                    {visible && text.length < sec.text.length && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[#0D9488]" />
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          {showSuggestions && (
            <div className="border-t border-[#F4F4F5] bg-[#FAFAFA] px-5 py-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D9488]" />
                <p className="text-[11px] leading-relaxed text-[#52525B]">
                  Gemma suggests: Add quantified impact to Experience. Strengthen &ldquo;adaptive&rdquo; with metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionLayout>
  );
}
