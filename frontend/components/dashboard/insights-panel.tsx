import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";

import { DashboardData } from "@/lib/services/dashboard-service";

export interface InsightsPanelProps {
  recentApplications?: DashboardData["recentApplications"];
  className?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ recentApplications = [], className }) => {
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
            Recent AI Activity
          </h3>
        </div>
        <Badge variant="ai" className="text-[10px] px-2 py-0.5">
          Real-Time
        </Badge>
      </div>

      <div className="space-y-3">
        {recentApplications.length > 0 ? (
          recentApplications.slice(0, 4).map((app, idx) => {
            let activityIcon = <ShieldCheck className="h-3.5 w-3.5 shrink-0" />;
            let activityColor = "text-[#39D9FF]";
            let activityBorder = "hover:border-[#39D9FF]/30";
            let activityTitle = "CV Screening Completed";
            let activityDesc = `AI screening finished for ${app.candidateName} with a match score of ${app.cvMatch}%.`;

            if (app.interviewScore !== null) {
              activityIcon = <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />;
              activityColor = "text-[#35D07F]";
              activityBorder = "hover:border-[#35D07F]/30";
              activityTitle = "AI Interview Evaluated";
              activityDesc = `${app.candidateName} completed the AI interview for ${app.jobTitle} with a score of ${app.interviewScore}%.`;
            } else if (app.assessmentScore !== null) {
              activityColor = "text-[#F5B942]";
              activityBorder = "hover:border-[#F5B942]/30";
              activityTitle = "Assessment Completed";
              activityDesc = `${app.candidateName} completed the technical assessment with ${app.assessmentScore}/10.`;
            } else if (app.cvMatch === null) {
              activityColor = "text-[#A7AFBC]";
              activityBorder = "hover:border-[#A7AFBC]/30";
              activityTitle = "Application Received";
              activityDesc = `New application received for ${app.jobTitle} from ${app.candidateName}. AI screening pending.`;
            }

            return (
              <div key={app.id || idx} className={`p-3.5 rounded-lg bg-[#0D0F12] border border-[#1C2027] space-y-1.5 transition-micro ${activityBorder}`}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${activityColor}`}>
                  {activityIcon}
                  <span>{activityTitle.toUpperCase()}</span>
                </div>
                <p className="text-xs text-[#F5F7FA] font-medium leading-snug">
                  {activityDesc}
                </p>
                <p className="text-[10px] text-[#A7AFBC]">
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center">
             <p className="text-xs text-[#A7AFBC]">No recent AI activity.</p>
          </div>
        )}
      </div>
    </div>
  );
};
