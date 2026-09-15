import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageEvaluations } from "@/lib/auth/permissions";
import {
  ForbiddenError,
  NotFoundError,
  DatabaseError,
} from "@/lib/utils/errors";
import { Database, FinalRecommendation } from "@/types/database.types";
import { measurePerformance } from "@/lib/performance/logger";

export type FinalEvaluation =
  Database["public"]["Tables"]["final_evaluations"]["Row"];

export interface FinalEvaluationItemWithDetails extends FinalEvaluation {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDepartment: string;
}

export async function getEvaluationsForOrg(
  orgId: string,
  applicationId?: string,
): Promise<FinalEvaluation[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("final_evaluations")
    .select(
      "id, organization_id, application_id, cv_score, assessment_score, interview_score, overall_score, recommendation, ai_summary, model, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve candidate evaluations.");
  }

  return (data || []) as FinalEvaluation[];
}

export async function getEvaluationsForOrgWithDetails(
  orgId: string,
  applicationId?: string,
): Promise<FinalEvaluationItemWithDetails[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { result } = await measurePerformance(
    "DB Query (getEvaluationsForOrgWithDetails)",
    async () => {
      let query = supabase
        .from("final_evaluations")
        .select(
          `
        id,
        organization_id,
        application_id,
        cv_score,
        assessment_score,
        interview_score,
        overall_score,
        recommendation,
        strengths,
        weaknesses,
        evidence,
        ai_summary,
        model,
        created_at,
        updated_at,
        applications (
          candidate_id,
          candidates (
            id,
            full_name,
            email
          ),
          jobs (
            title,
            department
          )
        )
      `,
        )
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (applicationId) {
        query = query.eq("application_id", applicationId);
      }

      const { data, error } = await query;

      if (error || !data) {
        return [];
      }

      interface EvaluationJoinQueryResult {
        id: string;
        organization_id: string;
        application_id: string;
        cv_score: number | null;
        assessment_score: number | null;
        interview_score: number | null;
        overall_score: number | null;
        recommendation: FinalRecommendation | null;
        strengths: unknown;
        weaknesses: unknown;
        evidence: unknown;
        ai_summary: string | null;
        model: string | null;
        created_at: string;
        updated_at: string;
        applications: {
          candidate_id?: string;
          candidates: {
            id?: string;
            full_name: string;
            email: string;
          } | null;
          jobs: {
            title: string;
            department: string | null;
          } | null;
        } | null;
      }

      const typedData = data as unknown as EvaluationJoinQueryResult[];

      return typedData.map((item) => ({
        id: item.id,
        organization_id: item.organization_id,
        application_id: item.application_id,
        cv_score: item.cv_score,
        assessment_score: item.assessment_score,
        interview_score: item.interview_score,
        overall_score: item.overall_score,
        recommendation: item.recommendation,
        strengths: item.strengths as FinalEvaluation["strengths"],
        weaknesses: item.weaknesses as FinalEvaluation["weaknesses"],
        evidence: item.evidence as FinalEvaluation["evidence"],
        ai_summary: item.ai_summary,
        model: item.model,
        created_at: item.created_at,
        updated_at: item.updated_at,
        candidateId:
          item.applications?.candidates?.id ||
          item.applications?.candidate_id ||
          "",
        candidateName: item.applications?.candidates?.full_name || "Candidate",
        candidateEmail:
          item.applications?.candidates?.email || "candidate@example.com",
        jobTitle: item.applications?.jobs?.title || "Job Position",
        jobDepartment: item.applications?.jobs?.department || "General",
      }));
    },
  );

  return result;
}

export async function getEvaluationById(
  orgId: string,
  evaluationId: string,
): Promise<FinalEvaluation> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("final_evaluations")
    .select(
      "id, organization_id, application_id, cv_score, assessment_score, interview_score, overall_score, recommendation, strengths, weaknesses, evidence, ai_summary, model, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .eq("id", evaluationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Evaluation record not found.");
  }

  return data as FinalEvaluation;
}

export async function createEvaluation(
  orgId: string,
  input: {
    application_id: string;
    cv_score?: number;
    assessment_score?: number;
    interview_score?: number;
    overall_score?: number;
    recommendation?: FinalRecommendation;
    ai_summary?: string;
  },
): Promise<FinalEvaluation> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageEvaluations(role)) {
    throw new ForbiddenError(
      "You do not have permission to submit candidate evaluations.",
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("final_evaluations")
    .insert({
      organization_id: orgId,
      application_id: input.application_id,
      cv_score: input.cv_score || null,
      assessment_score: input.assessment_score || null,
      interview_score: input.interview_score || null,
      overall_score: input.overall_score || null,
      recommendation: input.recommendation || null,
      ai_summary: input.ai_summary || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError(
      error?.message || "Failed to record evaluation submit.",
    );
  }

  return data;
}
