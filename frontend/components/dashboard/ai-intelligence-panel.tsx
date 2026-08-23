import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, Clock } from "lucide-react";
import { AiIntelligenceSummary } from "@/lib/mock/dashboard";

export interface AiIntelligencePanelProps {
  data: AiIntelligenceSummary;
  className?: string;
}

export const AiIntelligencePanel: React.FC<AiIntelligencePanelProps> = ({
  data,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-[#39D9FF]/30 bg-[#171B21] p-6 shadow-[0_0_30px_rgba(57,217,255,0.06)] transition-component overflow-hidden",
        className
      )}
    >
      {/* Restrained Subtle Glow Accent */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#39D9FF]/10 via-transparent to-transparent pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-[#242932]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39D9FF]/10 text-[#39D9FF] border border-[#39D9FF]/30 shadow-[0_0_12px_rgba(57,217,255,0.2)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display flex items-center gap-2">
              Candidate Analysis
            </h2>
            <p className="text-xs text-[#A7AFBC] mt-0.5">
              Automated candidate screening &amp; evidence-matching intelligence
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <Badge variant="ai" className="px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39D9FF] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39D9FF]" />
          </span>
          Analysis Active
        </Badge>
      </div>

      {/* Core Metrics Summary Row */}
      <div className="mt-5 grid grid-cols-3 gap-4 border-b border-[#242932] pb-5">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#F5F7FA] font-display">
            {data.candidatesAnalyzed}
          </span>
          <span className="text-[11px] font-semibold text-[#A7AFBC] uppercase tracking-wider mt-0.5">
            Analyzed
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#35D07F] font-display">
            {data.strongMatches}
          </span>
          <span className="text-[11px] font-semibold text-[#A7AFBC] uppercase tracking-wider mt-0.5">
            Strong Matches
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#39D9FF] font-display">
            {data.avgConfidence}%
          </span>
          <span className="text-[11px] font-semibold text-[#A7AFBC] uppercase tracking-wider mt-0.5">
            Confidence
          </span>
        </div>
      </div>

      {/* Analysis Pipeline Capacity Sub-section */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#A7AFBC] uppercase tracking-wider">
          <span>Analysis Progress</span>
          <span className="text-[#39D9FF] font-mono">91% Complete</span>
        </div>

        {/* Sub-process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#A7AFBC] pt-1">
          <div className="flex items-center justify-between p-2 rounded-md bg-[#12151A] border border-[#242932]">
            <span>Evidence Extraction</span>
            <span className="flex items-center gap-1 text-[#35D07F] font-medium text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-md bg-[#12151A] border border-[#242932]">
            <span>Semantic Matching</span>
            <span className="flex items-center gap-1 text-[#35D07F] font-medium text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Complete
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-md bg-[#12151A] border border-[#242932]">
            <span>Candidate Ranking</span>
            <span className="flex items-center gap-1 text-[#39D9FF] font-medium text-[11px]">
              <Clock className="h-3 w-3 animate-spin" /> Processing
            </span>
          </div>
        </div>

        {/* Restrained Precision Progress Bar */}
        <Progress value={91} variant="ai" size="sm" className="mt-2" />
      </div>
    </div>
  );
};
