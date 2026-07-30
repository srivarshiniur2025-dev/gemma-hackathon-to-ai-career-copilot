"use client";

import { motion } from "framer-motion";
import { MapPin, Quote, Star } from "lucide-react";
import { SectionReveal, SectionRevealItem, SectionRevealStagger } from "@/components/motion/SectionReveal";
import { testimonials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const pinColors = ["#0D9488", "#2563EB", "#8B5CF6"];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="below-fold-section border-t border-[#F4F4F5] bg-white py-28">
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal variant="slide-up" className="text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-accent">
            <MapPin className="h-4 w-4" />
            Traveler stories
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold md:text-5xl">
            Students who mapped their path
          </h2>
          <p className="mt-4 text-muted">Real journeys — from first pin to offer letter.</p>
        </SectionReveal>

        <SectionRevealStagger className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {testimonials.map((t, i) => (
            <SectionRevealItem key={t.name} variant="slide-up">
              <motion.div
                whileHover={{ y: -8 }}
                className={cn(
                  "relative h-full overflow-hidden rounded-[24px] border border-[#0D9488]/15 bg-white/95 p-7 shadow-[0_8px_30px_rgba(13,148,136,0.06)] backdrop-blur-sm"
                )}
              >
                <div
                  className="absolute left-0 top-0 h-1 w-full"
                  style={{ backgroundColor: pinColors[i] }}
                />
                <div className="flex items-center justify-between">
                  <Quote className="h-8 w-8 text-accent/30" />
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: pinColors[i] }}
                  >
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">&ldquo;{t.review}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-dashed border-[#0D9488]/20 pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#0F766E] text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground-heading">{t.name}</p>
                    <p className="text-xs text-muted">{t.college}</p>
                  </div>
                </div>
              </motion.div>
            </SectionRevealItem>
          ))}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
