import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageApplications } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError, ValidationError } from "@/lib/utils/errors";
import { ApplicationStatus, Database } from "@/types/database.types";
import { measurePerformance } from "@/lib/performance/logger";

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
    .select("id, organization_id, job_id, candidate_id, status, applied_at, created_at, updated_at")
    .eq("organization_id", orgId)
    .order("applied_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve recruitment applications.");
  }

  return (data || []) as Application[];
}

export async function getApplicationsForOrgWithDetails(
  orgId: string,
  filters?: { stage?: string; search?: string }
): Promise<ApplicationItemWithDetails[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { result } = await measurePerformance("DB Query (getApplicationsForOrgWithDetails)", async () => {
    let query = supabase
      .from("applications")
      .select(`
        id,
        organization_id,
        job_id,
        candidate_id,
        status,
        applied_at,
        created_at,
        updated_at,
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
  });

  return result;
}

export async function getApplicationById(orgId: string, applicationId: string): Promise<Application> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("id, organization_id, job_id, candidate_id, status, applied_at, created_at, updated_at")
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
}): Promise<{ candidate_id: string; application_id: string }> {
  // 1. Mandatory Phone Validation
  if (!input.phone || input.phone.trim().length === 0) {
    throw new ValidationError("Mobile phone number is required to submit your application.");
  }

  // Use Admin Client (service_role) to bypass RLS for public applications
  const supabase = await createAdminClient();
  const emailLower = input.email.trim().toLowerCase();
  const phoneTrimmed = input.phone.trim();

  const { result } = await measurePerformance("Submit Public Candidate Application", async () => {
    // 2. Duplicate Check: Search existing candidates by email or phone
    const { data: existingCands } = await supabase
      .from("candidates")
      .select("id, email, phone")
      .eq("organization_id", input.organization_id)
      .or(`email.eq.${emailLower},phone.eq.${phoneTrimmed}`);

    let candidateId: string | null = null;

    if (existingCands && existingCands.length > 0) {
      candidateId = existingCands[0].id;

      // Duplicate Application Check for the exact same job position
      const candIds = existingCands.map((c) => c.id);
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", input.job_id)
        .in("candidate_id", candIds)
        .maybeSingle();

      if (existingApp) {
        throw new DatabaseError("You have already submitted an application for this job position using this email or mobile number.");
      }
    } else {
      // Create new candidate record
      const { data: newCand, error: candError } = await supabase
        .from("candidates")
        .insert({
          organization_id: input.organization_id,
          full_name: input.full_name.trim(),
          email: emailLower,
          phone: phoneTrimmed,
          location: input.location?.trim() || null,
          linkedin_url: input.linkedin_url?.trim() || null,
          portfolio_url: input.portfolio_url?.trim() || null,
        })
        .select("id")
        .single();

      if (candError || !newCand) {
        throw new DatabaseError(candError?.message || "Failed to create candidate profile.");
      }

      candidateId = newCand.id;
    }

    // 3. Create initial application record
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

    // 4. Save candidate document if file provided
    if (input.cv_file) {
      // Create candidate_documents bucket if it doesn't exist (fails silently if it does)
      await supabase.storage.createBucket("candidate_documents", {
        public: false,
        allowedMimeTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
        fileSizeLimit: 10485760 // 10MB
      });

      const fileName = `${Date.now()}_${input.cv_file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const storagePath = `${input.organization_id}/${applicationId}/${candidateId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("candidate_documents")
        .upload(storagePath, input.cv_file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new DatabaseError("Failed to upload CV to secure storage.");
      }

      await supabase.from("candidate_documents").insert({
        organization_id: input.organization_id,
        candidate_id: candidateId,
        application_id: applicationId,
        document_type: "resume",
        storage_path: storagePath,
        original_filename: input.cv_file.name,
        mime_type: input.cv_file.type || "application/octet-stream",
        file_size: input.cv_file.size,
        extraction_status: "pending",
      });
    }

    return { candidate_id: candidateId, application_id: applicationId };
  });

  return result;
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

export async function getPublicApplicationStatus(applicationId: string): Promise<ApplicationStatus> {
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
