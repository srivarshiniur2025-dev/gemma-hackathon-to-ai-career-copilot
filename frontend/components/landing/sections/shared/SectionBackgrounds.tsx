"use client";

export function DotMatrixBg() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg className="h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#18181B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

export function RouteLinesBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="h-full w-full opacity-[0.035]">
        <path d="M 40 0 V 800" stroke="#0D9488" strokeWidth="1" strokeDasharray="4 8" />
        <path d="M 120 0 V 800" stroke="#18181B" strokeWidth="0.75" strokeDasharray="2 10" />
        <path d="M 0 120 Q 400 80 800 120" fill="none" stroke="#18181B" strokeWidth="1" />
        <path d="M 0 320 Q 400 280 800 320" fill="none" stroke="#0D9488" strokeWidth="0.75" />
      </svg>
    </div>
  );
}

export function FloatingGeometryBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute right-[10%] top-[15%] h-32 w-32 rotate-12 rounded-3xl border border-[#18181B]/[0.04]" />
      <div className="absolute right-[25%] top-[45%] h-20 w-20 -rotate-6 rounded-2xl border border-[#0D9488]/[0.05]" />
      <div className="absolute right-[5%] bottom-[20%] h-24 w-24 rotate-45 rounded-full border border-[#18181B]/[0.03]" />
    </div>
  );
}

export function PaperTextureBg() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,244,245,0.5)_0%,transparent_40%)]" />
      <svg className="h-full w-full opacity-[0.03]">
        <defs>
          <pattern id="paper" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" stroke="#18181B" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paper)" />
      </svg>
    </div>
  );
}

export function WavePatternBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="h-full w-full opacity-[0.04]">
        {[80, 160, 240].map((y, i) => (
          <path
            key={i}
            d={`M0 ${y} Q200 ${y - 20} 400 ${y} T800 ${y}`}
            fill="none"
            stroke={i % 2 ? "#0D9488" : "#18181B"}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

export function TechnicalGridBg() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg className="h-full w-full opacity-[0.035]">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0 V48 H0" fill="none" stroke="#18181B" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
