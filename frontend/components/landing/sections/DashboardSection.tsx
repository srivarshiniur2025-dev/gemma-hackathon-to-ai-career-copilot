"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { SectionLayout } from "@/components/landing/sections/shared/SectionLayout";
import { TechnicalGridBg } from "@/components/landing/sections/shared/SectionBackgrounds";
import { DASHBOARD_METRICS } from "@/lib/section-content";
import type { JourneyMilestone } from "@/lib/journey-milestones";

gsap.registerPlugin(ScrollTrigger);

function CircularProgress({ value, label }: { value: number; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#F4F4F5" strokeWidth="6" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#0D9488"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <text x="44" y="48" textAnchor="middle" className="fill-[#18181B] text-lg font-bold" fontSize="16">
          {value}%
        </text>
      </svg>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">{label}</p>
    </div>
  );
}

export function DashboardSection({ milestone }: { milestone: JourneyMilestone }) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [streak, setStreak] = useState(0);
  const [readiness, setReadiness] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const [radarData, setRadarData] = useState(DASHBOARD_METRICS.radar.map((d) => ({ ...d, value: 0 })));

  useEffect(() => {
    if (reduceMotion) {
      setStreak(DASHBOARD_METRICS.streak);
      setReadiness(DASHBOARD_METRICS.readiness);
      setLineWidth(100);
      setRadarData(DASHBOARD_METRICS.radar);
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const st = ScrollTrigger.create({
      trigger: panel,
      start: "top 68%",
      once: true,
      onEnter: () => {
        const streakObj = { val: 0 };
        gsap.to(streakObj, {
          val: DASHBOARD_METRICS.streak,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => setStreak(Math.round(streakObj.val)),
        });

        const readyObj = { val: 0 };
        gsap.to(readyObj, {
          val: DASHBOARD_METRICS.readiness,
          duration: 1.4,
          delay: 0.2,
          ease: "power2.out",
          onUpdate: () => setReadiness(Math.round(readyObj.val)),
        });

        const lineObj = { val: 0 };
        gsap.to(lineObj, {
          val: 100,
          duration: 1.6,
          delay: 0.3,
          ease: "power3.out",
          onUpdate: () => setLineWidth(Math.round(lineObj.val)),
        });

        DASHBOARD_METRICS.radar.forEach((d, i) => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: d.value,
            duration: 1,
            delay: 0.5 + i * 0.1,
            ease: "power2.out",
            onUpdate: () => {
              setRadarData((prev) => {
                const next = [...prev];
                next[i] = { ...d, value: Math.round(obj.val) };
                return next;
              });
            },
          });
        });
      },
    });

    return () => st.kill();
  }, [reduceMotion]);

  const maxWeekly = Math.max(...DASHBOARD_METRICS.weekly);

  return (
    <SectionLayout milestone={milestone} background={<TechnicalGridBg />}>
      <div ref={panelRef} className="mx-auto w-full max-w-lg rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-[0_8px_40px_rgba(24,24,27,0.07)]">
        <div className="grid grid-cols-3 gap-4 border-b border-[#F4F4F5] pb-5">
          <div className="text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-[#18181B]">{streak}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Day streak</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-[#18181B]">
              {DASHBOARD_METRICS.skillsTracked}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Skills tracked</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-[#18181B]">
              {DASHBOARD_METRICS.interviews}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Interviews</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-around">
          <CircularProgress value={readiness} label="Readiness" />
          <div className="h-[140px] w-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#E4E4E7" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: "#A1A1AA" }} />
                <Radar
                  dataKey="value"
                  stroke="#0D9488"
                  fill="#0D9488"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                  isAnimationActive={!reduceMotion}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">
            Weekly progress
          </p>
          <div className="flex h-16 items-end gap-2">
            {DASHBOARD_METRICS.weekly.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-[#0D9488] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    height: `${(v / maxWeekly) * 100 * (lineWidth / 100)}%`,
                    minHeight: lineWidth > 0 ? 4 : 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
