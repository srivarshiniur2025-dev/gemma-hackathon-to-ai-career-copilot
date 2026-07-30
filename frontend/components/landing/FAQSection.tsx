"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/mock-data";

export function FAQSection() {
  return (
    <section id="faq" className="below-fold-section bg-background-secondary px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <SectionReveal variant="mask" className="text-center">
          <h2 className="font-heading text-3xl font-extrabold">FAQ</h2>
          <p className="mt-4 text-muted">Common questions answered.</p>
        </SectionReveal>

        <SectionReveal variant="scale" delay={0.1} className="mt-12 rounded-[18px] border border-border bg-white px-6 card-shadow">
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
