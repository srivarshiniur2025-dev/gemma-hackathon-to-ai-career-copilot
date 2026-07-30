"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="roadmap" className="below-fold-section px-6 py-24 lg:px-8">
      <SectionReveal variant="rotate-in">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[18px] border border-border bg-primary px-8 py-16 text-center md:px-16">
          <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">
            Ready to build your career?
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-white/60">
            Gemma-powered guidance — from your first assessment to your first internship offer.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button variant="accent" size="lg" className="gap-2 px-8">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SectionReveal>
    </section>
  );
}
