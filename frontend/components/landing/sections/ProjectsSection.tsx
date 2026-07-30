"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { FloatingGeometryBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { PROJECT_CARDS } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack || reduceMotion) return;

    const st = ScrollTrigger.create({
      trigger: stack,
      start: "top 65%",
      end: "bottom 35%",
      scrub: 0.8,
      onUpdate: (self) => {
        const idx = Math.min(
          PROJECT_CARDS.length - 1,
          Math.floor(self.progress * PROJECT_CARDS.length)
        );
        setActive(idx);
      },
    });

    return () => st.kill();
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<FloatingGeometryBg />}>
      <div
        ref={stackRef}
        className="relative mx-auto flex h-[420px] w-full max-w-sm items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {PROJECT_CARDS.map((project, i) => {
          const offset = i - active;
          const isHovered = hovered === i;
          const z = isHovered ? 50 : 10 - Math.abs(offset);
          const rotateY = offset * -8;
          const rotateX = 4 + Math.abs(offset) * 2;
          const translateZ = -offset * 40 + (isHovered ? 60 : 0);
          const translateY = offset * 12;
          const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15;

          return (
            <div
              key={project.id}
              className={cn(
                "absolute w-[280px] cursor-default rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-[0_12px_40px_rgba(24,24,27,0.08)] transition-shadow duration-300",
                isHovered && "shadow-[0_20px_60px_rgba(24,24,27,0.14)]"
              )}
              style={{
                transform: `translateY(${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px)`,
                opacity,
                zIndex: z,
                transformStyle: "preserve-3d",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="font-heading text-lg font-bold text-[#18181B]">{project.title}</h3>
              <p className="mt-2 text-xs text-[#71717A]">{project.stack}</p>
              <p className="mt-4 text-sm font-semibold text-[#0D9488]">{project.impact}</p>
              {isHovered && (
                <p className="mt-3 text-[10px] uppercase tracking-wider text-[#A1A1AA]">
                  Portfolio ready · Gemma verified
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SectionLayout>
  );
}
