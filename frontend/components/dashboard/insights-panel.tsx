import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";

export interface InsightsPanelProps {
  className?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#242932] bg-[#12151A] p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#242932]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            AI Decision Support Insights
          </h3>
        </div>
        <Badge variant="ai" className="text-[10px] px-2 py-0.5">
          Real-Time
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Insight Item 1 */}
        <div className="p-3.5 rounded-lg bg-[#0D0F12] border border-[#1C2027] space-y-1.5 transition-micro hover:border-[#39D9FF]/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#39D9FF]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>HIGH MATCH SIGNAL</span>
          </div>
          <p className="text-xs text-[#F5F7FA] font-medium leading-snug">
            Sophia Chen matches 94% of requirements for Senior AI/ML Engineer.
          </p>
          <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
            Verified strong evidence across RAG architecture, vector search, and model evaluation pipeline benchmarks.
          </p>
        </div>

        {/* Insight Item 2 */}
        <div className="p-3.5 rounded-lg bg-[#0D0F12] border border-[#1C2027] space-y-1.5 transition-micro hover:border-[#35D07F]/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#35D07F]">
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            <span>PIPELINE VELOCITY</span>
          </div>
          <p className="text-xs text-[#F5F7FA] font-medium leading-snug">
            Screening cycle duration reduced by 42% this week.
          </p>
          <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
            Automated initial evaluations resolved candidate qualifications without manual resume triage delay.
          </p>
        </div>
      </div>
    </div>
  );
};
