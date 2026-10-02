"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { chapterArt } from "@/lib/school/visuals";
import type { SchoolSubject } from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";

const PARTICLES = [
  { left: "18%", delay: 0, size: 4 },
  { left: "72%", delay: 1.4, size: 3 },
  { left: "46%", delay: 2.6, size: 5 },
  { left: "86%", delay: 3.3, size: 3 },
];

type Props = {
  chapterId: string;
  subject?: SchoolSubject;
  alt: string;
  className?: string;
  /** Stronger glow and particles, used for the chapter the student has selected. */
  active?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function ChapterArt({ chapterId, subject, alt, className, active = false, priority, sizes = "160px" }: Props) {
  const reduce = useReducedMotion();
  const float = reduce ? undefined : { y: [0, -6, 0] };

  return (
    <div className={cn("pointer-events-none relative aspect-square select-none", className)}>
      <motion.div
        aria-hidden
        className="absolute inset-[14%] rounded-full bg-accent-light/30 blur-2xl"
        animate={reduce ? undefined : { opacity: active ? [0.55, 0.95, 0.55] : [0.3, 0.55, 0.3], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: active ? 2.6 : 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        animate={float}
        transition={{ duration: active ? 3.2 : 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={chapterArt(chapterId, subject)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
          style={{
            maskImage: "radial-gradient(closest-side, #000 64%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 64%, transparent 100%)",
          }}
        />
      </motion.div>
      {!reduce ? (
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {PARTICLES.slice(0, active ? 4 : 2).map((p) => (
            <motion.span
              key={p.left}
              className="absolute bottom-[12%] rounded-full bg-accent-light shadow-[0_0_8px_rgba(45,212,191,0.9)]"
              style={{ left: p.left, width: p.size, height: p.size }}
              animate={{ y: [0, -70], opacity: [0, 1, 0] }}
              transition={{ duration: 4, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
