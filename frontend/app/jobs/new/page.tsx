"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Save } from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const [threshold, setThreshold] = React.useState(85);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Job created successfully (UI mock trigger). Redirecting to Jobs list...");
    router.push("/jobs");
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "Jobs", "Create Job"]}>
      <form onSubmit={handleSubmit}>
        <PageHeader
          title="Create New Job Position"
          description="Configure job details and AI automated screening criteria for candidate matching."
          breadcrumbs={
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Jobs Directory
            </button>
          }
          actions={
            <>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  alert("Draft saved (UI mock trigger).");
                  router.push("/jobs");
                }}
              >
                <Save className="h-4 w-4 mr-1.5" /> Save Draft
              </Button>
              <Button type="submit" variant="ai" size="md">
                <Sparkles className="h-4 w-4 mr-1.5" /> Publish Job &amp; AI Screening
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Basic Info */}
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                1. Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Job Title *
                  </label>
                  <Input placeholder="e.g. Senior AI/ML Engineer" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Department *
                    </label>
                    <Select
                      options={[
                        { value: "Engineering", label: "Engineering" },
                        { value: "Infrastructure", label: "Infrastructure" },
                        { value: "Data & AI", label: "Data & AI" },
                        { value: "Product", label: "Product" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Location *
                    </label>
                    <Input placeholder="e.g. Remote / San Francisco, CA" required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                      Employment Type *
                    </label>
                    <Select
                      options={[
                        { value: "Full-time", label: "Full-time" },
                        { value: "Part-time", label: "Part-time" },
                        { value: "Contract", label: "Contract" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Job Description & Requirements */}
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                2. Job Description &amp; Requirements
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Job Overview Description
                  </label>
                  <Textarea
                    rows={5}
                    placeholder="Enter detailed job overview, responsibilities, and expected impact..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Required Skills (Comma separated)
                  </label>
                  <Input placeholder="e.g. Python, FastAPI, RAG, LangGraph, PostgreSQL" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: AI Screening Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    AI Screening Config
                  </h3>
                </div>
                <Badge variant="ai" className="text-[10px]">
                  Agentic RAG
                </Badge>
              </div>

              {/* Threshold Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A7AFBC]">
                  <span>Minimum AI Match Threshold</span>
                  <span className="font-bold text-[#39D9FF] font-mono">{threshold}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={95}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-[#39D9FF] bg-[#12151A] rounded-md cursor-pointer"
                />
                <p className="text-[11px] text-[#68717E] leading-relaxed">
                  Candidates scoring below {threshold}% will require manual recruiter sign-off before advancing.
                </p>
              </div>

              {/* Evidence Categories */}
              <div className="space-y-2 pt-2 border-t border-[#242932]">
                <span className="text-xs font-bold text-[#A7AFBC] uppercase tracking-wider block">
                  Required AI Evidence Verification
                </span>
                <div className="space-y-1.5 text-xs text-[#F5F7FA]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#39D9FF] rounded" />
                    <span>Technical Skill Evidence Extraction</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#39D9FF] rounded" />
                    <span>Years of Experience Verification</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#39D9FF] rounded" />
                    <span>Production Architecture Benchmarks</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </ApplicationShell>
  );
}
