import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LandingJourney } from "@/components/landing/LandingJourney";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <LandingJourney />
      <Footer />
    </div>
  );
}
