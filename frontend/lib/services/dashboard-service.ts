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
      // Fetching all necessary components via Supabase optimized parallel queries
      const [
        activeJobsRes,
        applicationsRes,
        qualifiedAppsRes,
        interviewsRes,
        funnelRes,
        recentAppsRes,
        cvScreeningsRes,
      ] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("organization_id", orgId).in("status", ["assessment", "interview", "evaluation", "shortlisted"]),
        supabase.from("interviews").select("id", { count: "exact", head: true }).eq("organization_id", orgId).neq("status", "abandoned").neq("status", "cancelled"),
        supabase.from("applications").select("status").eq("organization_id", orgId),
        supabase
          .from("applications")
          .select(`
            id, 
            status, 
            applied_at, 
            candidates(full_name, email), 
            jobs(title),
            cv_screenings(match_score),
            assessments(score),
            interviews(overall_score)
          `)
          .eq("organization_id", orgId)
          .order("applied_at", { ascending: false })
          .limit(8),
        supabase.from("cv_screenings").select("match_score").eq("organization_id", orgId),
      ]);

      const activeJobs = activeJobsRes.count || 0;
      const totalApplications = applicationsRes.count || 0;
      const qualifiedCandidates = qualifiedAppsRes.count || 0;
      const aiInterviews = interviewsRes.count || 0;

      const funnel = {
        applied: 0,
        screening: 0,
        assessment: 0,
        interview: 0,
        evaluation: 0,
        shortlisted: 0,
        rejected: 0,
        knocked_out: 0,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recentApplications = (recentAppsRes.data || []).map((app: any) => {
        const cand = app.candidates;
        const job = app.jobs;
        
        // Extract array values from joined tables, safely fall back to null
        const cvs = Array.isArray(app.cv_screenings) ? app.cv_screenings[0] : app.cv_screenings;
        const asst = Array.isArray(app.assessments) ? app.assessments[0] : app.assessments;
        const intv = Array.isArray(app.interviews) ? app.interviews[0] : app.interviews;

        return {
          id: app.id,
          candidateName: cand?.full_name || "Applicant",
          candidateEmail: cand?.email || "N/A",
          jobTitle: job?.title || "Job Position",
          status: app.status,
          cvMatch: cvs?.match_score ?? null,
          assessmentScore: asst?.score ?? null,
          interviewScore: intv?.overall_score ?? null,
          createdAt: app.applied_at,
        };
      });

      const totalScreened = cvScreeningsRes.data?.length || 0;
      let averageMatchScore = 0;
      let qualifiedCount = 0;
      const knockedOutCount = funnel.knocked_out;

      if (totalScreened > 0) {
        let totalScoreSum = 0;
        cvScreeningsRes.data!.forEach((row) => {
          const score = row.match_score || 0;
          totalScoreSum += score;
          if (score >= 70) qualifiedCount++;
        });
        averageMatchScore = Math.round(totalScoreSum / totalScreened);
      }

      return {
        metrics: {
          activeJobs,
          totalApplications,
          qualifiedCandidates,
          aiInterviews,
        },
        funnel,
        recentApplications,
        aiSummary: {
          totalScreened,
          averageMatchScore,
          qualifiedCount,
          knockedOutCount,
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
