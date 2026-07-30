"use client";

import dynamic from "next/dynamic";

const CareerJourneyExperience = dynamic(
  () =>
    import("@/components/landing/journey/CareerJourneyExperience").then(
      (m) => m.CareerJourneyExperience
    ),
  {
    ssr: false,
    loading: () => <LandingSkeleton />,
  }
);

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-white pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[42%_58%]">
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-full bg-[#F4F4F5]" />
            <div className="h-16 w-full max-w-md rounded-lg bg-[#F4F4F5]" />
            <div className="h-24 w-full max-w-sm rounded-lg bg-[#F4F4F5]" />
            <div className="flex gap-3">
              <div className="h-12 w-36 rounded-full bg-[#E4E4E7]" />
              <div className="h-12 w-40 rounded-full bg-[#F4F4F5]" />
            </div>
          </div>
          <div className="hidden h-[420px] rounded-2xl bg-[#FAFAFA] lg:block" />
        </div>
      </div>
    </div>
  );
}

export function LandingJourney() {
  return <CareerJourneyExperience />;
}
