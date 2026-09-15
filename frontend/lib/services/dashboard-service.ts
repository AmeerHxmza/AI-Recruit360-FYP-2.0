import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/session";
import { DatabaseError } from "@/lib/utils/errors";

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

export async function getDashboardDataForOrg(
  orgId: string,
): Promise<DashboardData> {
  await getCurrentOrganization(orgId);
  const db = await createClient();
  const { data, error } = await db.rpc("workspace_dashboard", { _org: orgId });
  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") {
      throw new DatabaseError(
        "Database setup is incomplete: workspace_dashboard is unavailable. Apply pending Supabase migrations 02–07 in order using supabase/README.md. Do not reset the database or rerun 01_schema.sql.",
      );
    }
    throw new DatabaseError("Could not load dashboard metrics. Please retry.");
  }
  if (!data)
    throw new DatabaseError("Could not load dashboard metrics. Please retry.");
  return data as unknown as DashboardData;
}
