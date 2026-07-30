"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroWorkspace } from "@/components/landing/HeroWorkspace";
import { CanvasSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GEMMA_VERSION } from "@/lib/gemma";

const AnimatedGrid = dynamic(
  () => import("@/components/landing/AnimatedGrid").then((m) => m.AnimatedGrid),
  { ssr: false, loading: () => <CanvasSkeleton /> }
);

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  function scrollToFeatures() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }

  const fadeUp = reduceMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden px-6 py-24 lg:px-8">
      <AnimatedGrid />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div {...fadeUp}>
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-secondary"
          >
            AI-Powered Career Intelligence
          </motion.span>

          <h1 className="font-heading mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-foreground-heading md:text-5xl lg:text-[3.25rem]">
            Your Career deserves an{" "}
            <span className="text-gradient">AI Copilot.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground">
            Assess your skills with adaptive AI, refine your resume for ATS, practice interviews,
            and discover internships matched to your profile — all powered by {GEMMA_VERSION}.
          </p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/assessment">
              <Button variant="accent" size="lg" className="h-[52px] gap-2 px-8 text-base">
                Start Assessment <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="h-[52px] gap-2 px-8 text-base"
              onClick={scrollToFeatures}
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <HeroWorkspace />
        </motion.div>
      </div>
    </section>
  );
}
