"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  getApplicationsForOrgWithDetails,
  createApplication,
  submitPublicCandidateApplication,
  updateApplicationStatus,
  ApplicationItemWithDetails,
  Application,
} from "@/lib/services/application-service";
import { ApplicationStatus } from "@/types/database.types";
import { AppError } from "@/lib/utils/errors";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getApplicationsAction(filters?: {
  stage?: string;
  search?: string;
}): Promise<ActionResult<ApplicationItemWithDetails[]>> {
  try {
    const org = await getCurrentOrganization();
    const apps = await getApplicationsForOrgWithDetails(org.id, filters);
    return { success: true, data: apps };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve applications." };
  }
}

export async function submitPublicApplicationAction(input: {
  job_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cv_text?: string;
}): Promise<ActionResult<{ candidate_id: string; application_id: string }>> {
  try {
    const result = await submitPublicCandidateApplication(input);

    revalidatePath("/applications");
    revalidatePath("/candidates");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to submit application. Please check your information." };
  }
}

export async function createApplicationAction(input: {
  job_id: string;
  candidate_id: string;
}): Promise<ActionResult<Application>> {
  try {
    const org = await getCurrentOrganization();
    const app = await createApplication(org.id, input);

    revalidatePath("/applications");
    revalidatePath("/candidates");
    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    return { success: true, data: app };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to submit job application." };
  }
}

export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<ActionResult<Application>> {
  try {
    const org = await getCurrentOrganization();
    const app = await updateApplicationStatus(org.id, applicationId, newStatus);

    revalidatePath("/applications");
    revalidatePath("/candidates");
    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    return { success: true, data: app };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update application status." };
  }
}
