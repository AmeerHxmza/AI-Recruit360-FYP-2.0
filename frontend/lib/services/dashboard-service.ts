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
    candidateId: string;
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

import { getCachedData } from "@/lib/redis/cache";

export async function getDashboardDataForOrg(orgId: string): Promise<DashboardData> {
  await measurePerformance("Auth Check (Dashboard)", async () => {
    return await getCurrentOrganization(orgId);
  }, "auth");

  const supabase = await createClient();

  try {
    const result = await getCachedData(`org:${orgId}:dashboard`, async () => {
      const { result: dbData } = await measurePerformance("DB Query (Dashboard Summary)", async () => {
        // Fetch all required data concurrently
        const [jobsRes, appsRes, screenRes, intRes, asstRes, evalRes] = await Promise.all([
          supabase.from("jobs").select("id, status").eq("organization_id", orgId),
          supabase.from("applications").select(`
            id, candidate_id, job_id, status, applied_at,
            candidates (full_name, email),
            jobs (title)
          `).eq("organization_id", orgId).order("applied_at", { ascending: false }),
          supabase.from("cv_screenings").select("application_id, match_score, recommendation").eq("organization_id", orgId),
          supabase.from("interviews").select("application_id, overall_score, status").eq("organization_id", orgId),
          supabase.from("assessments").select("application_id, score, status").eq("organization_id", orgId),
          supabase.from("final_evaluations").select("application_id, overall_score, recommendation").eq("organization_id", orgId),
        ]);

        const jobs = jobsRes.data || [];
        const apps = appsRes.data || [];
        const screenings = screenRes.data || [];
        const interviews = intRes.data || [];
        const assessments = asstRes.data || [];
        const evaluations = evalRes.data || [];

        // Build quick lookup maps
        const screenMap = new Map(screenings.map(s => [s.application_id, s]));
        const asstMap = new Map(assessments.map(a => [a.application_id, a]));
        const intMap = new Map(interviews.map(i => [i.application_id, i]));
        const evalMap = new Map(evaluations.map(e => [e.application_id, e]));

        const activeJobs = jobs.filter(j => j.status === "active").length;
        const totalApplications = apps.length;
        const qualifiedCandidates = apps.filter(a =>
          ["assessment", "interview", "evaluation", "shortlisted", "hired"].includes(a.status)
        ).length;
        const aiInterviews = interviews.filter(i => i.status !== "abandoned").length;

        const funnel = {
          applied: totalApplications,
          screening: apps.filter(a => screenMap.has(a.id) || ["screening", "knocked_out", "assessment", "assessment_failed", "interview", "evaluation", "shortlisted", "rejected", "hired"].includes(a.status)).length,
          assessment: apps.filter(a => asstMap.has(a.id) || ["assessment", "assessment_failed", "interview", "evaluation", "shortlisted", "hired"].includes(a.status)).length,
          interview: apps.filter(a => intMap.has(a.id) || ["interview", "evaluation", "shortlisted", "hired"].includes(a.status)).length,
          evaluation: apps.filter(a => evalMap.has(a.id) || ["evaluation", "shortlisted", "hired"].includes(a.status)).length,
          shortlisted: apps.filter(a => ["shortlisted", "hired"].includes(a.status)).length,
          rejected: apps.filter(a => a.status === "rejected").length,
          knocked_out: apps.filter(a => a.status === "knocked_out" || a.status === "assessment_failed").length,
          total: totalApplications,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentApplications = apps.slice(0, 8).map((a: any) => {
          const sc = screenMap.get(a.id);
          const ast = asstMap.get(a.id);
          const it = intMap.get(a.id);
          const ev = evalMap.get(a.id);

          return {
            id: a.id,
            candidateId: a.candidate_id || a.candidates?.id || "",
            candidateName: a.candidates?.full_name || "Applicant",
            candidateEmail: a.candidates?.email || "N/A",
            jobTitle: a.jobs?.title || "Position",
            status: a.status,
            cvMatch: sc ? Number(sc.match_score) : null,
            assessmentScore: ast ? Number(ast.score) : null,
            interviewScore: ev ? Number(ev.overall_score) : (it ? Number(it.overall_score) : null),
            createdAt: a.applied_at,
          };
        });

        const totalScreened = screenings.length;
        const averageMatchScore = totalScreened > 0
          ? Math.round(screenings.reduce((acc, s) => acc + (Number(s.match_score) || 0), 0) / totalScreened)
          : 0;
        const qualifiedCount = screenings.filter(s => s.recommendation === "strong_match" || s.recommendation === "match").length;
        const knockedOutCount = screenings.filter(s => s.recommendation === "no_match" || s.recommendation === "borderline").length;

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
        } as DashboardData;
      }, "db");

      return dbData;
    }, 5); // 5 seconds cache for real-time responsiveness

    return result;
  } catch (err: unknown) {
    console.error("Dashboard query error:", err);
    throw new DatabaseError("Failed to fetch dashboard metrics from database.");
  }
}
