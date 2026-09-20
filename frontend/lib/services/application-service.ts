import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageApplications } from "@/lib/auth/permissions";
import {
  ForbiddenError,
  NotFoundError,
  DatabaseError,
  ValidationError,
} from "@/lib/utils/errors";
import { ApplicationStatus, Database } from "@/types/database.types";
import { validateEmail } from "@/lib/utils/validation";

export type Application = Database["public"]["Tables"]["applications"]["Row"];

export interface ApplicationItemWithDetails extends Application {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDepartment: string;
}

export async function getApplicationsForOrg(
  orgId: string,
  jobId?: string,
  page?: number,
  pageSize?: number,
): Promise<Application[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "id, organization_id, job_id, candidate_id, status, applied_at, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .order("applied_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  if (page && pageSize) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve recruitment applications.");
  }

  return (data || []) as Application[];
}

export async function getApplicationsForOrgWithDetails(
  orgId: string,
  filters?: {
    stage?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  },
): Promise<ApplicationItemWithDetails[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_workspace_applications", {
    _org: orgId,
    _stage: filters?.stage || "All",
    _search: (filters?.search || "").slice(0, 200),
    _page: filters?.page || 1,
    _size: filters?.pageSize || 50,
  });
  if (error || !data)
    throw new DatabaseError("Could not load applications. Please retry.");
  return data as unknown as ApplicationItemWithDetails[];
}

export async function getApplicationById(
  orgId: string,
  applicationId: string,
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, organization_id, job_id, candidate_id, status, applied_at, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Application record not found.");
  }

  return data as Application;
}

export async function submitPublicCandidateApplication(input: {
  job_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cv_file?: File;
  submission_key?: string;
}): Promise<{ candidate_id: string; application_id: string }> {
  const email = validateEmail(input.email);
  if (
    !input.full_name?.trim() ||
    input.full_name.length > 120 ||
    !input.phone?.trim() ||
    input.phone.length > 40
  ) {
    throw new ValidationError("Enter your name and a valid phone number.");
  }
  const file = input.cv_file;
  if (!file || file.size === 0 || file.size > 4 * 1024 * 1024)
    throw new ValidationError("Upload a PDF or DOCX file up to 4 MB.");
  const mime = file.name.toLowerCase().endsWith(".pdf")
    ? "application/pdf"
    : file.name.toLowerCase().endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "";
  if (!mime)
    throw new ValidationError("Only PDF and DOCX resumes are supported.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (
    mime === "application/pdf"
      ? new TextDecoder().decode(bytes.slice(0, 4)) !== "%PDF"
      : bytes[0] !== 0x50 || bytes[1] !== 0x4b
  ) {
    throw new ValidationError("The file contents do not match its extension.");
  }
  for (const value of [input.linkedin_url, input.portfolio_url]) {
    if (value && !/^https?:\/\//i.test(value))
      throw new ValidationError(
        "Profile links must start with https:// or http://.",
      );
  }
  const supabase = await createAdminClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("id, organization_id, status")
    .eq("id", input.job_id)
    .eq("status", "active")
    .single();
  if (!job)
    throw new ValidationError("This job is no longer accepting applications.");
  const submissionKey = input.submission_key;
  if (!submissionKey || !/^[0-9a-f-]{36}$/i.test(submissionKey))
    throw new ValidationError(
      "Invalid submission. Reload the form and try again.",
    );
  const { data: previous } = await supabase
    .from("applications")
    .select("id, candidate_id")
    .eq("submission_key", submissionKey)
    .eq("job_id", job.id)
    .maybeSingle();
  if (previous)
    return { application_id: previous.id, candidate_id: previous.candidate_id };
  const storagePath = `${job.organization_id}/${submissionKey}/${crypto.randomUUID()}.${mime === "application/pdf" ? "pdf" : "docx"}`;
  const { error: uploadError } = await supabase.storage
    .from("candidate_documents")
    .upload(storagePath, file, { contentType: mime });
  if (uploadError)
    throw new DatabaseError("Could not upload your resume. Please retry.");
  const { data, error } = await supabase.rpc("submit_candidate_application", {
    payload: {
      job_id: job.id,
      submission_key: submissionKey,
      full_name: input.full_name.trim(),
      email,
      phone: input.phone.trim(),
      location: input.location?.trim() || null,
      linkedin_url: input.linkedin_url || null,
      portfolio_url: input.portfolio_url || null,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: mime,
      file_size: file.size,
    },
  });
  if (error || !data) {
    // A transport failure may occur after commit. Preserve files unless absence is confirmed.
    const { data: committed, error: lookupError } = await supabase
      .from("applications")
      .select("id, candidate_id")
      .eq("submission_key", submissionKey)
      .maybeSingle();
    if (committed)
      return {
        application_id: committed.id,
        candidate_id: committed.candidate_id,
      };
    if (!lookupError)
      await supabase.storage.from("candidate_documents").remove([storagePath]);
    throw new DatabaseError(
      error?.message ||
        "Could not save your application. Retry with the same form.",
    );
  }
  return data as { candidate_id: string; application_id: string };
}

export async function createApplication(
  orgId: string,
  input: {
    job_id: string;
    candidate_id: string;
  },
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageApplications(role)) {
    throw new ForbiddenError(
      "You do not have permission to process candidate applications.",
    );
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
    .select(
      "id, organization_id, job_id, candidate_id, status, applied_at, screening_started_at, screening_completed_at, assessment_started_at, assessment_completed_at, interview_started_at, interview_completed_at, finalized_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DatabaseError(
      error?.message || "Failed to create application record.",
    );
  }

  return data;
}

export async function updateApplicationStatus(
  orgId: string,
  applicationId: string,
  newStatus: ApplicationStatus,
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageApplications(role)) {
    throw new ForbiddenError(
      "You do not have permission to update application status.",
    );
  }

  if (!["shortlisted", "rejected", "hired"].includes(newStatus))
    throw new ValidationError(
      "Recruiters can shortlist, reject, or hire; assessment stages are managed by the workflow.",
    );
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("applications")
    .select("status")
    .eq("organization_id", orgId)
    .eq("id", applicationId)
    .single();
  if (!current) throw new NotFoundError("Application not found.");
  if (
    newStatus === "shortlisted" &&
    !["evaluation", "shortlisted"].includes(current.status)
  )
    throw new ValidationError(
      "Complete the candidate evaluation before shortlisting.",
    );
  if (
    newStatus === "hired" &&
    !["shortlisted", "hired"].includes(current.status)
  )
    throw new ValidationError(
      "Shortlist the candidate before marking them hired.",
    );
  const { data, error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("status", current.status)
    .eq("organization_id", orgId)
    .eq("id", applicationId)
    .select(
      "id, organization_id, job_id, candidate_id, status, applied_at, screening_started_at, screening_completed_at, assessment_started_at, assessment_completed_at, interview_started_at, interview_completed_at, finalized_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to update application pipeline status.");
  }

  return data;
}

export async function getPublicApplicationStatus(
  applicationId: string,
): Promise<ApplicationStatus> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Application not found.");
  }

  return data.status as ApplicationStatus;
}
