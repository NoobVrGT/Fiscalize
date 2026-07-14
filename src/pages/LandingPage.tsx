import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/landing/Hero";
import WhyItMatters from "../components/landing/WhyItMatters";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import FourPillars from "../components/landing/FourPillars";
import DashboardPreview from "../components/landing/DashboardPreview";
import AccessibilitySection from "../components/landing/AccessibilitySection";
import Faq from "../components/landing/Faq";
import FinalCta from "../components/landing/FinalCta";
import { usePageMeta } from "../lib/usePageMeta";

export default function LandingPage() {
  usePageMeta(
    "Fiscalize — Learn. Save. Grow.",
    "Fiscalize helps teens build lifelong financial habits through personalized goals, gamified learning, and interactive lessons.",
  );

  // Support deep links like /#features arriving from other routes.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <WhyItMatters />
        <Features />
        <HowItWorks />
        <FourPillars />
        <DashboardPreview />
        <AccessibilitySection />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
