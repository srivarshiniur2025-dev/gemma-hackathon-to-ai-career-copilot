"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mic, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { WavePatternBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { INTERVIEW_FLOW } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function InterviewSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setStep(INTERVIEW_FLOW.length - 1);
      setShowAnswer(true);
      setShowEval(true);
      setConfidence(88);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top 65%",
      end: "bottom 30%",
      scrub: 0.5,
      onUpdate: (self) => {
        const s = Math.min(
          INTERVIEW_FLOW.length - 1,
          Math.floor(self.progress * INTERVIEW_FLOW.length * 1.2)
        );
        setStep(s);
        setShowAnswer(self.progress > 0.15);
        setShowEval(self.progress > 0.35);
        setConfidence(Math.round(INTERVIEW_FLOW[s]?.confidence ?? 0));
      },
    });

    return () => st.kill();
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<WavePatternBg />}>
      <div ref={containerRef} className="relative mx-auto h-[400px] w-full max-w-md">
        {INTERVIEW_FLOW.map((item, i) => {
          const offset = i - step;
          const isCurrent = i === step;
          if (Math.abs(offset) > 1) return null;

          return (
            <div
              key={i}
              className="absolute inset-x-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                top: `${offset * 24}px`,
                opacity: isCurrent ? 1 : 0.35,
                transform: `scale(${isCurrent ? 1 : 0.94}) translateX(${offset * 20}px)`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-[0_8px_32px_rgba(24,24,27,0.07)]">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#0D9488]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    Question {i + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#18181B]">{item.q}</p>

                {showAnswer && isCurrent && (
                  <div className="mt-4 rounded-xl border border-[#F4F4F5] bg-[#FAFAFA] p-3">
                    <p className="text-xs leading-relaxed text-[#71717A]">
                      &ldquo;I broke the problem into metrics, isolated the bottleneck with profiling,
                      and shipped a fix that reduced latency by 40%...&rdquo;
                    </p>
                  </div>
                )}

                {showEval && isCurrent && (
                  <div className="mt-4 flex items-center justify-between border-t border-[#F4F4F5] pt-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
                      <span className="text-xs text-[#52525B]">Gemma score</span>
                      <span className="font-heading text-lg font-bold text-[#18181B]">{item.score}</span>
                    </div>
                    <div className="w-28">
                      <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A1A1AA]">Confidence</p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F4F5]">
                        <div
                          className="h-full rounded-full bg-[#0D9488] transition-all duration-700"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionLayout>
  );
}
