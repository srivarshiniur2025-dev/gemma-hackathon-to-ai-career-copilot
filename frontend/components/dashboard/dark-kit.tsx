"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, Search, Sparkles, Target } from "lucide-react";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { dashboardHeading } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const GLASS =
  "relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md";
export const TILE_LINK =
  "group flex h-full min-h-[210px] cursor-pointer flex-col p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent-light/40 hover:shadow-[0_18px_50px_rgba(13,148,136,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60";

export type Tone = "teal" | "amber" | "orange";

export function IconTile({ icon: Icon, tone = "teal" }: { icon: React.ElementType; tone?: Tone }) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
        tone === "teal" && "border-accent-light/30 bg-accent/15 text-accent-light",
        tone === "amber" && "border-amber-300/25 bg-amber-300/10 text-amber-300",
        tone === "orange" && "border-orange-400/25 bg-orange-400/10 text-orange-400"
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * 100, 34 - (v / max) * 28] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      {last ? <circle cx={last[0]} cy={last[1]} r="2.2" fill="#5EEAD4" /> : null}
    </svg>
  );
}

export function Bars({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-hidden>
      {values.map((v, i) => (
        <motion.span
          key={i}
          className={cn("w-3 rounded-t-md", v ? "bg-gradient-to-t from-accent/40 to-accent-light" : "bg-white/10")}
          initial={{ height: 4 }}
          animate={{ height: `${Math.max(12, (v / max) * 100)}%` }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease: EASE }}
        />
      ))}
    </div>
  );
}

export function HeroStat({ icon, tone, value, label, delay }: { icon: React.ElementType; tone: Tone; value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md"
    >
      <IconTile icon={icon} tone={tone} />
      <div>
        <p className="text-xl font-extrabold leading-none text-white">{value}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
      </div>
    </motion.div>
  );
}

export function MetricCard({ href, children, className, delay }: { href: string; children: React.ReactNode; className?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: EASE }}>
      <Link
        href={href}
        className={cn(
          GLASS,
          "group block h-full cursor-pointer p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent-light/40 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.15),0_18px_50px_rgba(13,148,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60",
          className
        )}
      >
        {children}
        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/40 transition-colors duration-200 group-hover:text-accent-light" />
      </Link>
    </motion.div>
  );
}

const WAVE_A = "M0 40 C 60 10, 120 60, 200 32 S 330 10, 400 30 L400 60 L0 60 Z";
const WAVE_B = "M0 34 C 70 50, 140 14, 210 38 S 320 52, 400 24 L400 60 L0 60 Z";

export function AccuracyCard({ href, value, caption, label = "Your accuracy", delay = 0.1 }: { href: string; value: number | null; caption: string; label?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <MetricCard href={href} delay={delay} className="border-accent-light/25 bg-gradient-to-br from-[#0F766E]/70 via-[#0B3E3B]/70 to-[#082624]/80">
      <div className="flex items-start gap-3">
        <IconTile icon={Target} />
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-semibold text-white/85">{label}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${value ?? 4}%` }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </div>
            <span className="text-2xl font-extrabold text-white">{value != null ? `${value}%` : "–%"}</span>
          </div>
          <p className="mt-2 text-xs text-white/70">{caption}</p>
        </div>
      </div>
      <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full opacity-40">
        <motion.path
          d={WAVE_A}
          fill="rgba(94,234,212,0.25)"
          animate={reduce ? undefined : { d: [WAVE_A, WAVE_B, WAVE_A] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </MetricCard>
  );
}

function SearchField({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cn("relative", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:border-accent-light/50 focus:outline-none"
      />
    </label>
  );
}

/** Page shell: glow backdrop, sticky header with search, and a centred content column. */
export function DarkShell({
  query,
  onQuery,
  searchPlaceholder,
  children,
}: {
  query: string;
  onQuery: (v: string) => void;
  searchPlaceholder: string;
  children: React.ReactNode;
}) {
  const { profile, initials } = useCareerProfile();
  const { openMobileNav, toggleNavPanel } = useDashboardNav();
  return (
    <div className="relative min-h-full text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute -right-32 top-[420px] h-[420px] w-[420px] rounded-full bg-accent-light/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#071012]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openMobileNav}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={toggleNavPanel}
          className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 md:flex lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
          <Sparkles className="h-4 w-4 text-accent-light" />
          {dashboardHeading(profile)}
        </h1>
        <SearchField value={query} onChange={onQuery} placeholder={searchPlaceholder} className="ml-auto hidden w-full max-w-xs sm:block" />
        <Link
          href="/settings"
          aria-label="Account settings"
          className="ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent text-sm font-bold text-[#042F2E] ring-2 ring-white/10 transition-shadow hover:ring-accent-light/60 sm:ml-0"
        >
          {initials}
        </Link>
      </header>

      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}

export function MobileSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <SearchField value={value} onChange={onChange} placeholder={placeholder} className="mt-4 block sm:hidden" />;
}

export function DarkHero({
  greeting,
  sub,
  cta,
  href,
  image,
  imageAlt,
  stats,
}: {
  greeting: string;
  sub: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  stats: React.ReactNode;
}) {
  const { displayName, profile } = useCareerProfile();
  const reduce = useReducedMotion();
  const first = displayName.split(" ")[0] || "there";
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative overflow-hidden rounded-[26px] border border-accent-light/15 bg-gradient-to-br from-[#0E2426] via-[#0A1719] to-[#071012] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8"
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr_210px]">
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-accent-light/30 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-light">
            {dashboardHeading(profile)}
          </span>
          <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {greeting}
            <span className="mt-1 flex items-center gap-2 bg-gradient-to-r from-accent-light to-[#5EEAD4] bg-clip-text text-transparent">
              {first}
              <motion.span
                aria-hidden
                animate={reduce ? undefined : { rotate: [0, 18, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-7 w-7 text-accent-light" />
              </motion.span>
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">{sub}</p>
          <Link
            href={href}
            className="mt-6 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#99F6E4] to-accent-light px-5 py-3 text-sm font-bold text-[#042F2E] shadow-[0_0_30px_rgba(45,212,191,0.35)] transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(45,212,191,0.6)]"
          >
            <span className="truncate">{cta}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>

        <motion.div
          className="relative mx-auto aspect-[16/10] w-full max-w-[460px]"
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div aria-hidden className="absolute inset-[18%] rounded-full bg-accent/30 blur-3xl" />
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 460px"
            className="object-contain"
            style={{
              maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
            }}
          />
        </motion.div>

        <div className="relative z-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{stats}</div>
      </div>
    </motion.section>
  );
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  layoutId: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "relative shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200",
            value === o.id ? "text-[#042F2E]" : "text-white/70 hover:text-white"
          )}
        >
          {value === o.id ? <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-accent-light" transition={{ duration: 0.25 }} /> : null}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function EmptySearch({ query, onClear, noun }: { query: string; onClear: () => void; noun: string }) {
  return (
    <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/65">
      No {noun} match &ldquo;{query}&rdquo;.{" "}
      <button type="button" onClick={onClear} className="cursor-pointer font-semibold text-accent-light hover:underline">
        Clear search
      </button>
    </p>
  );
}

export function TileIn({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function TileArrow() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-200 group-hover:border-accent-light group-hover:bg-accent-light group-hover:text-[#042F2E]">
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
