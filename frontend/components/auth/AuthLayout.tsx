"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, FileText, TrendingUp } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const previewCards = [
  {
    icon: FileText,
    title: "Resume Score",
    value: "87%",
    detail: "ATS-optimized · 3 improvements",
    delay: 0.2,
    className: "top-8 left-6 animate-float-slow",
  },
  {
    icon: TrendingUp,
    title: "Skill Match",
    value: "72%",
    detail: "React · System Design · DSA",
    delay: 0.35,
    className: "top-32 right-8 animate-float-medium",
  },
  {
    icon: Briefcase,
    title: "Internship Rec",
    value: "Google SWE",
    detail: "94% fit · Apply by Aug 15",
    delay: 0.5,
    className: "bottom-16 left-12 animate-float-fast",
  },
];

export function AuthPreview() {
  return (
    <div className="relative hidden min-h-[640px] overflow-hidden rounded-[18px] border border-border bg-background-secondary lg:flex lg:flex-col lg:justify-center lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(24,24,27,0.04),transparent_45%)]" />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <Logo size="lg" />
        <h2
          className="mt-10 text-3xl font-extrabold leading-tight text-foreground-heading"
          style={{ fontFamily: "var(--font-sora, var(--font-sans))" }}
        >
          Discover Your Skills.
          <br />
          <span className="text-accent">Build Your Career.</span>
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-muted">
          Enterprise-grade career guidance powered by Gemma 4 — assessments, roadmaps, and interviews in one place.
        </p>
      </motion.div>

      <div className="relative mt-10 h-72">
        {previewCards.map(({ icon: Icon, title, value, detail, delay, className }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute w-56 rounded-[14px] border border-border bg-white p-4 shadow-lg ${className}`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <Icon className="h-3.5 w-3.5 text-accent" />
              {title}
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground-heading">{value}</p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 right-4 w-64 rounded-[14px] border border-border bg-white/90 p-4 shadow-lg backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Career Dashboard</span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">LIVE</span>
          </div>
          <div className="space-y-2">
            {[85, 62, 78].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
                <span className="text-[10px] font-medium text-muted">{w}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** @deprecated Use AuthPreview — kept for backward compatibility */
export function AuthIllustration() {
  return <AuthPreview />;
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="outline" className="w-full gap-2 transition-transform duration-200 hover:scale-[1.01]">
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </Button>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-accent hover:underline">
      {children}
    </Link>
  );
}

export function AuthFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error">{message}</p>;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label };
