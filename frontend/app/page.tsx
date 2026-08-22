import type { Metadata } from "next";
import { PublicNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ProductWorkflow } from "@/components/landing/product-workflow";
import { CandidateIntelligenceSection } from "@/components/landing/candidate-intelligence";
import { ScreeningSection } from "@/components/landing/screening-section";
import { EvidenceSection } from "@/components/landing/evidence-section";
import { InterviewSection } from "@/components/landing/interview-section";
import { AnalyticsSection } from "@/components/landing/analytics-section";
import { PlatformOverview } from "@/components/landing/platform-overview";
import { AIActivitySection } from "@/components/landing/ai-activity-section";
import { TechnologySection } from "@/components/landing/technology-section";
import { TrustSection } from "@/components/landing/trust-section";
import { FinalCTASection } from "@/components/landing/final-cta";
import { PublicFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "AI-Recruit360 — AI-Powered Recruitment Intelligence",
  description:
    "Screen candidates, assess skills, conduct AI interviews, and turn applications into actionable hiring intelligence.",
  openGraph: {
    title: "AI-Recruit360 — AI-Powered Recruitment Intelligence",
    description:
      "Screen candidates, assess skills, conduct AI interviews, and turn applications into actionable hiring intelligence.",
    type: "website",
    siteName: "AI-Recruit360",
  },
};

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] selection:bg-[#39D9FF]/20 selection:text-[#39D9FF] flex flex-col font-sans">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <PlatformOverview />
        <ProductWorkflow />
        <ScreeningSection />
        <EvidenceSection />
        <InterviewSection />
        <CandidateIntelligenceSection />
        <AnalyticsSection />
        <AIActivitySection />
        <TrustSection />
        <TechnologySection />
        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
