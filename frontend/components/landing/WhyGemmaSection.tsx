"use client";

import { motion } from "framer-motion";
import { Brain, FileJson, Map, MessageSquare, Zap } from "lucide-react";
import { SectionReveal, SectionRevealItem, SectionRevealStagger } from "@/components/motion/SectionReveal";
import { GemmaBadge } from "@/components/gemma/GemmaBrand";

const gemmaCards = [
  {
    icon: Brain,
    title: "Adaptive routing",
    desc: "Gemma recalculates your path as you learn — smarter waypoints every session.",
    color: "from-[#2563EB]/10 to-white",
  },
  {
    icon: FileJson,
    title: "Structured maps",
    desc: "Roadmaps and matches export as clean JSON — pin them on your dashboard.",
    color: "from-accent/10 to-white",
  },
  {
    icon: MessageSquare,
    title: "Explainable directions",
    desc: "Every match shows why it fits and what's missing from your route.",
    color: "from-[#8B5CF6]/10 to-white",
  },
  {
    icon: Zap,
    title: "Web-wide search",
    desc: "Gemma scans the internet for internships, then filters scams off your map.",
    color: "from-[#10B981]/10 to-white",
  },
];

export function WhyGemmaSection() {
  return (
    <section id="why-gemma" className="below-fold-section border-t border-[#F4F4F5] bg-white py-28">
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal variant="scale" className="overflow-hidden rounded-[32px] border border-[#0D9488]/30 bg-gradient-to-br from-[#1a2e2c] via-[#18181B] to-[#1a1a1c] p-8 md:p-14">
          {/* Map grid overlay on dark card */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #0D9488 1px, transparent 1px), linear-gradient(to bottom, #0D9488 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <GemmaBadge className="border-white/20 bg-white/10 text-white" />
              <h2 className="font-heading mt-6 flex items-center gap-2 text-3xl font-extrabold text-white md:text-4xl">
                <Map className="h-8 w-8 text-accent" />
                Gemma is your navigator
              </h2>
              <p className="mt-3 max-w-lg text-white/60">
                Not AI-washed — Gemma 4 powers every pin, route, and destination on your career map.
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="hidden rounded-[24px] border border-accent/30 bg-accent/10 p-6 md:block"
            >
              <p className="text-4xl font-extrabold text-accent">Gemma 4</p>
              <p className="text-sm text-white/50">27B · 256K context</p>
            </motion.div>
          </div>

          <SectionRevealStagger className="relative mt-10 grid gap-4 sm:grid-cols-2" stagger={0.1}>
            {gemmaCards.map((card) => {
              const Icon = card.icon;
              return (
                <SectionRevealItem key={card.title} variant="slide-up">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`rounded-[20px] border border-white/10 bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-4 font-bold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{card.desc}</p>
                  </motion.div>
                </SectionRevealItem>
              );
            })}
          </SectionRevealStagger>
        </SectionReveal>
      </div>
    </section>
  );
}
