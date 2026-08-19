"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AiIntelligencePanel } from "@/components/dashboard/ai-intelligence-panel";
import { HiringPipeline } from "@/components/dashboard/hiring-pipeline";
import { RecentCandidates } from "@/components/dashboard/recent-candidates";
import { InsightsPanel } from "@/components/dashboard/insights-panel";

import {
  mockDashboardMetrics,
  mockAiSummary,
  mockHiringPipeline,
} from "@/lib/mock/dashboard";
import { mockRecentCandidates } from "@/lib/mock/candidates";

import { Users, UserCheck, Video, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = React.useState("dashboard");

  const getMetricIcon = (id: string) => {
    switch (id) {
      case "active-candidates":
        return <Users className="h-4 w-4" />;
      case "screening":
        return <UserCheck className="h-4 w-4" />;
      case "interviews":
        return <Video className="h-4 w-4" />;
      case "match-accuracy":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <ApplicationShell
      activeNavId={activeNav}
      onNavigate={setActiveNav}
      pageBreadcrumb={["AI-Recruit360", "Command Center", "Overview"]}
    >
      {/* Dashboard Header */}
      <DashboardHeader
        userName="Ameer"
        onCreateJob={() => alert("Create Job workflow trigger")}
      />

      {/* Primary Metrics Editorial Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mockDashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            description={metric.description}
            icon={getMetricIcon(metric.id)}
            highlight={metric.id === "match-accuracy"}
          />
        ))}
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signature AI Intelligence Panel + Recent Candidates */}
        <div className="lg:col-span-8 space-y-6">
          <AiIntelligencePanel data={mockAiSummary} />

          <RecentCandidates
            candidates={mockRecentCandidates}
            onViewAll={() => alert("Navigate to full candidates directory")}
            onSelectCandidate={(cand) =>
              alert(`Candidate Selected: ${cand.name} (${cand.role})`)
            }
          />
        </div>

        {/* Right Column: Hiring Pipeline + AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          <HiringPipeline stages={mockHiringPipeline} />
          <InsightsPanel />
        </div>
      </div>
    </ApplicationShell>
  );
}
