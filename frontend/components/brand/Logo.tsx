import Image from "next/image";
import { cn } from "@/lib/utils";
import { GEMMA_BADGE_LABEL } from "@/lib/gemma";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
};

const LOGO_ASPECT = 540 / 260;

const sizes = {
  sm: { height: 32, text: "text-sm", tagline: "text-[9px]", sub: "text-[9px]" },
  md: { height: 40, text: "text-base", tagline: "text-[10px]", sub: "text-[10px]" },
  lg: { height: 52, text: "text-xl", tagline: "text-xs", sub: "text-xs" },
};

const TAGLINE = "Assess · Learn · Build · Achieve";

function sparklePath(cx: number, cy: number, r: number) {
  const ir = r * 0.35;
  return [
    `M ${cx} ${cy - r}`,
    `L ${cx + ir} ${cy - ir}`,
    `L ${cx + r} ${cy}`,
    `L ${cx + ir} ${cy + ir}`,
    `L ${cx} ${cy + r}`,
    `L ${cx - ir} ${cy + ir}`,
    `L ${cx - r} ${cy}`,
    `L ${cx - ir} ${cy - ir}`,
    "Z",
  ].join(" ");
}

type LogoIconProps = {
  primary: string;
  accent: string;
  className?: string;
};

/** Brand mark — C + graduation cap + teal cursor arrow + AI sparkles */
export function LogoIcon({ primary, accent, className }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M9 14 L24 8 L37 14 L24 20 Z" fill={primary} />
      <path d="M18 20 L30 20 L28.5 22.5 L19.5 22.5 Z" fill={primary} />
      <path
        d="M35 14 C36.5 17 36.5 20 35.5 23"
        stroke={primary}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="35.5" cy="24" r="1.3" fill={primary} />
      <path
        d="M34 17 C34 12.5 30 9 24.5 9 C16.5 9 11 14.5 11 22 C11 29.5 16.5 35 24.5 35 C30 35 34 31.5 34 27"
        stroke={primary}
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M7 37 C7 37 9 30 15 26 C21 22 28 20.5 33.5 17.5"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M33.5 17.5 L38 16 L35.5 20.5 L33.5 17.5 Z" fill={accent} />
      <circle cx="7" cy="37" r="2" fill={accent} opacity="0.85" />
      <path d={sparklePath(21, 19, 2.2)} fill={accent} />
      <path d={sparklePath(26, 15.5, 1.6)} fill={accent} opacity="0.9" />
    </svg>
  );
}

function WordmarkStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="currentColor"
      className={cn("inline-block shrink-0", className)}
      aria-hidden
    >
      <path d="M6 0.5 L7 4 L10.5 4.5 L7.5 7 L8.5 10.5 L6 8.5 L3.5 10.5 L4.5 7 L1.5 4.5 L5 4 Z" />
    </svg>
  );
}

export function Logo({
  className,
  iconClassName,
  showWordmark = true,
  showTagline,
  size = "md",
  variant = "default",
}: LogoProps) {
  const s = sizes[size];
  const logoHeight = s.height;
  const logoWidth = Math.round(logoHeight * LOGO_ASPECT);
  const shouldShowTagline = showTagline ?? size === "lg";

  const primary =
    variant === "light" || variant === "dark" ? "#FFFFFF" : "#18181B";
  const accent = variant === "dark" ? "#FFFFFF" : "#0D9488";

  const wordPrimary =
    variant === "light" || variant === "dark"
      ? "text-white"
      : "text-foreground-heading";
  const taglineColor =
    variant === "light"
      ? "text-white/70"
      : variant === "dark"
        ? "text-white/80"
        : "text-muted-secondary";
  const subColor =
    variant === "light"
      ? "text-white/60"
      : variant === "dark"
        ? "text-white/70"
        : "text-muted-secondary";

  if (!showWordmark) {
    return (
      <div
        className={cn("relative shrink-0", iconClassName, className)}
        style={{ width: logoHeight, height: logoHeight }}
      >
        <LogoIcon primary={primary} accent={accent} className="h-full w-full" />
      </div>
    );
  }

  if (variant === "default") {
    return (
      <div className={cn("shrink-0", className)}>
        <Image
          src="/logo-career-copilot.png"
          alt="AI Career Copilot — Assess · Learn · Build · Achieve"
          width={logoWidth}
          height={logoHeight}
          className={cn("h-auto w-auto object-contain object-left", iconClassName)}
          style={{ height: logoHeight, width: logoWidth }}
          priority={size === "md"}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn("relative shrink-0", iconClassName)}
        style={{ width: logoHeight, height: logoHeight }}
      >
        <LogoIcon primary={primary} accent={accent} className="h-full w-full" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight", s.text)}>
          <span className={wordPrimary}>AI Career </span>
          <span className={variant === "dark" ? "text-white" : "text-accent"}>
            Copilot
          </span>
          <WordmarkStar
            className={cn(
              "ml-1 align-[-2px]",
              variant === "dark" ? "h-3 w-3 text-white" : "h-3 w-3 text-accent",
              size === "sm" && "h-2.5 w-2.5",
              size === "lg" && "h-3.5 w-3.5"
            )}
          />
        </span>
        {shouldShowTagline && (
          <span
            className={cn(
              "mt-1 font-medium tracking-wide",
              s.tagline,
              taglineColor
            )}
          >
            {TAGLINE}
          </span>
        )}
        <span
          className={cn(
            "mt-1 font-medium uppercase tracking-[0.12em]",
            s.sub,
            subColor
          )}
        >
          {GEMMA_BADGE_LABEL}
        </span>
      </div>
    </div>
  );
}
