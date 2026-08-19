"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockAiActivityEvents, AiActivityEvent } from "@/lib/mock/ai-activity";
import { Cpu, Sparkles, Database, FileText, Video } from "lucide-react";

export default function AiActivityPage() {
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");

  const filteredEvents = mockAiActivityEvents.filter((ev) => {
    return categoryFilter === "All" || ev.category === categoryFilter;
  });

  const getCategoryIcon = (cat: AiActivityEvent["category"]) => {
    switch (cat) {
      case "Resume Analysis":
        return <FileText className="h-4 w-4 text-[#39D9FF]" />;
      case "RAG Retrieval":
        return <Database className="h-4 w-4 text-[#63E3FF]" />;
      case "Candidate Matching":
        return <Sparkles className="h-4 w-4 text-[#35D07F]" />;
      case "Interview":
        return <Video className="h-4 w-4 text-[#F5B942]" />;
      case "Evaluation":
        return <Cpu className="h-4 w-4 text-[#39D9FF]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#39D9FF]" />;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={["AI-Recruit360", "AI Activity Console"]}>
      <PageHeader
        title="AI Activity Console"
        description="Real-time stream of background AI agent operations, vector retrieval, and automated evaluations."
        badge={
          <Badge variant="ai" className="px-3 py-1">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39D9FF] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39D9FF]" />
            </span>
            Agentic Engine Active
          </Badge>
        }
      />

      {/* Category Filter Pills */}
      <Section className="my-0 mb-6">
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-[#242932] bg-[#12151A]">
          {["All", "Resume Analysis", "RAG Retrieval", "Candidate Matching", "Interview", "Evaluation"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-micro focus:outline-none ${
                categoryFilter === cat
                  ? "bg-[#171B21] text-[#39D9FF] border border-[#39D9FF]/40 font-semibold"
                  : "text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#171B21]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Section>

      {/* Event Activity Stream Timeline */}
      <Section title="Live AI Operational Event Stream">
        <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
          <div className="space-y-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-[#0D0F12] border border-[#1C2027] transition-micro hover:border-[#39D9FF]/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#171B21] border border-[#242932]">
                  {getCategoryIcon(ev.category)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F5F7FA]">{ev.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {ev.category}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-mono text-[#68717E]">{ev.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#A7AFBC] leading-relaxed">
                    Target Candidate: <span className="font-semibold text-[#F5F7FA]">{ev.candidateName}</span> ({ev.targetRole}) — {ev.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </ApplicationShell>
  );
}
