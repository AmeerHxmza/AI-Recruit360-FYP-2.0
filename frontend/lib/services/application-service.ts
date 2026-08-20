import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageApplications } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { ApplicationStatus, Database } from "@/types/database.types";

export type Application = Database["public"]["Tables"]["applications"]["Row"];

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

export async function createApplication(
  orgId: string,
  input: {
    job_id: string;
    candidate_id: string;
    source?: string;
  }
): Promise<Application> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageApplications(role)) {
    throw new ForbiddenError("You do not have permission to process candidate applications.");
  }

  const supabase = await createClient();

  // The database composite foreign keys enforce that job_id and candidate_id belong to orgId
  const { data, error } = await supabase
    .from("applications")
    .insert({
      organization_id: orgId,
      job_id: input.job_id,
      candidate_id: input.candidate_id,
      status: "applied",
      source: input.source || "direct",
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.message.includes("unique")) {
      throw new DatabaseError("This candidate has already applied to this job position.");
    }
    throw new DatabaseError("Failed to create application record.");
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
