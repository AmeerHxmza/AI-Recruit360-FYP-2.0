import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageEvaluations } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { Database, EvaluationRecommendation, EvaluationStatus } from "@/types/database.types";

export type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"];
export type EvaluationCriteriaScore = Database["public"]["Tables"]["evaluation_criteria_scores"]["Row"];

export async function getEvaluationsForOrg(orgId: string, applicationId?: string): Promise<Evaluation[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("evaluations")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve candidate evaluations.");
  }

  return data || [];
}

export async function getEvaluationById(orgId: string, evaluationId: string): Promise<Evaluation> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", evaluationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Evaluation record not found.");
  }

  return data;
}

export async function createEvaluation(
  orgId: string,
  input: {
    application_id: string;
    interview_id?: string;
    overall_score?: number;
    recommendation?: EvaluationRecommendation;
    notes?: string;
    status?: EvaluationStatus;
  }
): Promise<Evaluation> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageEvaluations(role)) {
    throw new ForbiddenError("You do not have permission to submit candidate evaluations.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      organization_id: orgId,
      application_id: input.application_id,
      interview_id: input.interview_id || null,
      overall_score: input.overall_score || null,
      recommendation: input.recommendation || null,
      notes: input.notes || null,
      status: input.status || "completed",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to record evaluation submit.");
  }

  return data;
}
