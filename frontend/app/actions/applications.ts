"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  getApplicationsForOrgWithDetails,
  createApplication,
  submitPublicCandidateApplication,
  updateApplicationStatus,
  getPublicApplicationStatus,
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

import { withPerfProfile } from "@/lib/performance/logger";

export async function submitPublicApplicationAction(
  formData: FormData
): Promise<ActionResult<{ candidate_id: string; application_id: string }>> {
  return withPerfProfile("submitPublicApplicationAction", async () => {
    try {
      const job_id = formData.get("job_id") as string;
      const organization_id = formData.get("organization_id") as string;
      const full_name = formData.get("full_name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const location = formData.get("location") as string | undefined;
      const linkedin_url = formData.get("linkedin_url") as string | undefined;
      const portfolio_url = formData.get("portfolio_url") as string | undefined;
      const cv_file = formData.get("cv_file") as File | null;

      if (!job_id || !organization_id || !full_name || !email || !phone) {
        return { success: false, error: "Missing mandatory fields." };
      }

      const result = await submitPublicCandidateApplication({
        job_id,
        organization_id,
        full_name,
        email,
        phone,
        location,
        linkedin_url,
        portfolio_url,
        cv_file: cv_file || undefined,
      });

      revalidatePath("/applications");
      revalidatePath("/candidates");
      revalidatePath("/dashboard");

      return { success: true, data: result };
    } catch (err: unknown) {
      console.error("submitPublicApplicationAction Error:", err);
      if (err instanceof AppError) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Failed to submit application. Please check your information." };
    }
  });
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

export async function getPublicApplicationStatusAction(applicationId: string): Promise<ActionResult<ApplicationStatus>> {
  try {
    const status = await getPublicApplicationStatus(applicationId);
    return { success: true, data: status };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve application status." };
  }
}
