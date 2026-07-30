"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { DotMatrixBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { ASSESSMENT_SKILLS } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const GRID = [
  { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 },
  { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 },
];

function SkillCard({
  skill,
  displayPct,
  flipped,
  expanded,
  onHover,
  onLeave,
}: {
  skill: (typeof ASSESSMENT_SKILLS)[0];
  displayPct: number;
  flipped: boolean;
  expanded: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="group absolute h-[88px] w-[88px] cursor-default sm:h-[100px] sm:w-[100px]"
      style={{ perspective: "800px" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded && "z-20 scale-110"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_4px_20px_rgba(24,24,27,0.06)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-xl">{skill.icon}</span>
          <p className="mt-1 text-[11px] font-semibold text-[#18181B]">{skill.name}</p>
          <p className="text-[10px] tabular-nums text-[#0D9488]">{displayPct}%</p>
        </div>
        <div
          className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-[#0D9488]/20 bg-[#FAFAFA] p-2.5 shadow-lg sm:p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {expanded ? (
            <div className="space-y-1 text-[8px] leading-tight text-[#52525B] sm:text-[9px]">
              <p><span className="text-[#A1A1AA]">Level</span> {skill.current}</p>
              <p><span className="text-[#A1A1AA]">Industry</span> {skill.industry}</p>
              <p><span className="text-[#A1A1AA]">Gap</span> {skill.gap}</p>
              <p><span className="text-[#A1A1AA]">Conf.</span> {skill.confidence}%</p>
              <p className="text-[#0D9488]">{skill.learning}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[10px] font-semibold text-[#18181B]">{skill.name}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-[#0D9488]">{displayPct}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssessmentSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [percents, setPercents] = useState<number[]>(() => ASSESSMENT_SKILLS.map(() => 0));
  const [flipped, setFlipped] = useState<boolean[]>(() => ASSESSMENT_SKILLS.map(() => false));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const assembled = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setPercents(ASSESSMENT_SKILLS.map((s) => s.percent));
      setFlipped(ASSESSMENT_SKILLS.map(() => true));
      setShowBadge(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top 70%",
      once: true,
      onEnter: () => {
        if (assembled.current) return;
        assembled.current = true;

        const cellW = 112;
        const cellH = 112;
        const originX = 56;
        const originY = 56;

        ASSESSMENT_SKILLS.forEach((skill, i) => {
          const el = cardRefs.current[i];
          if (!el) return;
          const g = GRID[i];
          const tx = g.c * cellW + originX;
          const ty = g.r * cellH + originY;

          gsap.fromTo(
            el,
            { x: skill.scatter.x, y: skill.scatter.y, rotation: skill.scatter.r, opacity: 0.3 },
            {
              x: tx,
              y: ty,
              rotation: 0,
              opacity: 1,
              duration: 0.7,
              delay: i * 0.12,
              ease: "power3.out",
            }
          );

          gsap.delayedCall(0.5 + i * 0.12, () => {
            setFlipped((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          });

          const obj = { val: 0 };
          gsap.to(obj, {
            val: skill.percent,
            duration: 1,
            delay: 0.6 + i * 0.12,
            ease: "power2.out",
            onUpdate: () => {
              setPercents((prev) => {
                const next = [...prev];
                next[i] = Math.round(obj.val);
                return next;
              });
            },
          });
        });

        gsap.delayedCall(1.6, () => setShowBadge(true));
      },
    });

    return () => st.kill();
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<DotMatrixBg />}>
      <div ref={containerRef} className="relative mx-auto h-[280px] w-full max-w-[360px] sm:h-[320px] sm:max-w-[400px]">
        {ASSESSMENT_SKILLS.map((skill, i) => (
          <div
            key={skill.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="absolute left-0 top-0"
            style={
              reduceMotion
                ? { transform: `translate(${GRID[i].c * 112 + 56}px, ${GRID[i].r * 112 + 56}px)` }
                : undefined
            }
          >
            <SkillCard
              skill={skill}
              displayPct={percents[i]}
              flipped={flipped[i]}
              expanded={expanded === i}
              onHover={() => setExpanded(i)}
              onLeave={() => setExpanded(null)}
            />
          </div>
        ))}
        {showBadge && (
          <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white px-3 py-1.5 shadow-sm">
            <Sparkles className="h-3 w-3 text-[#0D9488]" />
            <span className="text-[10px] font-medium text-[#52525B]">Gemma · Skill matrix ready</span>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
