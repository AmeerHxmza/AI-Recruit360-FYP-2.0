import { createClient } from "@/lib/supabase/server";
import {
  getCurrentOrganization,
  getCurrentRole,
  getCurrentUser,
} from "@/lib/auth/session";
import { canManageJobs } from "@/lib/auth/permissions";
import {
  ForbiddenError,
  NotFoundError,
  DatabaseError,
} from "@/lib/utils/errors";
import { validateJobInput } from "@/lib/utils/validation";
import {
  Database,
  EmploymentType,
  JobStatus,
  WorkplaceType,
} from "@/types/database.types";
import { measurePerformance } from "@/lib/performance/logger";

// Extend Job to include our calculated properties without modifying the original Database type
export type Job = Database["public"]["Tables"]["jobs"]["Row"] & {
  applicantsCount?: number;
  qualifiedCount?: number;
};

export interface JobFilters {
  status?: JobStatus | "all";
  employment_type?: EmploymentType | "all";
  workplace_type?: WorkplaceType | "all";
  search?: string;
  page?: number;
  pageSize?: number;
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

export async function getJobsForOrg(
  orgId: string,
  filters?: JobFilters,
): Promise<Job[]> {
  return await (async () => {
    const supabase = await createClient();

    const { result } = await measurePerformance(
      "DB Query (getJobsForOrg)",
      async () => {
        let query = supabase
          .from("jobs")
          .select(
            "id, organization_id, title, slug, department, location, employment_type, workplace_type, status, published_at, created_at, updated_at, applicants:applications(count), qualified:applications(count)",
          )
          .in("qualified.status", [
            "assessment",
            "interview",
            "evaluation",
            "shortlisted",
            "hired",
          ])
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
          const term = filters.search.trim().replace(/[%_\\()]/g, "");
          if (term.length > 0) {
            query = query.or(
              `title.ilike.%${term}%,department.ilike.%${term}%,location.ilike.%${term}%`,
            );
          }
        }

        if (filters?.page && filters?.pageSize) {
          const from = (filters.page - 1) * filters.pageSize;
          const to = from + filters.pageSize - 1;
          query = query.range(from, to);
        } else {
          query = query.limit(100);
        }

        const { data: jobs, error } = await query;

        if (error || !jobs) {
          throw new DatabaseError("Failed to retrieve jobs for organization.");
        }

        if (jobs.length === 0) return [];

        // Count in PostgreSQL, avoiding row-limit truncation and application payloads.
        type JobWithCounts = Job & {
          applicants: { count: number }[];
          qualified: { count: number }[];
        };
        return (jobs as unknown as JobWithCounts[]).map(
          ({ applicants, qualified, ...job }) => ({
            ...job,
            applicantsCount: applicants[0]?.count ?? 0,
            qualifiedCount: qualified[0]?.count ?? 0,
          }),
        );
      },
    );

    return result;
  })();
}

export async function getJobById(orgId: string, jobId: string): Promise<Job> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, organization_id, created_by, title, slug, department, location, employment_type, workplace_type, description, requirements, responsibilities, qualifications, status, published_at, closed_at, created_at, updated_at",
    )
    .eq("organization_id", orgId)
    .eq("id", jobId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Job position not found.");
  }

  return data as Job;
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

  const { result } = await measurePerformance(
    "DB Query (getPublicJobBySlug)",
    async () => {
      // 1. Optimized select for public application route
      const { data: bySlug } = await supabase
        .from("jobs")
        .select(
          "id, organization_id, title, slug, department, location, employment_type, workplace_type, description, requirements, responsibilities, qualifications, status",
        )
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (bySlug) {
        return bySlug as Job;
      }

      return null;
    },
  );

  return result;
}

export async function createJob(
  orgId: string,
  input: CreateJobInput,
): Promise<Job> {
  await getCurrentOrganization(orgId);
  const user = await getCurrentUser();
  const role = await getCurrentRole(orgId);

  if (!canManageJobs(role)) {
    throw new ForbiddenError(
      "You do not have permission to create job positions.",
    );
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
    .select(
      "id, organization_id, created_by, title, slug, department, location, employment_type, workplace_type, description, responsibilities, qualifications, requirements, status, published_at, closed_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DatabaseError(
      error?.message || "Failed to create job position record.",
    );
  }

  return data;
}

export async function updateJob(
  orgId: string,
  jobId: string,
  input: UpdateJobInput,
): Promise<Job> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageJobs(role)) {
    throw new ForbiddenError(
      "You do not have permission to edit job positions.",
    );
  }

  await getJobById(orgId, jobId);

  const updatePayload: Database["public"]["Tables"]["jobs"]["Update"] = {};

  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.department !== undefined)
    updatePayload.department = input.department.trim();
  if (input.location !== undefined)
    updatePayload.location = input.location.trim();
  if (input.employment_type !== undefined)
    updatePayload.employment_type = input.employment_type;
  if (input.workplace_type !== undefined)
    updatePayload.workplace_type = input.workplace_type;
  if (input.description !== undefined)
    updatePayload.description = input.description;
  if (input.requirements !== undefined)
    updatePayload.requirements = input.requirements;
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
    .select(
      "id, organization_id, created_by, title, slug, department, location, employment_type, workplace_type, description, responsibilities, qualifications, requirements, status, published_at, closed_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DatabaseError(
      error?.message || "Failed to update job position record.",
    );
  }

  return data;
}

export async function updateJobStatus(
  orgId: string,
  jobId: string,
  status: JobStatus,
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
    .from("organizations")
    .select(
      "total:jobs(count), active:jobs(count), draft:jobs(count), paused:jobs(count), closed:jobs(count)",
    )
    .eq("id", orgId)
    .eq("active.status", "active")
    .eq("draft.status", "draft")
    .eq("paused.status", "paused")
    .eq("closed.status", "closed")
    .single();
  if (error || !data) throw new DatabaseError("Could not load job totals.");
  const counts = data as unknown as Record<
    "total" | "active" | "draft" | "paused" | "closed",
    { count: number }[]
  >;
  return {
    total: counts.total[0]?.count ?? 0,
    active: counts.active[0]?.count ?? 0,
    draft: counts.draft[0]?.count ?? 0,
    paused: counts.paused[0]?.count ?? 0,
    closed: counts.closed[0]?.count ?? 0,
  };
}
