"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { FloatingGeometryBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { INTERNSHIP_CARDS } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function InternshipSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const grid = gridRef.current;
    if (!grid) return;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 80, rotateX: -15, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 70%",
            once: true,
          },
        }
      );
    });
  }, [reduceMotion]);

  return (
    <SectionLayout milestone={milestone} background={<FloatingGeometryBg />}>
      <div
        ref={gridRef}
        className="mx-auto grid w-full max-w-lg gap-4"
        style={{ perspective: "1000px" }}
      >
        {INTERNSHIP_CARDS.map((card, i) => (
          <div
            key={card.company}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={cn(
              "cursor-default rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-[0_6px_28px_rgba(24,24,27,0.06)] transition-all duration-300",
              expanded === i && "border-[#0D9488]/30 shadow-[0_12px_40px_rgba(13,148,136,0.12)]"
            )}
            style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
            onMouseEnter={() => setExpanded(i)}
            onMouseLeave={() => setExpanded(null)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-lg font-bold text-[#18181B]">{card.company}</p>
                <p className="mt-0.5 text-sm text-[#71717A]">{card.role}</p>
              </div>
              <div className="rounded-full bg-[#0D9488]/10 px-3 py-1">
                <span className="text-sm font-bold tabular-nums text-[#0D9488]">{card.match}%</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#71717A]">
              <span>{card.salary}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {card.location}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.skills.map((s) => (
                <span key={s} className="rounded-md bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-medium text-[#52525B]">
                  {s}
                </span>
              ))}
            </div>
            {expanded === i && (
              <div className="mt-4 flex items-start gap-2 border-t border-[#F4F4F5] pt-4">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0D9488]" />
                <p className="text-xs leading-relaxed text-[#52525B]">{card.reason}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
