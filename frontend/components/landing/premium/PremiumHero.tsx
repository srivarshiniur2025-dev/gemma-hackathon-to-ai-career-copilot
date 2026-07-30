"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { PremiumHeroBackground } from "@/components/landing/premium/PremiumHeroBackground";
import { CareerJourneyIllustration } from "@/components/landing/premium/CareerJourneyIllustration";
import { MagneticButton } from "@/components/landing/journey/MagneticButton";
import { HERO_METRICS } from "@/lib/hero-journey";
import { GEMMA_VERSION } from "@/lib/gemma";

const EASE = [0.22, 1, 0.36, 1] as const;

const METRIC_ICONS = {
  sparkles: Sparkles,
  target: Target,
  users: Users,
  chart: BarChart3,
};

export function PremiumHero() {
  const reduceMotion = useReducedMotion();

  function scrollToJourney() {
    document.getElementById("journey-assessment")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="journey-hero"
      className="relative overflow-hidden bg-white pt-28 lg:pt-32"
    >
      <PremiumHeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 lg:px-8 lg:pb-14">
        {/* Main row — strict two-column grid, no absolute overlap */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:gap-4 xl:gap-8">
          {/* LEFT — copy */}
          <div className="relative z-20 min-w-0 lg:max-w-xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] px-3.5 py-1.5"
            >
              <Sparkles className="h-3 w-3 text-[#0D9488]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
                {GEMMA_VERSION} · Autonomous career navigation
              </span>
            </motion.div>

            <div className="mt-8 overflow-hidden">
              <motion.h1
                initial={reduceMotion ? false : { y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
                className="font-heading text-[clamp(2.25rem,5vw,3.65rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#18181B]"
              >
                Navigate your career with{" "}
                <span className="text-[#0D9488]">precision</span>.
              </motion.h1>
            </div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.65, ease: EASE }}
              className="mt-6 max-w-md text-lg leading-[1.65] text-[#71717A]"
            >
              An autonomous AI navigator that maps your unique journey from skill assessment to your
              dream offer.
            </motion.p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.55, ease: EASE }}
              >
                <MagneticButton href="/assessment" variant="primary">
                  Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </MagneticButton>
              </motion.div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58, duration: 0.55, ease: EASE }}
              >
                <MagneticButton variant="ghost" onClick={scrollToJourney}>
                  <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                  Explore the Journey
                </MagneticButton>
              </motion.div>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mt-12 flex items-center gap-2 text-xs text-[#A1A1AA]"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Scroll to navigate your journey
            </motion.div>
          </div>

          {/* RIGHT — journey map, contained in its column */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative hidden min-w-0 lg:block"
          >
            <div className="relative mx-auto aspect-[480/520] w-full max-w-[540px]">
              <CareerJourneyIllustration />
            </div>
          </motion.div>
        </div>

        {/* Mobile map */}
        <div className="relative mx-auto mt-12 aspect-[480/520] w-full max-w-md lg:hidden">
          <CareerJourneyIllustration />
        </div>

        {/* Metrics — own row, never overlaps map */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: EASE }}
          className="relative z-20 mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#E4E4E7] bg-[#E4E4E7] lg:mt-16 lg:grid-cols-4"
        >
          {HERO_METRICS.map((m) => {
            const Icon = METRIC_ICONS[m.icon];
            return (
              <div
                key={m.label}
                className="group flex items-center gap-3 bg-[#F4F4F5] px-4 py-4 transition-colors hover:bg-white sm:gap-4 sm:px-6 sm:py-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E4E4E7] bg-white sm:h-10 sm:w-10">
                  <Icon className="h-[16px] w-[16px] text-[#0D9488] sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-medium uppercase tracking-wider text-[#A1A1AA] sm:text-[10px]">
                    {m.label}
                  </p>
                  <p className="font-heading truncate text-sm font-bold tabular-nums text-[#18181B] sm:text-base lg:text-lg">
                    {m.value}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
