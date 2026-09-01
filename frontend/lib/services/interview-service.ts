import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageInterviews } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { Database, InterviewStatus, InterviewType } from "@/types/database.types";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];
export type InterviewResponse = Database["public"]["Tables"]["interview_responses"]["Row"];

export interface InterviewItemWithDetails extends Interview {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDepartment: string;
}

export async function getInterviewsForOrg(orgId: string, applicationId?: string): Promise<Interview[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("interviews")
    .select("id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve interview sessions.");
  }

  return data || [];
}

export async function getInterviewsForOrgWithDetails(
  orgId: string,
  applicationId?: string
): Promise<InterviewItemWithDetails[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("interviews")
    .select(`
      id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at,
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
      ),
      interview_responses (
        id,
        technical_score,
        communication_score,
        relevance_score
      )
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (applicationId) {
    query = query.eq("application_id", applicationId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  interface InterviewJoinQueryResult {
    id: string;
    organization_id: string;
    application_id: string;
    status: InterviewStatus;
    interview_type: InterviewType;
    total_questions: number;
    questions_answered: number;
    overall_score: number | null;
    started_at: string | null;
    completed_at: string | null;
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
    interview_responses?: {
      id: string;
      technical_score: number | null;
      communication_score: number | null;
      relevance_score: number | null;
    }[];
  }

  const typedData = data as unknown as InterviewJoinQueryResult[];

  return typedData.map((item) => {
    const responses = item.interview_responses || [];
    const responseCount = responses.length;
    
    // Resolve answered questions count
    const resolvedAnswered = item.questions_answered && item.questions_answered > 0
      ? item.questions_answered
      : responseCount > 0
      ? responseCount
      : item.status === "completed"
      ? (item.total_questions || 5)
      : 0;

    // Resolve overall score from responses if needed
    let resolvedScore = item.overall_score;
    if (resolvedScore == null && responseCount > 0) {
      const scores: number[] = [];
      for (const r of responses) {
        const itemScores = [r.technical_score, r.communication_score, r.relevance_score].filter((s): s is number => s != null);
        if (itemScores.length > 0) {
          scores.push(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
        }
      }
      if (scores.length > 0) {
        resolvedScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }

    const candId = item.applications?.candidates?.id || item.applications?.candidate_id || "";

    return {
      id: item.id,
      organization_id: item.organization_id,
      application_id: item.application_id,
      status: item.status,
      interview_type: item.interview_type,
      total_questions: item.total_questions || 5,
      questions_answered: resolvedAnswered,
      overall_score: resolvedScore,
      started_at: item.started_at,
      completed_at: item.completed_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      candidateId: candId,
      candidateName: item.applications?.candidates?.full_name || "Interview Candidate",
      candidateEmail: item.applications?.candidates?.email || "candidate@example.com",
      jobTitle: item.applications?.jobs?.title || "Job Position",
      jobDepartment: item.applications?.jobs?.department || "General",
    };
  });
}

export async function getInterviewById(orgId: string, interviewId: string): Promise<Interview> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at")
    .eq("organization_id", orgId)
    .eq("id", interviewId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Interview session record not found.");
  }

  return data;
}

export async function getInterviewByIdWithDetails(
  orgId: string,
  interviewId: string
): Promise<InterviewItemWithDetails> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at,
      applications (
        candidates (
          full_name,
          email
        ),
        jobs (
          title,
          department
        )
      )
    `)
    .eq("organization_id", orgId)
    .eq("id", interviewId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Interview session record not found.");
  }

  interface InterviewSingleJoinQueryResult {
    id: string;
    organization_id: string;
    application_id: string;
    status: InterviewStatus;
    interview_type: InterviewType;
    total_questions: number;
    questions_answered: number;
    overall_score: number | null;
    started_at: string | null;
    completed_at: string | null;
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

  const item = data as unknown as InterviewSingleJoinQueryResult;

  return {
    id: item.id,
    organization_id: item.organization_id,
    application_id: item.application_id,
    status: item.status,
    interview_type: item.interview_type,
    total_questions: item.total_questions,
    questions_answered: item.questions_answered,
    overall_score: item.overall_score,
    started_at: item.started_at,
    completed_at: item.completed_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    candidateId: item.applications?.candidates?.id || item.applications?.candidate_id || "",
    candidateName: item.applications?.candidates?.full_name || "Interview Candidate",
    candidateEmail: item.applications?.candidates?.email || "candidate@example.com",
    jobTitle: item.applications?.jobs?.title || "Job Position",
    jobDepartment: item.applications?.jobs?.department || "General",
  };
}

export async function createInterview(
  orgId: string,
  input: {
    application_id: string;
    interview_type?: InterviewType;
    total_questions?: number;
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
      interview_type: input.interview_type || "ai_adaptive",
      total_questions: input.total_questions || 8,
      status: "pending",
    })
    .select("id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new DatabaseError(error?.message || "Failed to schedule interview session.");
  }

  return data;
}

export async function updateInterviewStatus(
  orgId: string,
  interviewId: string,
  newStatus: InterviewStatus
): Promise<Interview> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageInterviews(role)) {
    throw new ForbiddenError("You do not have permission to update interview status.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .update({ status: newStatus })
    .eq("organization_id", orgId)
    .eq("id", interviewId)
    .select("id, organization_id, application_id, status, interview_type, total_questions, questions_answered, overall_score, started_at, completed_at, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to update interview status.");
  }

  return data;
}

export async function getInterviewQuestions(interviewId: string): Promise<InterviewQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_questions")
    .select("id, interview_id, question_number, question_text, question_type, source, skill_category, is_follow_up, created_at")
    .eq("interview_id", interviewId)
    .order("question_number", { ascending: true });

  if (error) {
    throw new DatabaseError("Failed to retrieve interview questions.");
  }

  return data || [];
}

export async function getInterviewResponses(interviewId: string): Promise<InterviewResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_responses")
    .select("id, interview_id, question_id, response_text, transcript, technical_score, communication_score, relevance_score, ai_feedback, created_at")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}
