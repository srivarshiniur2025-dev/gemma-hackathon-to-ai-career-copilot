"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const TIPS = [
  "Reading your chapter's syllabus topics…",
  "Matching the NCERT book for your class…",
  "Skipping topics that are not in this year's exam…",
  "Tip: saying an answer out loud helps you remember it.",
  "Writing explanations a 14-year-old can follow…",
  "Tip: short daily practice beats one long session.",
  "Double-checking answers and options…",
];

export function GemmaWaiting({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const tip = TIPS[Math.floor(seconds / 4) % TIPS.length];

  return (
    <div className="rounded-2xl border border-accent/25 bg-white/80 p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent-hover"
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground-heading">
            {label} <span className="font-normal text-muted">· {seconds}s</span>
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={tip}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="truncate text-xs text-muted"
            >
              {seconds > 45 ? "Almost there — detailed answers take a little longer." : tip}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent/10">
        <motion.div
          className="h-full w-1/3 rounded-full bg-accent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
