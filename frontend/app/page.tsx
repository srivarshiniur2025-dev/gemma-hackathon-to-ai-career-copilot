import dynamic from "next/dynamic";
import { LandingJourney } from "@/components/landing/LandingJourney";
import { LandingLenisProvider } from "@/components/motion/LenisProvider";

const Navbar = dynamic(() =>
  import("@/components/layout/Navbar").then((m) => ({ default: m.Navbar }))
);
const Footer = dynamic(() =>
  import("@/components/layout/Footer").then((m) => ({ default: m.Footer }))
);

export default function HomePage() {
  return (
    <LandingLenisProvider>
      <div className="relative min-h-screen bg-white">
        <Navbar />
        <LandingJourney />
        <Footer />
      </div>
    </LandingLenisProvider>
  );
}
