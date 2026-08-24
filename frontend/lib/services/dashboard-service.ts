import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/session";
import { DatabaseError } from "@/lib/utils/errors";
import { measurePerformance } from "@/lib/performance/logger";

export interface DashboardData {
  metrics: {
    activeJobs: number;
    totalApplications: number;
    qualifiedCandidates: number;
    aiInterviews: number;
  };
  funnel: {
    applied: number;
    screening: number;
    assessment: number;
    interview: number;
    evaluation: number;
    shortlisted: number;
    rejected: number;
    knocked_out: number;
    total: number;
  };
  recentApplications: {
    id: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    status: string;
    cvMatch: number | null;
    assessmentScore: number | null;
    interviewScore: number | null;
    createdAt: string;
  }[];
  aiSummary: {
    totalScreened: number;
    averageMatchScore: number;
    qualifiedCount: number;
    knockedOutCount: number;
  };
}

export async function getDashboardDataForOrg(orgId: string): Promise<DashboardData> {
  const { durationMs: authDuration } = await measurePerformance("Auth Check (Dashboard)", async () => {
    return await getCurrentOrganization(orgId);
  });

  const supabase = await createClient();

  try {
    const { result, durationMs: dbDuration } = await measurePerformance("DB Query (Dashboard Summary)", async () => {
      const { data, error } = await supabase.rpc("get_dashboard_summary", { _org_id: orgId });

      if (error || !data) {
        throw new DatabaseError("Failed to fetch dashboard summary from database.");
      }

      // The RPC function returns a JSON object that perfectly matches the DashboardData structure,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = data as any;
      
      return {
        metrics: {
          activeJobs: payload.metrics?.activeJobs || 0,
          totalApplications: payload.metrics?.totalApplications || 0,
          qualifiedCandidates: payload.metrics?.qualifiedCandidates || 0,
          aiInterviews: payload.metrics?.aiInterviews || 0,
        },
        funnel: {
          applied: payload.funnel?.applied || 0,
          screening: payload.funnel?.screening || 0,
          assessment: payload.funnel?.assessment || 0,
          interview: payload.funnel?.interview || 0,
          evaluation: payload.funnel?.evaluation || 0,
          shortlisted: payload.funnel?.shortlisted || 0,
          rejected: payload.funnel?.rejected || 0,
          knocked_out: payload.funnel?.knocked_out || 0,
          total: payload.funnel?.total || 0,
        },
        recentApplications: Array.isArray(payload.recentApplications) ? payload.recentApplications : [],
        aiSummary: {
          totalScreened: payload.aiSummary?.totalScreened || 0,
          averageMatchScore: payload.aiSummary?.averageMatchScore || 0,
          qualifiedCount: payload.aiSummary?.qualifiedCount || 0,
          knockedOutCount: payload.aiSummary?.knockedOutCount || 0,
        },
      } as DashboardData;
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
