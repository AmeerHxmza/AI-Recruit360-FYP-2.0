"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MatchScore } from "@/components/dashboard/match-score";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { mockCandidates } from "@/lib/mock/candidates";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candId = (params?.id as string) || "cand-001";

  const cand = mockCandidates.find((c) => c.id === candId) || mockCandidates[0];

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Candidates", cand.name]}>
      <PageHeader
        title={cand.name}
        description={`${cand.role} · ${cand.location}`}
        badge={<Badge variant="ai">{cand.status}</Badge>}
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/candidates")}
            className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Candidates Directory
          </button>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => alert(`Shortlisted ${cand.name}`)}
            >
              <UserCheck className="h-4 w-4 mr-1.5" /> Shortlist
            </Button>
            <Button
              variant="ai"
              size="md"
              onClick={() => router.push("/interviews/int-001")}
            >
              <Calendar className="h-4 w-4 mr-1.5" /> Schedule Interview
            </Button>
          </>
        }
      />

      {/* Grid Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: Overview, Breakdown, AI Evidence & Recommendation */}
        <div className="lg:col-span-8 space-y-6">
          {/* Candidate Profile Summary Header Card */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242932]">
              <div className="flex items-center gap-4">
                <Avatar fallback={cand.avatarFallback} size="xl" status="ai" />
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-[#F5F7FA] font-display">{cand.name}</h2>
                  <span className="text-xs text-[#39D9FF] font-medium">{cand.role}</span>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A7AFBC] mt-1.5">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-[#68717E]" /> {cand.currentCompany}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#68717E]" /> {cand.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-[#68717E]" /> {cand.education}
                    </span>
                  </div>
                </div>
              </div>

              {/* Large Score Component */}
              <div className="p-3 rounded-lg bg-[#171B21] border border-[#39D9FF]/30">
                <MatchScore
                  score={cand.matchScore}
                  label={cand.matchLabel}
                  confidenceLevel={cand.confidenceLevel}
                  size="lg"
                  showBar={true}
                />
              </div>
            </div>

            {/* Contact Details & Skills */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#A7AFBC]">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#39D9FF]" /> {cand.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#39D9FF]" /> {cand.phone}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#A7AFBC] block mb-2">
                  Verified Skill Tags:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {cand.skills.map((skill) => (
                    <Badge key={skill} variant="ai" className="text-[11px] px-2.5 py-0.5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Match Breakdown Section */}
          <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  AI Match Score Breakdown
                </h3>
              </div>
              <Badge variant="ai" className="text-[10px]">
                Vector Alignment
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3 rounded-md bg-[#12151A] border border-[#242932]">
                <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block">Skills</span>
                <span className="text-xl font-bold text-[#39D9FF] font-mono block mt-1">{cand.matchBreakdown.skills}%</span>
              </div>
              <div className="p-3 rounded-md bg-[#12151A] border border-[#242932]">
                <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block">Experience</span>
                <span className="text-xl font-bold text-[#35D07F] font-mono block mt-1">{cand.matchBreakdown.experience}%</span>
              </div>
              <div className="p-3 rounded-md bg-[#12151A] border border-[#242932]">
                <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block">Role Alignment</span>
                <span className="text-xl font-bold text-[#39D9FF] font-mono block mt-1">{cand.matchBreakdown.role}%</span>
              </div>
              <div className="p-3 rounded-md bg-[#12151A] border border-[#242932]">
                <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block">Education</span>
                <span className="text-xl font-bold text-[#F5F7FA] font-mono block mt-1">{cand.matchBreakdown.education}%</span>
              </div>
            </div>
          </Card>

          {/* AI Evidence Section */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#35D07F]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Extracted Resume Evidence (RAG Verified)
              </h3>
            </div>

            <div className="space-y-3">
              {cand.evidence.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg bg-[#0D0F12] border border-[#1C2027] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F7FA]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#35D07F] shrink-0" />
                    <span>{ev.claim}</span>
                  </div>
                  <p className="text-[11px] text-[#A7AFBC] pl-5">
                    Context: &quot;{ev.sourceContext}&quot;
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Recommendation & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Recommendation Verdict Box */}
          <Card elevated className="p-5 border-[#35D07F]/40 bg-[#171B21] space-y-3 shadow-[0_0_20px_rgba(53,208,127,0.08)]">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <span className="text-xs font-bold text-[#35D07F] uppercase tracking-wider font-display">
                {cand.aiRecommendation.verdict}
              </span>
              <Sparkles className="h-4 w-4 text-[#35D07F]" />
            </div>

            <p className="text-xs text-[#F5F7FA] leading-relaxed">
              {cand.aiRecommendation.summary}
            </p>

            <div className="space-y-1.5 pt-2 border-t border-[#242932]">
              <span className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider block">
                Key Alignment Factors:
              </span>
              <ul className="space-y-1 text-xs text-[#A7AFBC] list-disc list-inside">
                {cand.aiRecommendation.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Candidate Timeline Card */}
          <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Recruitment Timeline
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-[#242932]">
              {cand.timeline.map((ev) => (
                <div key={ev.id} className="relative flex items-start gap-3 pl-6">
                  <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-[#39D9FF]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#F5F7FA]">{ev.title}</span>
                    <span className="text-[11px] text-[#A7AFBC]">{ev.description}</span>
                    <span className="text-[10px] text-[#68717E] mt-0.5">{ev.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
