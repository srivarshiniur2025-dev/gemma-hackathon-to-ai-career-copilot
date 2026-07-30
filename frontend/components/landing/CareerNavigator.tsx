"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCareerRoute } from "@/contexts/CareerRouteContext";
import {
  CAREER_MILESTONES,
  MILESTONE_ANCHORS,
  ROUTE_PATH_D,
} from "@/lib/career-route";
import { cn } from "@/lib/utils";

function StudentPin({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="none"
      className={cn("drop-shadow-[0_2px_8px_rgba(24,24,27,0.12)]", className)}
      aria-hidden
    >
      <path
        d="M14 34C14 34 3 22 3 12.5C3 6.87 7.87 2 13.5 2C19.13 2 24 6.87 24 12.5C24 22 14 34 14 34Z"
        fill="#18181B"
        stroke="#E4E4E7"
        strokeWidth="0.75"
      />
      <circle cx="14" cy="12" r="3.5" fill="#0D9488" />
    </svg>
  );
}

type CareerNavigatorProps = {
  className?: string;
  sticky?: boolean;
};

export function CareerNavigator({ className, sticky = false }: CareerNavigatorProps) {
  const reduceMotion = useReducedMotion();
  const { progress, smoothProgress, introComplete, hoveredId, setHoveredId } = useCareerRoute();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [pin, setPin] = useState(MILESTONE_ANCHORS[0]);
  const [introProgress, setIntroProgress] = useState(reduceMotion ? 1 : 0);
  const [pinDropped, setPinDropped] = useState(!!reduceMotion);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  /* Intro: route draws, then pin drops */
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setIntroProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPinDropped(true), 200);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  /* Pin follows scroll (after intro) */
  useMotionValueEvent(smoothProgress, "change", (v) => {
    if (!pathRef.current || !pathLen || !introComplete) return;
    const pt = pathRef.current.getPointAtLength(v * pathLen);
    setPin({ x: pt.x, y: pt.y });
  });

  const routeFill = introComplete ? progress : introProgress;
  const displayProgress = introComplete ? progress : introProgress * 0.12;
  const strokeOffset = pathLen > 0 ? pathLen * (1 - routeFill) : 0;
  const activeIndex = Math.min(
    CAREER_MILESTONES.length - 1,
    Math.floor(displayProgress * CAREER_MILESTONES.length * 1.05)
  );

  const cameraX = useTransform(smoothProgress, [0, 0.15], [8, 0]);
  const cameraY = useTransform(smoothProgress, [0, 0.15], [-6, 0]);

  return (
    <div className={cn(sticky && "lg:sticky lg:top-28 lg:self-start", className)}>
      <motion.div
        style={introComplete ? undefined : { x: cameraX, y: cameraY }}
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white shadow-[0_1px_2px_rgba(24,24,27,0.04),0_24px_48px_rgba(24,24,27,0.06)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F4F4F5] px-5 py-3.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A1A1AA]">
              Career Navigator
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#52525B]">Live route · Gemma 4</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9488] opacity-30" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0D9488]" />
            </span>
            <span className="text-[10px] font-medium text-[#71717A]">Active</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative bg-[#FAFAFA] px-4 py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #18181B 1px, transparent 1px), linear-gradient(to bottom, #18181B 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <svg
            viewBox="0 0 336 520"
            className="mx-auto h-auto w-full max-w-[320px]"
            aria-label="Career route navigator"
          >
            <defs>
              <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base path */}
            <path
              ref={pathRef}
              d={ROUTE_PATH_D}
              fill="none"
              stroke="#E4E4E7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Filled progress path */}
            {pathLen > 0 && (
              <path
                d={ROUTE_PATH_D}
                fill="none"
                stroke="#0D9488"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={pathLen}
                strokeDashoffset={strokeOffset}
                filter="url(#route-glow)"
                style={{ opacity: 0.85 }}
              />
            )}

            {/* Hover section glow */}
            {hoveredId && pathLen > 0 && (
              <HoverPathGlow
                pathRef={pathRef}
                pathLen={pathLen}
                milestoneIndex={CAREER_MILESTONES.findIndex((m) => m.id === hoveredId)}
              />
            )}

            {/* Traveling dots */}
            {!reduceMotion &&
              [0, 1, 2].map((i) => (
                <circle key={i} r="1.5" fill="#0D9488" opacity="0.35">
                  <animateMotion
                    dur={`${5 + i * 1.5}s`}
                    repeatCount="indefinite"
                    path={ROUTE_PATH_D}
                    begin={`${i * 1.2}s`}
                  />
                </circle>
              ))}

            {/* Pin */}
            <g
              transform={`translate(${pin.x - 14}, ${pin.y - (pinDropped ? 36 : 52)})`}
              style={{ transition: pinDropped ? "transform 0.6s cubic-bezier(0.22,1,0.36,1)" : undefined }}
            >
              {!pinDropped && !reduceMotion ? (
                <motion.g
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22, delay: 1.2 }}
                >
                  <StudentPin />
                </motion.g>
              ) : (
                <motion.g
                  animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <StudentPin />
                </motion.g>
              )}
            </g>
          </svg>

          {/* Milestone nodes — HTML overlay for hover tooltips */}
          <div className="pointer-events-none absolute inset-0 px-4 py-6">
            <div className="relative mx-auto h-full max-w-[320px]">
              {CAREER_MILESTONES.map((m, i) => {
                const anchor = MILESTONE_ANCHORS[i];
                const leftPct = (anchor.x / 336) * 100;
                const topPct = (anchor.y / 520) * 100;
                const isActive = i <= activeIndex;
                const isCurrent = i === activeIndex;
                const isHovered = hoveredId === m.id;
                const Icon = m.icon;

                return (
                  <div
                    key={m.id}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.06 : isCurrent ? 1.04 : 1,
                        opacity: isActive ? 1 : 0.45,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className={cn(
                        "relative flex h-10 w-10 cursor-default items-center justify-center rounded-xl border bg-white transition-shadow",
                        isCurrent
                          ? "border-[#0D9488]/40 shadow-[0_0_0_4px_rgba(13,148,136,0.08),0_4px_12px_rgba(24,24,27,0.08)]"
                          : "border-[#E4E4E7] shadow-[0_1px_3px_rgba(24,24,27,0.06)]",
                        isHovered && "border-[#0D9488]/30 shadow-[0_8px_24px_rgba(24,24,27,0.1)]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive ? "text-[#18181B]" : "text-[#A1A1AA]"
                        )}
                        strokeWidth={1.5}
                      />
                      {isCurrent && !reduceMotion && (
                        <motion.span
                          className="absolute inset-0 rounded-xl border border-[#0D9488]/30"
                          animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Label — fades when pin approaches */}
                    <motion.span
                      animate={{ opacity: isActive || isHovered ? 1 : 0.35 }}
                      className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium tracking-wide text-[#71717A]"
                    >
                      {m.label}
                    </motion.span>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: 8, scale: 0.96 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-full top-1/2 z-20 ml-3 w-44 -translate-y-1/2 rounded-xl border border-[#E4E4E7] bg-white p-3 shadow-[0_8px_30px_rgba(24,24,27,0.1)]"
                        >
                          <p className="text-xs font-semibold text-[#18181B]">{m.label}</p>
                          <p className="mt-1 text-[10px] text-[#71717A]">{m.duration}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.skills.map((s) => (
                              <span
                                key={s}
                                className="rounded-md bg-[#F4F4F5] px-1.5 py-0.5 text-[9px] font-medium text-[#52525B]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2.5">
                            <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                              <span>Progress</span>
                              <span>{m.progress}%</span>
                            </div>
                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#F4F4F5]">
                              <div
                                className="h-full rounded-full bg-[#0D9488]"
                                style={{ width: `${m.progress}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer progress */}
        <div className="border-t border-[#F4F4F5] px-5 py-3">
          <div className="flex items-center justify-between text-[10px] font-medium text-[#A1A1AA]">
            <span>Route progress</span>
            <span className="tabular-nums text-[#52525B]">
              {Math.round(displayProgress * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F4F4F5]">
            <motion.div
              className="h-full rounded-full bg-[#0D9488]"
              style={{ width: `${displayProgress * 100}%` }}
              layout
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HoverPathGlow({
  pathRef,
  pathLen,
  milestoneIndex,
}: {
  pathRef: React.RefObject<SVGPathElement | null>;
  pathLen: number;
  milestoneIndex: number;
}) {
  if (milestoneIndex < 0 || !pathRef.current) return null;
  const segmentStart = (milestoneIndex / CAREER_MILESTONES.length) * pathLen;
  const segmentEnd = ((milestoneIndex + 1) / CAREER_MILESTONES.length) * pathLen;

  return (
    <path
      d={ROUTE_PATH_D}
      fill="none"
      stroke="#0D9488"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray={`${segmentEnd - segmentStart} ${pathLen}`}
      strokeDashoffset={-segmentStart}
      opacity="0.12"
    />
  );
}
