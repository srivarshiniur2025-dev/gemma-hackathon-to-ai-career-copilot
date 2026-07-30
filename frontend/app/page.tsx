"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CareerJourneyExperience } from "@/components/landing/journey/CareerJourneyExperience";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <CareerJourneyExperience />
      <Footer />
    </div>
  );
}
