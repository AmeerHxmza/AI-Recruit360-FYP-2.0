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
  title: "AI-Recruit360 — Recruitment Intelligence, Reengineered",
  description:
    "AI-powered recruitment intelligence for candidate screening, evaluation, interviews, and smarter hiring decisions.",
  openGraph: {
    title: "AI-Recruit360 — Recruitment Intelligence, Reengineered",
    description:
      "AI-powered recruitment intelligence for candidate screening, evaluation, interviews, and smarter hiring decisions.",
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
        <ProductWorkflow />
        <CandidateIntelligenceSection />
        <ScreeningSection />
        <EvidenceSection />
        <InterviewSection />
        <AnalyticsSection />
        <PlatformOverview />
        <AIActivitySection />
        <TechnologySection />
        <TrustSection />
        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
