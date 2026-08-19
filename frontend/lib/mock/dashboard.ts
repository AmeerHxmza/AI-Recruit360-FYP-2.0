/**
 * Temporary Development Mock Data: Dashboard Intelligence
 * --------------------------------------------------------
 * Isolated mock data for visual demonstration of the dashboard command center.
 * Easily removable when connecting backend API endpoints.
 */

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
}

export interface AiIntelligenceSummary {
  candidatesAnalyzed: number;
  strongMatches: number;
  avgConfidence: number;
  engineStatus: "Active" | "Idle" | "Syncing";
  lastScanTime: string;
}

export interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export const mockDashboardMetrics: MetricItem[] = [
  {
    id: "active-candidates",
    label: "Active Candidates",
    value: "124",
    change: "+12.4%",
    trend: "up",
    description: "vs last month",
  },
  {
    id: "screening",
    label: "Candidates in Screening",
    value: "48",
    change: "+8.2%",
    trend: "up",
    description: "automated AI evaluations",
  },
  {
    id: "interviews",
    label: "Interviews",
    value: "21",
    change: "+4.1%",
    trend: "up",
    description: "scheduled & AI adaptive",
  },
  {
    id: "match-accuracy",
    label: "AI Match Accuracy",
    value: "92%",
    change: "+2.5%",
    trend: "up",
    description: "explainable match score",
  },
];

export const mockAiSummary: AiIntelligenceSummary = {
  candidatesAnalyzed: 183,
  strongMatches: 27,
  avgConfidence: 91,
  engineStatus: "Active",
  lastScanTime: "Just now",
};

export const mockHiringPipeline: PipelineStage[] = [
  { stage: "Applied", count: 124, percentage: 100, color: "#39D9FF" },
  { stage: "Screening", count: 48, percentage: 38.7, color: "#63E3FF" },
  { stage: "Interview", count: 21, percentage: 16.9, color: "#F5B942" },
  { stage: "Shortlisted", count: 7, percentage: 5.6, color: "#35D07F" },
];
