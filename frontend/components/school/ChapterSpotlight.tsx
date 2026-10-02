"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SchoolChapter } from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";
import { ChapterArt } from "./ChapterArt";

type Props = {
  chapter: SchoolChapter | undefined;
  label?: string;
  detail?: string;
  className?: string;
  compact?: boolean;
};

export function ChapterSpotlight({ chapter, label = "Selected chapter", detail, className, compact = false }: Props) {
  return (
    <AnimatePresence mode="wait">
      {chapter ? (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative flex items-center gap-4 overflow-hidden rounded-[20px] border border-accent/25 bg-gradient-to-br from-[#0d2224] via-[#0a1618] to-[#071012] text-white",
            compact ? "p-3" : "p-4",
            className
          )}
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(45,212,191,0.35)_1px,transparent_1px)] [background-size:16px_16px]"
          />
          <ChapterArt
            chapterId={chapter.id}
            subject={chapter.subject}
            alt=""
            active
            className={cn("relative shrink-0", compact ? "w-16" : "w-24")}
            sizes="96px"
          />
          <div className="relative min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-light">{label}</p>
            <p className={cn("mt-0.5 font-heading font-bold leading-snug text-white", compact ? "text-sm" : "text-base")}>
              Ch {chapter.number}: {chapter.name}
            </p>
            <p className="mt-0.5 text-xs text-white/65">{detail ?? chapter.unit}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
