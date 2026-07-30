"use client";

import { useEffect, useState } from "react";
import { NavigationFieldCanvas } from "@/components/landing/journey/NavigationFieldCanvas";
import { AmbientLightSweep } from "@/components/landing/journey/AmbientLightSweep";
import {
  EditorialHeroText,
  HeadlineAssemble,
  ParagraphLines,
  MagneticElement,
} from "@/components/landing/journey/EditorialHeroText";
import { MagneticButton } from "@/components/landing/journey/MagneticButton";
import { HeroParallaxLayer } from "@/contexts/HeroInteractionContext";
import { ArrowRight } from "lucide-react";
import { GEMMA_VERSION } from "@/lib/gemma";

type HeroLivingLayerProps = {
  onExploreRoute: () => void;
};

export function HeroLivingLayer({ onExploreRoute }: HeroLivingLayerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      id="journey-hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-white px-6 pt-28 lg:px-12 lg:pt-32"
    >
      <HeroParallaxLayer depth={1} className="pointer-events-none absolute inset-0 z-0">
        {mounted && <NavigationFieldCanvas className="absolute inset-0 h-full w-full" />}
      </HeroParallaxLayer>

      <HeroParallaxLayer depth={2} className="pointer-events-none absolute inset-0 z-[1]">
        <AmbientLightSweep />
      </HeroParallaxLayer>

      <HeroParallaxLayer depth={5} className="relative z-20 w-full max-w-4xl">
        <EditorialHeroText tagline={`${GEMMA_VERSION} · Autonomous career navigation`}>
          <HeadlineAssemble />
          <ParagraphLines text="An autonomous navigator guides every step — from first assessment to offer letter. Move your cursor. Watch the system respond." />
          <div className="mt-10 flex flex-wrap gap-3">
            <MagneticElement>
              <MagneticButton href="/assessment" variant="primary">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </MagneticButton>
            </MagneticElement>
            <MagneticElement>
              <MagneticButton variant="ghost" onClick={onExploreRoute}>
                Follow the route
              </MagneticButton>
            </MagneticElement>
          </div>
          <p className="mt-10 text-xs text-[#A1A1AA]">
            Scroll to travel · Hover milestones on the route
          </p>
        </EditorialHeroText>
      </HeroParallaxLayer>
    </section>
  );
}
