import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageInterviews } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { Database, InterviewType } from "@/types/database.types";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];
export type InterviewResponse = Database["public"]["Tables"]["interview_responses"]["Row"];

export async function getInterviewsForOrg(orgId: string, applicationId?: string): Promise<Interview[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("interviews")
    .select("*")
    .eq("organization_id", orgId)
    .order("scheduled_at", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve interview sessions.");
  }

  return data || [];
}

export async function getInterviewById(orgId: string, interviewId: string): Promise<Interview> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", interviewId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Interview session record not found.");
  }

  return data;
}

export async function createInterview(
  orgId: string,
  input: {
    application_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    interview_type?: InterviewType;
  }
): Promise<Interview> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageInterviews(role)) {
    throw new ForbiddenError("You do not have permission to schedule interviews.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .insert({
      organization_id: orgId,
      application_id: input.application_id,
      scheduled_at: input.scheduled_at,
      duration_minutes: input.duration_minutes || 45,
      interview_type: input.interview_type || "ai_adaptive",
      status: "scheduled",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to schedule interview session.");
  }

  return data;
}

export async function getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("interview_id", interviewId)
    .order("question_order", { ascending: true });

  if (error) {
    throw new DatabaseError("Failed to retrieve interview questions.");
  }

  return data || [];
}
