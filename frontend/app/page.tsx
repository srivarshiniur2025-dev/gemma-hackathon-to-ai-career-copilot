import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { CareerPath } from "@/components/landing/CareerPath";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturesSection = dynamic(
  () => import("@/components/landing/FeaturesSection").then((m) => m.FeaturesSection),
  { loading: () => <SectionPlaceholder /> }
);
const HowItWorksSection = dynamic(
  () => import("@/components/landing/HowItWorksSection").then((m) => m.HowItWorksSection),
  { loading: () => <SectionPlaceholder /> }
);
const WhyGemmaSection = dynamic(
  () => import("@/components/landing/WhyGemmaSection").then((m) => m.WhyGemmaSection),
  { loading: () => <SectionPlaceholder /> }
);
const TestimonialsSection = dynamic(
  () => import("@/components/landing/TestimonialsSection").then((m) => m.TestimonialsSection),
  { loading: () => <SectionPlaceholder /> }
);
const FAQSection = dynamic(
  () => import("@/components/landing/FAQSection").then((m) => m.FAQSection),
  { loading: () => <SectionPlaceholder /> }
);
const CTASection = dynamic(
  () => import("@/components/landing/CTASection").then((m) => m.CTASection),
  { loading: () => <SectionPlaceholder /> }
);

function SectionPlaceholder() {
  return (
    <div className="below-fold-section px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-10 w-80 max-w-full" />
        <Skeleton className="mx-auto h-64 w-full max-w-4xl rounded-[24px]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <CareerPath />
      <Navbar />
      <main className="relative xl:pl-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <WhyGemmaSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
