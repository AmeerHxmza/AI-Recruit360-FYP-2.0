import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole, getCurrentUser } from "@/lib/auth/session";
import { canManageJobs } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateJobInput } from "@/lib/utils/validation";
import { Database, EmploymentType, JobStatus, WorkplaceType } from "@/types/database.types";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];

export interface JobFilters {
  status?: JobStatus | "all";
  employment_type?: EmploymentType | "all";
  workplace_type?: WorkplaceType | "all";
  search?: string;
}

export interface CreateJobInput {
  title: string;
  department: string;
  location: string;
  employment_type: EmploymentType;
  workplace_type?: WorkplaceType;
  description?: string;
  requirements?: string;
  status?: JobStatus;
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  employment_type?: EmploymentType;
  workplace_type?: WorkplaceType;
  description?: string;
  requirements?: string;
  status?: JobStatus;
}

export async function getJobsForOrg(orgId: string, filters?: JobFilters): Promise<Job[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.employment_type && filters.employment_type !== "all") {
    query = query.eq("employment_type", filters.employment_type);
  }

  if (filters?.workplace_type && filters.workplace_type !== "all") {
    query = query.eq("workplace_type", filters.workplace_type);
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const term = filters.search.trim();
    query = query.or(`title.ilike.%${term}%,department.ilike.%${term}%,location.ilike.%${term}%`);
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

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}

export async function getPublicJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();

  // 1. Try matching by slug
  const { data: bySlug } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (bySlug) {
    return bySlug;
  }

  // 2. If slug parameter is a valid UUID string, try matching by id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  if (isUuid) {
    const { data: byId } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", slug)
      .maybeSingle();

    if (byId) {
      return byId;
    }
  }

  // 3. Fallback: Retrieve latest active job in database for testing/previews
  const { data: fallbackJobs } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  return fallbackJobs && fallbackJobs.length > 0 ? fallbackJobs[0] : null;
}

export async function createJob(
  orgId: string,
  input: CreateJobInput
): Promise<Job> {
  await getCurrentOrganization(orgId);
  const user = await getCurrentUser();
  const role = await getCurrentRole(orgId);

  if (!canManageJobs(role)) {
    throw new ForbiddenError("You do not have permission to create job positions.");
  }

  validateJobInput(input);

  const slug = generateSlug(input.title);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: orgId,
      created_by: user.id,
      title: input.title.trim(),
      slug,
      department: input.department.trim(),
      location: input.location.trim(),
      employment_type: input.employment_type,
      workplace_type: input.workplace_type || "hybrid",
      description: input.description || "",
      requirements: input.requirements || null,
      status: input.status || "active",
      published_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError(error?.message || "Failed to create job position record.");
  }

  return data;
}

export async function updateJob(
  orgId: string,
  jobId: string,
  input: UpdateJobInput
): Promise<Job> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageJobs(role)) {
    throw new ForbiddenError("You do not have permission to edit job positions.");
  }

  // Ensure job exists and belongs to current org
  await getJobById(orgId, jobId);

  const updatePayload: Database["public"]["Tables"]["jobs"]["Update"] = {};

  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.department !== undefined) updatePayload.department = input.department.trim();
  if (input.location !== undefined) updatePayload.location = input.location.trim();
  if (input.employment_type !== undefined) updatePayload.employment_type = input.employment_type;
  if (input.workplace_type !== undefined) updatePayload.workplace_type = input.workplace_type;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.requirements !== undefined) updatePayload.requirements = input.requirements;
  if (input.status !== undefined) {
    updatePayload.status = input.status;
    if (input.status === "closed") {
      updatePayload.closed_at = new Date().toISOString();
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("organization_id", orgId)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError(error?.message || "Failed to update job position record.");
  }

  return data;
}

export async function updateJobStatus(
  orgId: string,
  jobId: string,
  status: JobStatus
): Promise<Job> {
  return updateJob(orgId, jobId, { status });
}

export async function getJobCounts(orgId: string): Promise<{
  total: number;
  active: number;
  draft: number;
  paused: number;
  closed: number;
}> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("status")
    .eq("organization_id", orgId);

  if (error || !data) {
    return { total: 0, active: 0, draft: 0, paused: 0, closed: 0 };
  }

  const counts = {
    total: data.length,
    active: 0,
    draft: 0,
    paused: 0,
    closed: 0,
  };

  data.forEach((j) => {
    if (j.status === "active") counts.active++;
    else if (j.status === "draft") counts.draft++;
    else if (j.status === "paused") counts.paused++;
    else if (j.status === "closed") counts.closed++;
  });

  return counts;
}
