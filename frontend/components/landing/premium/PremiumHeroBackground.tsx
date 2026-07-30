"use client";

export function PremiumHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft radial lighting — both sides */}
      <div className="absolute -left-[15%] top-[5%] h-[75%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.035)_0%,transparent_68%)]" />
      <div className="absolute -right-[8%] top-[8%] h-[65%] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.045)_0%,transparent_70%)]" />

      {/* Faint contour lines — span full width */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035]" preserveAspectRatio="none">
        <path
          d="M-40 160 Q 280 120 620 180 T 1200 140"
          fill="none"
          stroke="#18181B"
          strokeWidth="1"
        />
        <path
          d="M-60 340 Q 300 300 640 360 T 1220 320"
          fill="none"
          stroke="#18181B"
          strokeWidth="1"
        />
        <path
          d="M-20 480 Q 340 440 680 500 T 1240 460"
          fill="none"
          stroke="#18181B"
          strokeWidth="1"
        />
      </svg>

      {/* Coordinate rings — right column only */}
      <div className="absolute right-[6%] top-[12%] hidden h-52 w-52 rounded-full border border-[#18181B]/[0.04] lg:block" />
      <div className="absolute right-[8%] top-[14%] hidden h-40 w-40 rounded-full border border-[#18181B]/[0.03] lg:block" />

      {/* Sparse dots — right half only */}
      <svg className="absolute inset-0 hidden h-full w-full opacity-[0.05] lg:block">
        {[
          [620, 120], [660, 200], [700, 280], [580, 340], [740, 160],
          [780, 380], [560, 220], [600, 400], [680, 440], [720, 100],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill="#18181B" />
        ))}
      </svg>
    </div>
  );
}
