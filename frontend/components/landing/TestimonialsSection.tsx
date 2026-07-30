"use client";

import {
  SectionReveal,
  SectionRevealItem,
  SectionRevealStagger,
} from "@/components/motion/SectionReveal";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="below-fold-section px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal variant="slide-up" className="text-center">
          <h2 className="font-heading text-3xl font-extrabold md:text-4xl">Loved by students</h2>
          <p className="mt-4 text-muted">Real stories from real career journeys.</p>
        </SectionReveal>

        <SectionRevealStagger className="mt-16 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {testimonials.map((t, i) => (
            <SectionRevealItem key={t.name} variant={i === 1 ? "scale" : "rotate-in"}>
              <Card className="h-full transition-shadow duration-500 hover:card-shadow-lg">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-muted">&ldquo;{t.review}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-secondary text-sm font-bold text-foreground-heading">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted">{t.college}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SectionRevealItem>
          ))}
        </SectionRevealStagger>
      </div>
    </section>
  );
}
