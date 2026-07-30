"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { GraduationPinIcon } from "./GraduationPinIcon";

export const CAREER_MAP_STOPS = [
  { id: "hero", label: "Start", emoji: "🎓" },
  { id: "features", label: "Explore", emoji: "📍" },
  { id: "how-it-works", label: "Route", emoji: "🛤️" },
  { id: "why-gemma", label: "Engine", emoji: "⚡" },
  { id: "testimonials", label: "Stories", emoji: "⭐" },
  { id: "faq", label: "Guide", emoji: "📖" },
  { id: "cta", label: "Destination", emoji: "🏁" },
] as const;

const PATH_D = "M 20 24 C 20 80, 36 120, 20 160 C 4 200, 36 240, 20 280 C 4 320, 36 360, 20 400 C 4 440, 36 480, 20 520 C 4 560, 36 600, 20 640 C 4 680, 36 720, 20 760 C 4 800, 36 840, 20 880 C 4 920, 36 960, 20 1000";

export function CareerMapNavigator() {
  const reduceMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [pin, setPin] = useState({ x: 20, y: 24 });
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const mobilePinLeft = useTransform(smoothProgress, (v) => `${v * 100}%`);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  useMotionValueEvent(smoothProgress, "change", (v) => {
    if (!pathRef.current || !pathLen) return;
    const pt = pathRef.current.getPointAtLength(v * pathLen);
    setPin({ x: pt.x, y: pt.y });
  });

  if (reduceMotion) {
    return <CareerMapNavigatorStatic />;
  }

  return (
    <>
      {/* Desktop — winding route + moving pin */}
      <div
        className="pointer-events-none fixed left-3 top-0 z-40 hidden h-[100vh] w-12 xl:left-5 xl:block"
        aria-hidden
      >
        <svg
          viewBox="0 0 40 1024"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full overflow-visible"
        >
          <path
            ref={pathRef}
            d={PATH_D}
            fill="none"
            stroke="#E4E4E7"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <motion.path
            d={PATH_D}
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              pathLength: smoothProgress,
              strokeDasharray: "1 1",
            }}
          />
          <motion.g
            style={{ x: pin.x - 20, y: pin.y - 52 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <foreignObject x="-14" y="-8" width="56" height="72">
              <GraduationPinIcon size={36} />
            </foreignObject>
          </motion.g>
        </svg>

        {/* Stop labels */}
        {CAREER_MAP_STOPS.map((stop, i) => {
          const pct = i / (CAREER_MAP_STOPS.length - 1);
          return (
            <StopLabel key={stop.id} stop={stop} top={`${pct * 88 + 6}%`} scrollYProgress={scrollYProgress} threshold={pct} />
          );
        })}
      </div>

      {/* Mobile — route progress bar */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 xl:hidden" aria-hidden>
        <div className="relative h-1.5 bg-border/60">
          <motion.div className="h-full origin-left bg-accent" style={{ scaleX: smoothProgress }} />
        </div>
        <motion.div
          className="absolute -top-8"
          style={{ left: mobilePinLeft, x: "-50%" }}
        >
          <GraduationPinIcon size={28} />
        </motion.div>
      </div>
    </>
  );
}

function StopLabel({
  stop,
  top,
  scrollYProgress,
  threshold,
}: {
  stop: (typeof CAREER_MAP_STOPS)[number];
  top: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  threshold: number;
}) {
  const [active, setActive] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(v >= threshold - 0.04);
  });

  return (
    <div
      className="absolute left-10 flex items-center gap-1.5 transition-opacity duration-300"
      style={{ top, opacity: active ? 1 : 0.35 }}
    >
      <span className="text-[10px]">{stop.emoji}</span>
      <span
        className={cn(
          "whitespace-nowrap text-[9px] font-bold uppercase tracking-wider",
          active ? "text-accent" : "text-muted"
        )}
      >
        {stop.label}
      </span>
    </div>
  );
}

function CareerMapNavigatorStatic() {
  return (
    <div className="pointer-events-none fixed left-4 top-0 z-30 hidden h-full w-10 xl:block" aria-hidden>
      <div className="relative mx-auto h-full w-px bg-border/60">
        {CAREER_MAP_STOPS.map((m, i) => (
          <div
            key={m.id}
            className="absolute -left-[5px] flex items-center gap-2"
            style={{ top: `${(i / (CAREER_MAP_STOPS.length - 1)) * 92 + 4}%` }}
          >
            <div className="h-2.5 w-2.5 rounded-full border-2 border-white bg-accent shadow-sm" />
            <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-muted">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Re-export for section wrappers */
export function CareerSection({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-map-stop={id} className={cn("relative", className)}>
      {children}
    </section>
  );
}
