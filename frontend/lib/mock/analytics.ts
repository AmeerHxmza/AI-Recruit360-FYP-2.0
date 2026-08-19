/**
 * Temporary Development Mock Data: Analytics & Recruitment Intelligence
 * ---------------------------------------------------------------------
 * Isolated analytics dataset for metrics, funnel, time-to-hire, and candidate sources.
 */

export interface AnalyticsSummary {
  timeToHireDays: number;
  screeningEfficiencyPct: number;
  aiMatchAccuracyPct: number;
  candidateConversionPct: number;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  color: string;
}

export interface CandidateSourceData {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export const mockAnalyticsSummary: AnalyticsSummary = {
  timeToHireDays: 27,
  screeningEfficiencyPct: 42,
  aiMatchAccuracyPct: 92,
  candidateConversionPct: 5.6,
};

export const mockFunnelData: FunnelStageData[] = [
  { stage: "Applied", count: 124, color: "#39D9FF" },
  { stage: "Screening", count: 48, color: "#63E3FF" },
  { stage: "Interview", count: 21, color: "#F5B942" },
  { stage: "Shortlisted", count: 7, color: "#35D07F" },
  { stage: "Hired", count: 3, color: "#35D07F" },
];

export const mockCandidateSources: CandidateSourceData[] = [
  { source: "LinkedIn Referral", count: 58, percentage: 46.8, color: "#39D9FF" },
  { source: "Direct Website", count: 34, percentage: 27.4, color: "#63E3FF" },
  { source: "Internal Recruiter", count: 20, percentage: 16.1, color: "#35D07F" },
  { source: "Github & Community", count: 12, percentage: 9.7, color: "#F5B942" },
];
