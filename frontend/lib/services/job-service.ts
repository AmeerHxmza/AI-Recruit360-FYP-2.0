import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageJobs } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateJobInput } from "@/lib/utils/validation";
import { Database, EmploymentType, JobStatus, WorkplaceType } from "@/types/database.types";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];

export async function getJobsForOrg(orgId: string, statusFilter?: JobStatus): Promise<Job[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Failed to retrieve jobs for organization.");
  }

  return data || [];
}

export async function getJobById(orgId: string, jobId: string): Promise<Job> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", jobId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Job position not found.");
  }

  return data;
}

export async function createJob(
  orgId: string,
  input: {
    title: string;
    department: string;
    location: string;
    employment_type: EmploymentType;
    workplace_type?: WorkplaceType;
    description?: string;
    requirements?: string;
  }
): Promise<Job> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageJobs(role)) {
    throw new ForbiddenError("You do not have permission to create job positions.");
  }

  validateJobInput(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: orgId,
      title: input.title.trim(),
      department: input.department.trim(),
      location: input.location.trim(),
      employment_type: input.employment_type,
      workplace_type: input.workplace_type || "hybrid",
      description: input.description || null,
      requirements: input.requirements || null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to create job position record.");
  }

  return data;
}
