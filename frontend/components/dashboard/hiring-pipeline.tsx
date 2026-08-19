import * as React from "react";
import { cn } from "@/lib/utils";
import { PipelineStage } from "@/lib/mock/dashboard";
import { Layers } from "lucide-react";

export interface HiringPipelineProps {
  stages: PipelineStage[];
  className?: string;
}

export const HiringPipeline: React.FC<HiringPipelineProps> = ({
  stages,
  className,
}) => {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div
      className={cn(
        "rounded-xl border border-[#242932] bg-[#12151A] p-5 transition-component",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#242932] mb-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Hiring Pipeline Stages
          </h3>
        </div>
        <span className="text-xs text-[#A7AFBC]">
          Active: <span className="font-semibold text-[#F5F7FA]">200</span>
        </span>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const widthPercent = Math.max((stage.count / maxCount) * 100, 6);
          return (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F5F7FA]">{stage.stage}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[#F5F7FA]">{stage.count}</span>
                  <span className="text-[10px] text-[#A7AFBC]">
                    ({stage.percentage}%)
                  </span>
                </div>
              </div>

              {/* Precise Thin Analytical Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0D0F12] border border-[#1C2027]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
