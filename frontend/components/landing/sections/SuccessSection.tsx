"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { MagneticButton } from "@/components/landing/journey/MagneticButton";
import type { JourneyMilestone } from "@/lib/journey-milestones";

gsap.registerPlugin(ScrollTrigger);

export function SuccessSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const ring = ringRef.current;
    if (!section || !ring || reduceMotion) return;

    const len = 2 * Math.PI * 60;
    ring.style.strokeDasharray = `${len}`;
    ring.style.strokeDashoffset = `${len}`;

    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(ring, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power3.out",
        });
      },
    });
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id={milestone.sectionId}
      data-milestone={milestone.id}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-white px-6 py-24 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.04)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <div className="relative mx-auto mb-8 h-[140px] w-[140px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#F4F4F5" strokeWidth="3" />
            <circle
              ref={ringRef}
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#0D9488"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <CheckCircle2 className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-[#0D9488]" />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
          {milestone.label}
        </p>
        <h2 className="font-heading mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.02em] text-[#18181B]">
          {milestone.headline}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[#71717A]">{milestone.body}</p>

        <div className="mt-10">
          <MagneticButton href="/signup" variant="primary">
            Create free account <ArrowRight className="ml-2 h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
