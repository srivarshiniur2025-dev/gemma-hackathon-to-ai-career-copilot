"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  Flame,
  Mic,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cells = [
  {
    id: "score",
    className: "col-span-2 row-span-2",
    gradient: "from-[#2563EB] to-[#1D4ED8]",
    icon: Target,
    label: "Skill Score",
    value: "92%",
    sub: "Gemma assessed",
    chart: true,
  },
  {
    id: "streak",
    className: "col-span-1 row-span-1",
    gradient: "from-[#18181B] to-[#27272A]",
    icon: Flame,
    label: "Streak",
    value: "12",
    sub: "days",
  },
  {
    id: "intern",
    className: "col-span-1 row-span-1",
    gradient: "from-[#312E81] to-[#1E1B4B]",
    icon: Briefcase,
    label: "Matches",
    value: "24",
    sub: "verified",
  },
  {
    id: "interview",
    className: "col-span-1 row-span-1",
    gradient: "from-[#10B981] to-[#059669]",
    icon: Mic,
    label: "Interview",
    value: "85%",
    sub: "mock score",
  },
  {
    id: "safe",
    className: "col-span-1 row-span-1",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    icon: Shield,
    label: "Scam filter",
    value: "100%",
    sub: "protected",
  },
  {
    id: "growth",
    className: "col-span-2 row-span-1",
    gradient: "from-white to-[#F4F4F5]",
    icon: TrendingUp,
    label: "Career trajectory",
    value: "Intern → SDE",
    sub: "Gemma predicted path",
    light: true,
  },
];

function MiniBars() {
  return (
    <div className="mt-3 flex h-12 items-end gap-1">
      {[40, 65, 55, 80, 72, 92].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-white/40"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
        />
      ))}
    </div>
  );
}

export function HeroBentoGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[28px] border border-border/80 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,0.1)]"
      >
        <div className="mb-3 flex items-center gap-2 border-b border-border/60 px-2 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-2 flex items-center gap-1 text-[10px] font-medium text-muted">
            <Sparkles className="h-3 w-3 text-accent" />
            AI Career Copilot
          </span>
        </div>

        <div className="grid grid-cols-3 grid-rows-4 gap-2.5 auto-rows-[minmax(72px,auto)]">
          {cells.map((cell, i) => {
            const Icon = cell.icon;
            const light = cell.light;
            return (
              <motion.div
                key={cell.id}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.45 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  "relative overflow-hidden rounded-[18px] p-4 transition-shadow hover:shadow-lg",
                  cell.className,
                  light
                    ? "border border-border text-foreground-heading"
                    : `bg-gradient-to-br ${cell.gradient} text-white`
                )}
              >
                {!light && (
                  <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                )}
                <div className="relative flex items-start justify-between">
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        light ? "text-muted" : "text-white/70"
                      )}
                    >
                      {cell.label}
                    </p>
                    <p className="mt-1 text-xl font-extrabold tracking-tight">{cell.value}</p>
                    <p className={cn("text-[10px]", light ? "text-muted" : "text-white/60")}>
                      {cell.sub}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      light ? "bg-accent/10" : "bg-white/15"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", light ? "text-accent" : "text-white")} />
                  </div>
                </div>
                {cell.chart && <MiniBars />}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 shadow-lg"
      >
        <BarChart3 className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold">Live progress tracking</span>
      </motion.div>
    </div>
  );
}
