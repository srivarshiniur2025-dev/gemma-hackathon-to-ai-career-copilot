"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  FileText,
  GraduationCap,
  Map,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const floatingCards = [
  { icon: FileText, label: "Resume", x: "8%", y: "12%", delay: 0 },
  { icon: Map, label: "Roadmap", x: "72%", y: "8%", delay: 0.15 },
  { icon: BarChart3, label: "Skills", x: "78%", y: "58%", delay: 0.25 },
  { icon: TrendingUp, label: "Growth", x: "4%", y: "62%", delay: 0.2 },
];

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square max-w-lg">
      <motion.div
        animate={{ rotate: [0, 1, 0, -1, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[18px] bg-background-secondary border border-border card-shadow-lg"
      />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-end justify-center gap-5">
          <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col items-center gap-2">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[14px] bg-white border border-border card-shadow">
              <GraduationCap className="h-9 w-9 text-muted-secondary" />
            </div>
            <span className="text-xs font-medium text-muted">Student</span>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-7 w-7 text-accent" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col items-center gap-2">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[14px] bg-primary text-white card-shadow-lg">
              <Bot className="h-9 w-9" />
            </div>
            <span className="text-xs font-medium text-muted">Gemma 4</span>
          </motion.div>
        </div>
      </motion.div>

      {floatingCards.map(({ icon: Icon, label, x, y, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay, duration: 0.5 },
            scale: { delay, duration: 0.5 },
            y: { duration: 3.5, repeat: Infinity, delay, ease: "easeInOut" },
          }}
          style={{ left: x, top: y }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="absolute flex items-center gap-2 rounded-[14px] border border-border bg-white px-3.5 py-2 card-shadow cursor-default"
        >
          <Icon className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-foreground-heading">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
