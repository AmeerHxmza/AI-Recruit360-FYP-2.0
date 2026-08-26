"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  createJob,
  getJobById,
  getPublicJobBySlug,
  getJobsForOrg,
  updateJob,
  updateJobStatus,
  getJobCounts,
  Job,
  JobFilters,
  CreateJobInput,
  UpdateJobInput,
} from "@/lib/services/job-service";
import { AppError } from "@/lib/utils/errors";
import { JobStatus } from "@/types/database.types";
import { getCachedData, invalidateCachePrefix } from "@/lib/redis/cache";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getJobsAction(filters?: JobFilters): Promise<ActionResult<Job[]>> {
  try {
    const org = await getCurrentOrganization();
    const jobs = await getJobsForOrg(org.id, filters);
    return { success: true, data: jobs };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve job positions." };
  }
}

export async function getJobByIdAction(jobId: string): Promise<ActionResult<Job>> {
  try {
    const org = await getCurrentOrganization();
    const job = await getJobById(org.id, jobId);
    return { success: true, data: job };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Job position not found." };
  }
}

import { withPerfProfile } from "@/lib/performance/logger";

export async function getPublicJobBySlugAction(slug: string): Promise<ActionResult<Job>> {
  return withPerfProfile(`getPublicJobBySlugAction(${slug})`, async () => {
    try {
      const job = await getCachedData(`public:job:slug:${slug}`, async () => {
        return await getPublicJobBySlug(slug);
      }, 300); // 5 min cache
      
      if (!job) {
        return { success: false, error: "Job position not found or no longer active." };
      }
      return { success: true, data: job };
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Failed to load job details." };
    }
  });
}

export async function createJobAction(input: CreateJobInput): Promise<ActionResult<Job>> {
  try {
    const org = await getCurrentOrganization();
    const job = await createJob(org.id, input);

    await invalidateCachePrefix(`public:job:slug:${job.slug}`);
    await invalidateCachePrefix(`org:${org.id}:jobCounts`);
    
    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    return { success: true, data: job };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to create job position. Please try again." };
  }
}

export async function updateJobAction(
  jobId: string,
  input: UpdateJobInput
): Promise<ActionResult<Job>> {
  try {
    const org = await getCurrentOrganization();
    const job = await updateJob(org.id, jobId, input);

    await invalidateCachePrefix(`public:job:slug:${job.slug}`);
    await invalidateCachePrefix(`org:${org.id}:jobCounts`);

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/dashboard");

    return { success: true, data: job };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update job position." };
  }
}

export async function updateJobStatusAction(
  jobId: string,
  status: JobStatus
): Promise<ActionResult<Job>> {
  try {
    const org = await getCurrentOrganization();
    const job = await updateJobStatus(org.id, jobId, status);

    await invalidateCachePrefix(`public:job:slug:${job.slug}`);
    await invalidateCachePrefix(`org:${org.id}:jobCounts`);

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/dashboard");

    return { success: true, data: job };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update job status." };
  }
}

export async function getJobCountsAction(): Promise<
  ActionResult<{ total: number; active: number; draft: number; paused: number; closed: number }>
> {
  try {
    const org = await getCurrentOrganization();
    const counts = await getCachedData(`org:${org.id}:jobCounts`, async () => {
      return await getJobCounts(org.id);
    }, 60); // 1 minute cache
    return { success: true, data: counts };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      data: { total: 0, active: 0, draft: 0, paused: 0, closed: 0 },
    };
  }
}
