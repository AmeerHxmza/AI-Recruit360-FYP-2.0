import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageApplications } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { ApplicationStatus, Database } from "@/types/database.types";

export type Application = Database["public"]["Tables"]["applications"]["Row"];

export interface ApplicationItemWithDetails extends Application {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDepartment: string;
}

interface ApplicationJoinQueryResult {
  id: string;
  organization_id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  applied_at: string;
  screening_started_at: string | null;
  screening_completed_at: string | null;
  assessment_started_at: string | null;
  assessment_completed_at: string | null;
  interview_started_at: string | null;
  interview_completed_at: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
  candidates: {
    full_name: string;
    email: string;
  } | null;
  jobs: {
    title: string;
    department: string | null;
  } | null;
}

export async function getApplicationsForOrg(orgId: string, jobId?: string): Promise<Application[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select("*")
    .eq("organization_id", orgId)
    .order("applied_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve recruitment applications.");
  }

  return data || [];
}

export async function getApplicationsForOrgWithDetails(
  orgId: string,
  filters?: { stage?: string; search?: string }
): Promise<ApplicationItemWithDetails[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(`
      *,
      candidates (
        full_name,
        email
      ),
      jobs (
        title,
        department
      )
    `)
    .eq("organization_id", orgId)
    .order("applied_at", { ascending: false });

  if (filters?.stage && filters.stage !== "All") {
    query = query.eq("status", filters.stage.toLowerCase() as ApplicationStatus);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const typedData = data as unknown as ApplicationJoinQueryResult[];

  let results: ApplicationItemWithDetails[] = typedData.map((item) => ({
    id: item.id,
    organization_id: item.organization_id,
    job_id: item.job_id,
    candidate_id: item.candidate_id,
    status: item.status,
    applied_at: item.applied_at,
    screening_started_at: item.screening_started_at,
    screening_completed_at: item.screening_completed_at,
    assessment_started_at: item.assessment_started_at,
    assessment_completed_at: item.assessment_completed_at,
    interview_started_at: item.interview_started_at,
    interview_completed_at: item.interview_completed_at,
    finalized_at: item.finalized_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    candidateName: item.candidates?.full_name || "Applicant",
    candidateEmail: item.candidates?.email || "candidate@example.com",
    jobTitle: item.jobs?.title || "Job Position",
    jobDepartment: item.jobs?.department || "General",
  }));

  if (filters?.search && filters.search.trim().length > 0) {
    const term = filters.search.trim().toLowerCase();
    results = results.filter(
      (app) =>
        app.candidateName.toLowerCase().includes(term) ||
        app.candidateEmail.toLowerCase().includes(term) ||
        app.jobTitle.toLowerCase().includes(term) ||
        app.jobDepartment.toLowerCase().includes(term)
    );
  }

  return results;
}

export async function getApplicationById(orgId: string, applicationId: string): Promise<Application> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Application record not found.");
  }

  return data;
}

export async function submitPublicCandidateApplication(input: {
  job_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cv_text?: string;
}): Promise<{ candidate_id: string; application_id: string }> {
  const supabase = await createClient();

  // 1. Insert or reuse candidate record
  const { data: candData, error: candError } = await supabase
    .from("candidates")
    .insert({
      organization_id: input.organization_id,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      location: input.location?.trim() || null,
      linkedin_url: input.linkedin_url?.trim() || null,
      portfolio_url: input.portfolio_url?.trim() || null,
    })
    .select("id")
    .single();

  if (candError || !candData) {
    throw new DatabaseError(candError?.message || "Failed to create candidate record.");
  }

  const candidateId = candData.id;

  // 2. Insert application record
  const { data: appData, error: appError } = await supabase
    .from("applications")
    .insert({
      organization_id: input.organization_id,
      job_id: input.job_id,
      candidate_id: candidateId,
      status: "applied",
    })
    .select("id")
    .single();

  if (appError || !appData) {
    throw new DatabaseError(appError?.message || "Failed to submit job application.");
  }

  const applicationId = appData.id;

  // 3. Save candidate document if text provided
  if (input.cv_text && input.cv_text.trim().length > 0) {
    const storagePath = `${input.organization_id}/${applicationId}/${candidateId}/resume.txt`;
    await supabase.from("candidate_documents").insert({
      organization_id: input.organization_id,
      candidate_id: candidateId,
      application_id: applicationId,
      document_type: "resume",
      storage_path: storagePath,
      original_filename: "resume.txt",
      mime_type: "text/plain",
      file_size: Buffer.byteLength(input.cv_text, "utf-8"),
      extracted_text: input.cv_text.trim(),
      extraction_status: "completed",
    });
  }

  return { candidate_id: candidateId, application_id: applicationId };
}

export async function createApplication(
  orgId: string,
  input: {
    job_id: string;
    candidate_id: string;
  }
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageApplications(role)) {
    throw new ForbiddenError("You do not have permission to process candidate applications.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .insert({
      organization_id: orgId,
      job_id: input.job_id,
      candidate_id: input.candidate_id,
      status: "applied",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError(error?.message || "Failed to create application record.");
  }

  return data;
}

export async function updateApplicationStatus(
  orgId: string,
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageApplications(role)) {
    throw new ForbiddenError("You do not have permission to update application status.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("organization_id", orgId)
    .eq("id", applicationId)
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to update application pipeline status.");
  }

  return data;
}
