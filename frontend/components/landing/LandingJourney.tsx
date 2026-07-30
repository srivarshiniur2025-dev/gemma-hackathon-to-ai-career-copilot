"use client";

import dynamic from "next/dynamic";
import { PremiumHero } from "@/components/landing/premium/PremiumHero";

const CareerJourneyScroll = dynamic(
  () =>
    import("@/components/landing/journey/CareerJourneyScroll").then((m) => m.CareerJourneyScroll),
  { ssr: false }
);

export function LandingJourney() {
  return (
    <div id="career-journey" className="relative bg-white">
      <PremiumHero />
      <CareerJourneyScroll />
    </div>
  );
}
