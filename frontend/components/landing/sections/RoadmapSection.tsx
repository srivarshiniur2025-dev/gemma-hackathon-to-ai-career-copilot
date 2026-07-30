"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Circle } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { RouteLinesBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { ROADMAP_STEPS } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function RoadmapSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineProgress, setLineProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(1);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    if (reduceMotion) {
      path.style.strokeDashoffset = "0";
      setLineProgress(1);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "bottom 40%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        path.style.strokeDashoffset = `${len * (1 - p)}`;
        setLineProgress(p);
        setActiveIdx(Math.min(ROADMAP_STEPS.length - 1, Math.floor(p * ROADMAP_STEPS.length)));
      },
    });

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: i % 2 === 0 ? -24 : 24, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => st.kill();
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<RouteLinesBg />}>
      <div ref={sectionRef} className="relative mx-auto w-full max-w-md py-4">
        <svg className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2" viewBox="0 0 8 400" preserveAspectRatio="none">
          <path
            ref={pathRef}
            d="M 4 0 L 4 400"
            fill="none"
            stroke="#E4E4E7"
            strokeWidth="2"
          />
          <path
            d="M 4 0 L 4 400"
            fill="none"
            stroke="#0D9488"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400 * (1 - lineProgress),
            }}
          />
        </svg>

        <div className="relative space-y-10">
          {ROADMAP_STEPS.map((step, i) => {
            const isLeft = i % 2 === 0;
            const isActive = i === activeIdx;
            const isDone = step.status === "done";

            return (
              <div
                key={step.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={cn(
                  "relative flex items-center gap-4",
                  isLeft ? "flex-row pr-[45%]" : "flex-row-reverse pl-[45%]"
                )}
              >
                <div
                  className={cn(
                    "absolute left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white transition-all duration-500",
                    isDone && "border-[#0D9488] bg-[#0D9488]",
                    isActive && !isDone && "border-[#0D9488] shadow-[0_0_0_4px_rgba(13,148,136,0.15)]",
                    !isDone && !isActive && "border-[#E4E4E7]"
                  )}
                >
                  {isDone ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : (
                    <Circle className={cn("h-2 w-2", isActive ? "fill-[#0D9488] text-[#0D9488]" : "fill-[#E4E4E7] text-[#E4E4E7]")} />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-xl border bg-white p-4 shadow-[0_4px_20px_rgba(24,24,27,0.05)] transition-all duration-500",
                    isActive ? "border-[#0D9488]/30 shadow-[0_8px_32px_rgba(13,148,136,0.1)]" : "border-[#E4E4E7]",
                    isLeft ? "text-right" : "text-left"
                  )}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">{step.duration}</p>
                  <p className="mt-1 text-sm font-semibold text-[#18181B]">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#71717A]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionLayout>
  );
}
