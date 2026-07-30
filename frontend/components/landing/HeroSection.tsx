"use client";

import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroAmbientLight } from "@/components/landing/HeroAmbientLight";
import { Button } from "@/components/ui/button";
import { GEMMA_VERSION } from "@/lib/gemma";

export function HeroContent() {
  const reduceMotion = useReducedMotion();

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white px-6 pb-20 pt-28 lg:px-0 lg:pb-28 lg:pt-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #18181B 1px, transparent 1px), linear-gradient(to bottom, #18181B 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
      <HeroAmbientLight />

      <div className="relative z-10 max-w-xl">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]"
        >
          {GEMMA_VERSION} · AI Career Copilot
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading mt-6 text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-[#18181B] md:text-5xl lg:text-[3.25rem]"
        >
          <span className="text-[#0D9488]">Navigate</span> your career with precision.
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.65 }}
          className="mt-6 text-lg leading-[1.65] text-[#71717A]"
        >
          AI Career Copilot maps a personalized journey from skill assessment to verified
          internships — every milestone powered by Gemma, every step visible on your route.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link href="/assessment">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-[#18181B] px-7 text-sm font-semibold shadow-none hover:bg-[#27272A]"
            >
              Start Assessment
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-[#E4E4E7] bg-white px-7 text-sm font-semibold text-[#18181B] shadow-none hover:bg-[#FAFAFA]"
            onClick={scrollToFeatures}
          >
            <Map className="mr-1 h-4 w-4" />
            View Career Map
          </Button>
        </motion.div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-xs leading-relaxed text-[#A1A1AA]"
        >
          Scroll to progress along your route · Hover milestones for details
        </motion.p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white lg:hidden"
        aria-hidden
      />
    </section>
  );
}

/** @deprecated use HeroContent + CareerNavigator layout in page.tsx */
export function HeroSection() {
  return <HeroContent />;
}
