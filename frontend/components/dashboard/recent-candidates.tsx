import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/dashboard/match-score";
import { CandidateMockItem } from "@/lib/mock/candidates";
import { Users, ChevronRight, ExternalLink } from "lucide-react";

export interface RecentCandidatesProps {
  candidates: CandidateMockItem[];
  onViewAll?: () => void;
  onSelectCandidate?: (candidate: CandidateMockItem) => void;
  className?: string;
}

export const RecentCandidates: React.FC<RecentCandidatesProps> = ({
  candidates,
  onViewAll,
  onSelectCandidate,
  className,
}) => {
  const getStatusBadge = (status: CandidateMockItem["status"]) => {
    switch (status) {
      case "Shortlisted":
        return <Badge variant="success" className="text-[11px] px-2 py-0.5 font-medium">Shortlisted</Badge>;
      case "Interview":
        return <Badge variant="ai" className="text-[11px] px-2 py-0.5 font-medium">Interview</Badge>;
      case "Screening":
        return <Badge variant="warning" className="text-[11px] px-2 py-0.5 font-medium">Screening</Badge>;
      case "Review":
        return <Badge variant="default" className="text-[11px] px-2 py-0.5 font-medium">Review</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium">{status}</Badge>;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Recent Candidate Intelligence
          </h3>
        </div>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs text-[#39D9FF] hover:text-[#63E3FF] hover:bg-[#39D9FF]/10"
          >
            View All Pipeline Candidates <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>

      <Table className="border-[#242932] bg-[#12151A]">
        <TableHeader>
          <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Target Role</TableHead>
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Match Score</TableHead>
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Experience</TableHead>
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Last Activity</TableHead>
            <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((cand) => (
            <TableRow
              key={cand.id}
              onClick={() => onSelectCandidate?.(cand)}
              className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
            >
              {/* Candidate Info */}
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={cand.avatarFallback}
                    size="sm"
                    status={cand.matchScore >= 90 ? "ai" : "online"}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#F5F7FA] text-xs">
                      {cand.name}
                    </span>
                    <span className="text-[11px] text-[#A7AFBC]">
                      {cand.email}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Role */}
              <TableCell className="py-3.5 font-medium text-[#F5F7FA] text-xs">
                {cand.role}
              </TableCell>

              {/* AI Match Score Component */}
              <TableCell className="py-3.5">
                <MatchScore
                  score={cand.matchScore}
                  label={cand.matchLabel}
                  confidenceLevel={cand.confidenceLevel}
                  size="sm"
                  showBar={true}
                />
              </TableCell>

              {/* Experience */}
              <TableCell className="py-3.5 font-mono text-xs text-[#A7AFBC]">
                {cand.experience}
              </TableCell>

              {/* Status */}
              <TableCell className="py-3.5">{getStatusBadge(cand.status)}</TableCell>

              {/* Last Activity */}
              <TableCell className="py-3.5 text-xs text-[#68717E]">
                {cand.lastActivity}
              </TableCell>

              {/* Action Button */}
              <TableCell className="py-3.5 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#A7AFBC] hover:text-[#39D9FF] hover:bg-[#171B21]"
                  aria-label={`View ${cand.name} details`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
