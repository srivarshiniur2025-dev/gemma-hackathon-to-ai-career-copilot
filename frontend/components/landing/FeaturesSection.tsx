"use client";

import Link from "next/link";
import {
  BarChart3,
  Brain,
  Briefcase,
  FileText,
  Map,
  MapPin,
  Mic,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionReveal, SectionRevealItem, SectionRevealStagger } from "@/components/motion/SectionReveal";
import { features } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = { brain: Brain, map: Map, file: FileText, briefcase: Briefcase, mic: Mic, chart: BarChart3 };

const bentoLayout = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

const pinColors = ["#0D9488", "#2563EB", "#8B5CF6", "#10B981", "#FB923C", "#18181B"];

export function FeaturesSection() {
  return (
    <section id="features" className="below-fold-section border-t border-[#F4F4F5] bg-white py-28">
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal variant="slide-up" className="mb-14 text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-accent">
            <MapPin className="h-4 w-4" />
            Map destinations
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold md:text-5xl">
            Six stops on your <span className="text-gradient">career route.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Each destination unlocks a new layer on your map — click a pin to explore with Gemma.
          </p>
        </SectionReveal>

        <SectionRevealStagger className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3" stagger={0.08}>
          {features.map((f, i) => {
            const Icon = icons[f.icon];
            const large = i === 0 || i === 3;
            return (
              <SectionRevealItem key={f.title} variant="slide-up">
                <motion.div
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={cn(
                    "group relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-[24px] border border-[#0D9488]/15 bg-white/95 p-6 shadow-[0_8px_30px_rgba(13,148,136,0.08)] backdrop-blur-sm transition-shadow hover:shadow-[0_20px_50px_rgba(13,148,136,0.15)]",
                    bentoLayout[i]
                  )}
                >
                  {/* Map pin marker */}
                  <div
                    className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: pinColors[i] }}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF7F0] shadow-sm",
                        large && "h-14 w-14"
                      )}
                    >
                      <Icon className={cn("text-accent", large ? "h-7 w-7" : "h-6 w-6")} />
                    </div>
                    <Link
                      href={
                        i === 0
                          ? "/assessment"
                          : i === 1
                            ? "/roadmap"
                            : i === 2
                              ? "/resume"
                              : i === 3
                                ? "/internships"
                                : i === 4
                                  ? "/interview/setup"
                                  : "/dashboard"
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/80 opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-white"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <h3 className={cn("font-heading mt-4 font-bold text-foreground-heading", large && "text-xl")}>
                    {f.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{f.description}</p>

                  {/* Route dash */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-px flex-1 border-t border-dashed border-accent/30" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent/70">
                      Stop {i + 1}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.bullets.slice(0, large ? 4 : 2).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-[#0D9488]/15 bg-[#FAF7F0] px-2.5 py-0.5 text-[11px] font-medium text-muted-secondary"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </SectionRevealItem>
            );
          })}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
