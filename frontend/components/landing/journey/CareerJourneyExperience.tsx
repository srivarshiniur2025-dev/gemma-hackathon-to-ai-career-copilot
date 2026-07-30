"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { PremiumHero } from "@/components/landing/premium/PremiumHero";
import {
  JOURNEY_ANCHORS,
  JOURNEY_MILESTONES,
  JOURNEY_PATH_D,
  JOURNEY_VIEWBOX,
} from "@/lib/journey-milestones";

gsap.registerPlugin(ScrollTrigger);

const JourneySections = dynamic(
  () => import("@/components/landing/journey/JourneySections").then((m) => m.JourneySections),
  { ssr: false }
);

type PinState = { x: number; y: number; angle: number };

function ScrollNavigator({ rotation }: { rotation: number }) {
  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      <svg width="28" height="34" viewBox="0 0 32 40" fill="none" className="drop-shadow-sm">
        <path
          d="M16 38C16 38 4 26 4 13C4 7.5 9.5 2 16 2C22.5 2 28 7.5 28 13C28 26 16 38 16 38Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1"
        />
        <circle cx="16" cy="13" r="2.5" fill="#0D9488" />
      </svg>
    </div>
  );
}

export function CareerJourneyExperience() {
  const reduceMotion = useReducedMotion();
  const journeyRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [progress, setProgress] = useState(0);
  const [pathLen, setPathLen] = useState(0);
  const [pin, setPin] = useState<PinState>({ x: JOURNEY_ANCHORS[0].x, y: JOURNEY_ANCHORS[0].y, angle: 0 });

  useEffect(() => {
    const journey = journeyRef.current;
    const path = pathRef.current;
    if (!journey || !path) return;

    const len = path.getTotalLength();
    setPathLen(len);

    const applyProgress = (p: number) => {
      const pt = path.getPointAtLength(Math.max(0, Math.min(len, p * len)));
      const pt2 = path.getPointAtLength(Math.min(len, p * len + 2));
      const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI + 90;
      setPin({ x: pt.x, y: pt.y, angle });
      setProgress(p);
    };

    if (reduceMotion) {
      applyProgress(0);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: journey,
      start: "top bottom",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => applyProgress(self.progress),
    });

    return () => st.kill();
  }, [reduceMotion]);

  const pinLeft = `${(pin.x / JOURNEY_VIEWBOX.w) * 100}%`;
  const pinTop = `${(pin.y / JOURNEY_VIEWBOX.h) * 100}%`;
  const strokeOffset = pathLen ? pathLen * (1 - progress) : 0;

  return (
    <div id="career-journey" className="relative bg-white">
      <PremiumHero />

      <div ref={journeyRef} className="relative">
        <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block" aria-hidden>
          <div className="absolute inset-y-0 right-0 w-[52%]">
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${JOURNEY_VIEWBOX.w} ${JOURNEY_VIEWBOX.h}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <path ref={pathRef} d={JOURNEY_PATH_D} fill="none" stroke="#F4F4F5" strokeWidth="1" />
              {pathLen > 0 && (
                <path
                  d={JOURNEY_PATH_D}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeOpacity="0.35"
                  strokeDasharray={pathLen}
                  strokeDashoffset={strokeOffset}
                />
              )}
              {JOURNEY_ANCHORS.slice(1).map((a, i) => (
                <circle
                  key={i}
                  cx={a.x}
                  cy={a.y}
                  r="3"
                  fill="#FFFFFF"
                  stroke={
                    progress >= (JOURNEY_MILESTONES[i + 1]?.progress ?? 0) - 0.02
                      ? "#0D9488"
                      : "#E4E4E7"
                  }
                  strokeWidth="1"
                />
              ))}
            </svg>
            {progress > 0.02 && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: pinLeft, top: pinTop }}
              >
                <ScrollNavigator rotation={pin.angle} />
              </div>
            )}
          </div>
        </div>

        <JourneySections />
      </div>
    </div>
  );
}
