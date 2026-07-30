"use client";

import { cn } from "@/lib/utils";

export function MapBackground({ className, variant = "default" }: { className?: string; variant?: "default" | "hero" | "dark" }) {
  const gridColor = variant === "dark" ? "#ffffff08" : "#C4B5A012";
  const lineColor = variant === "dark" ? "#ffffff15" : "#0D948812";

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* Parchment base */}
      <div
        className={cn(
          "absolute inset-0",
          variant === "dark"
            ? "bg-[#1a1a1c]"
            : "bg-[linear-gradient(165deg,#FAF7F0_0%,#F3EDE2_45%,#EDE6D8_100%)]"
        )}
      />

      {/* Coordinate grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: variant === "hero" ? "48px 48px" : "72px 72px",
        }}
      />

      {/* Topographic contour lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" preserveAspectRatio="none">
        <path
          d="M-50 120 Q200 80 450 130 T950 100"
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeDasharray="8 12"
        />
        <path
          d="M-80 280 Q180 240 420 290 T920 260"
          fill="none"
          stroke={lineColor}
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <path
          d="M-30 440 Q220 400 500 450 T1000 420"
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeDasharray="8 12"
        />
        <path
          d="M0 600 Q250 560 550 610 T1100 580"
          fill="none"
          stroke={lineColor}
          strokeWidth="1"
          strokeDasharray="6 10"
        />
      </svg>

      {/* Compass rose — top right on hero */}
      {variant === "hero" && (
        <div className="absolute right-8 top-24 hidden opacity-40 lg:block">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#0D9488" strokeWidth="1" strokeDasharray="4 4" />
            <polygon points="32,8 36,28 32,24 28,28" fill="#0D9488" />
            <polygon points="32,56 36,36 32,40 28,36" fill="#18181B" opacity="0.4" />
            <text x="32" y="6" textAnchor="middle" className="fill-[#71717A] text-[8px] font-bold">
              N
            </text>
          </svg>
        </div>
      )}

      {/* Scale bar */}
      {variant !== "dark" && (
        <div className="absolute bottom-8 right-8 hidden items-end gap-2 opacity-35 md:flex">
          <div className="flex flex-col items-center gap-1">
            <div className="h-0.5 w-16 bg-[#71717A]" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">Career km</span>
          </div>
        </div>
      )}
    </div>
  );
}
