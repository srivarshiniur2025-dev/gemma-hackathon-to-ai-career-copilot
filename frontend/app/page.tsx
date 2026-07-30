import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { WhyGemmaSection } from "@/components/landing/WhyGemmaSection";
import { CareerPath } from "@/components/landing/CareerPath";

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
