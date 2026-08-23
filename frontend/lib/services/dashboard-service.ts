import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/session";
import { DatabaseError } from "@/lib/utils/errors";
import { measurePerformance } from "@/lib/performance/logger";

export interface DashboardData {
  metrics: {
    activeJobs: number;
    totalCandidates: number;
    totalApplications: number;
    totalInterviews: number;
    shortlistedCount: number;
    aiAnalysesCount: number;
  };
  funnel: {
    applied: number;
    screening: number;
    interview: number;
    evaluation: number;
    shortlisted: number;
    rejected: number;
    hired: number;
    total: number;
  };
  recentApplications: {
    id: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    status: string;
    createdAt: string;
  }[];
  aiSummary: {
    averageScore: number;
    strongMatches: number;
    potentialMatches: number;
    needsReview: number;
    totalAnalyses: number;
  };
}

export async function getDashboardDataForOrg(orgId: string): Promise<DashboardData> {
  const { durationMs: authDuration } = await measurePerformance("Auth Check (Dashboard)", async () => {
    return await getCurrentOrganization(orgId);
  });

  const supabase = await createClient();

  try {
    const { result, durationMs: dbDuration } = await measurePerformance("DB Query (Dashboard Summary RPC)", async () => {
      // 1. Try atomic PostgreSQL RPC for maximum speed (< 50ms)
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_dashboard_summary", {
        _org_id: orgId,
      });

      if (!rpcError && rpcData) {
        return (rpcData as unknown) as DashboardData;
      }

      // 2. Fallback to optimized parallel queries if RPC not deployed yet
      const [
        activeJobsRes,
        candidatesRes,
        applicationsRes,
        interviewsRes,
        shortlistedRes,
        aiAnalysesRes,
        funnelRes,
        recentAppsRes,
        aiMetricsRes,
      ] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
        supabase.from("candidates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("interviews").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "shortlisted"),
        supabase.from("cv_screenings").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("applications").select("status").eq("organization_id", orgId),
        supabase
          .from("applications")
          .select("id, status, applied_at, candidates(full_name, email), jobs(title)")
          .eq("organization_id", orgId)
          .order("applied_at", { ascending: false })
          .limit(5),
        supabase.from("cv_screenings").select("match_score, recommendation").eq("organization_id", orgId),
      ]);

      const activeJobs = activeJobsRes.count || 0;
      const totalCandidates = candidatesRes.count || 0;
      const totalApplications = applicationsRes.count || 0;
      const totalInterviews = interviewsRes.count || 0;
      const shortlistedCount = shortlistedRes.count || 0;
      const aiAnalysesCount = aiAnalysesRes.count || 0;

      const funnel = {
        applied: 0,
        screening: 0,
        interview: 0,
        evaluation: 0,
        shortlisted: 0,
        rejected: 0,
        hired: 0,
        total: 0,
      };

      if (funnelRes.data) {
        funnel.total = funnelRes.data.length;
        funnelRes.data.forEach((app) => {
          const s = app.status as keyof typeof funnel;
          if (s in funnel && s !== "total") {
            funnel[s]++;
          }
        });
      }

      const recentApplications = (recentAppsRes.data || []).map((app) => {
        const cand = app.candidates as { full_name?: string; email?: string } | null;
        const job = app.jobs as { title?: string } | null;
        return {
          id: app.id,
          candidateName: cand?.full_name || "Applicant",
          candidateEmail: cand?.email || "N/A",
          jobTitle: job?.title || "Job Position",
          status: app.status,
          createdAt: app.applied_at,
        };
      });

      let averageScore = 0;
      let strongMatches = 0;
      let potentialMatches = 0;
      let needsReview = 0;

      if (aiMetricsRes.data && aiMetricsRes.data.length > 0) {
        let totalScoreSum = 0;
        aiMetricsRes.data.forEach((row) => {
          const score = row.match_score || 0;
          totalScoreSum += score;
          if (score >= 85) strongMatches++;
          else if (score >= 70) potentialMatches++;
          else needsReview++;
        });
        averageScore = Math.round(totalScoreSum / aiMetricsRes.data.length);
      }

      return {
        metrics: {
          activeJobs,
          totalCandidates,
          totalApplications,
          totalInterviews,
          shortlistedCount,
          aiAnalysesCount,
        },
        funnel,
        recentApplications,
        aiSummary: {
          averageScore,
          strongMatches,
          potentialMatches,
          needsReview,
          totalAnalyses: aiAnalysesCount,
        },
      };
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[PERF DASHBOARD] Auth: ${authDuration}ms | DB: ${dbDuration}ms | Total: ${authDuration + dbDuration}ms`);
    }

    return result;
  } catch (err: unknown) {
    console.error("Dashboard query error:", err);
    throw new DatabaseError("Failed to fetch dashboard metrics from database.");
  }
}
