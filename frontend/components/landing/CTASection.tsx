"use client";

import Link from "next/link";
import { ArrowRight, Flag, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="cta" className="below-fold-section border-t border-[#F4F4F5] bg-white py-28">
      <SectionReveal variant="scale">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border-2 border-accent/30">
          {/* Map-style gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#18181B]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff20 1px, transparent 1px), linear-gradient(to bottom, #ffffff20 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative grid gap-8 p-10 md:grid-cols-2 md:items-center md:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <Flag className="h-3.5 w-3.5" />
                Final destination
              </div>
              <h2 className="font-heading mt-5 text-3xl font-extrabold text-white md:text-4xl">
                Your career map awaits.
              </h2>
              <p className="mt-4 text-white/70">
                Pin your skills, follow the route, and reach your internship destination — all powered by Gemma.
              </p>
              <Link href="/signup" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="h-14 gap-2 rounded-2xl bg-white px-8 text-base text-accent hover:bg-white/90"
                >
                  Start your journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Skill Pin", value: "92%", icon: MapPin },
                { label: "Route Days", value: "12d", icon: Sparkles },
                { label: "Destinations", value: "24", icon: Flag },
                { label: "Interview", value: "85%", icon: MapPin },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-[18px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-1 h-3.5 w-3.5 text-white/50" />
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">{c.label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-white">{c.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
