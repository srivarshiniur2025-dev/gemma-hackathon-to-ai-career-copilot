"use client";

import { Map } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/mock-data";

export function FAQSection() {
  return (
    <section id="faq" className="below-fold-section border-t border-[#F4F4F5] bg-white py-24">
      <div className="relative mx-auto max-w-2xl">
        <SectionReveal variant="mask" className="text-center">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-accent">
            <Map className="h-4 w-4" />
            Field guide
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold">Map FAQ</h2>
          <p className="mt-4 text-muted">Common questions about navigating your career route.</p>
        </SectionReveal>

        <SectionReveal variant="scale" delay={0.1} className="mt-12 rounded-[18px] border border-[#0D9488]/15 bg-white/95 px-6 shadow-[0_8px_30px_rgba(13,148,136,0.06)] backdrop-blur-sm">
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionReveal>
      </div>
    </section>
  );
}
