import LandingNav from "../components/landing/LandingNav";
import PricingSection from "../components/landing/PricingSection";
import FooterSection from "../components/landing/FooterSection";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
