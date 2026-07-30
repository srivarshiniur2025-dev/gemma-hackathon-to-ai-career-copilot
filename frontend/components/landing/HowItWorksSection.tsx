"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { SectionReveal, SectionRevealItem, SectionRevealStagger } from "@/components/motion/SectionReveal";
import { steps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const stepColors = [
  "from-[#2563EB] to-[#1D4ED8]",
  "from-accent to-[#0F766E]",
  "from-[#8B5CF6] to-[#7C3AED]",
  "from-[#10B981] to-[#059669]",
  "from-[#FB923C] to-[#EA580C]",
  "from-[#18181B] to-[#27272A]",
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="below-fold-section border-t border-[#F4F4F5] bg-white py-28">
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal variant="slide-up" className="text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-accent">
            <Navigation className="h-4 w-4" />
            Route planner
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold md:text-5xl">
            Six waypoints. One journey.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Follow the dashed route from signup to offer letter — each waypoint unlocks the next on your map.
          </p>
        </SectionReveal>

        {/* Connecting route line — desktop */}
        <div className="pointer-events-none absolute left-1/2 top-[280px] hidden h-[calc(100%-320px)] w-px -translate-x-1/2 border-l border-dashed border-accent/25 lg:block" />

        <SectionRevealStagger className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {steps.map((s, i) => (
            <SectionRevealItem key={s.step} variant="rotate-in">
              <motion.div
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[24px] border border-[#0D9488]/15 bg-white/95 p-6 shadow-[0_8px_30px_rgba(13,148,136,0.06)] backdrop-blur-sm transition-shadow hover:shadow-[0_16px_48px_rgba(13,148,136,0.12)]"
              >
                {/* Waypoint pin */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    WP-{s.step}
                  </span>
                </div>

                <div
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
                    stepColors[i]
                  )}
                >
                  {s.step}
                </div>
                <h3 className="font-heading mt-5 text-lg font-bold text-foreground-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>

                {/* Route progress segment */}
                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDE6D8]">
                    <motion.div
                      className={cn("h-full rounded-full bg-gradient-to-r", stepColors[i])}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${((i + 1) / steps.length) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted">
                    {Math.round(((i + 1) / steps.length) * 100)}%
                  </span>
                </div>
              </motion.div>
            </SectionRevealItem>
          ))}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
