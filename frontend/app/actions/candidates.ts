"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  getCandidatesForOrg,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateApplications,
  getCandidateDocuments,
  getCandidateCounts,
  Candidate,
  CandidateFilters,
  PaginatedCandidatesResult,
  CandidateApplicationItem,
  CandidateDocumentWithUrl,
  CreateCandidateInput,
  UpdateCandidateInput,
} from "@/lib/services/candidate-service";
import {
  getCandidateIntelligence,
  CandidateIntelligence,
} from "@/lib/services/candidate-intelligence-service";
import { AppError } from "@/lib/utils/errors";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getCandidatesAction(
  filters?: CandidateFilters,
): Promise<ActionResult<PaginatedCandidatesResult>> {
  try {
    const org = await getCurrentOrganization();
    const result = await getCandidatesForOrg(org.id, filters);
    return { success: true, data: result };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve candidate directory." };
  }
}

export async function getCandidateByIdAction(
  candidateId: string,
): Promise<ActionResult<Candidate>> {
  try {
    const org = await getCurrentOrganization();
    const candidate = await getCandidateById(org.id, candidateId);
    return { success: true, data: candidate };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Candidate profile not found." };
  }
}

export async function createCandidateAction(
  input: CreateCandidateInput,
): Promise<ActionResult<Candidate>> {
  try {
    const org = await getCurrentOrganization();
    const candidate = await createCandidate(org.id, input);

    revalidatePath("/candidates");
    revalidatePath("/dashboard");

    return { success: true, data: candidate };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to create candidate profile." };
  }
}

export async function updateCandidateAction(
  candidateId: string,
  input: UpdateCandidateInput,
): Promise<ActionResult<Candidate>> {
  try {
    const org = await getCurrentOrganization();
    const candidate = await updateCandidate(org.id, candidateId, input);

    revalidatePath("/candidates");
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/dashboard");

    return { success: true, data: candidate };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update candidate profile." };
  }
}

export async function deleteCandidateAction(
  candidateId: string,
): Promise<ActionResult<boolean>> {
  try {
    const org = await getCurrentOrganization();
    await deleteCandidate(org.id, candidateId);

    revalidatePath("/candidates");
    revalidatePath("/dashboard");

    return { success: true, data: true };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to delete candidate profile." };
  }
}

export async function getCandidateApplicationsAction(
  candidateId: string,
): Promise<ActionResult<CandidateApplicationItem[]>> {
  try {
    const org = await getCurrentOrganization();
    const apps = await getCandidateApplications(org.id, candidateId);
    return { success: true, data: apps };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: true, data: [] };
  }
}

export async function getCandidateDocumentsAction(
  candidateId: string,
): Promise<ActionResult<CandidateDocumentWithUrl[]>> {
  try {
    const org = await getCurrentOrganization();
    const docs = await getCandidateDocuments(org.id, candidateId);
    return { success: true, data: docs };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: true, data: [] };
  }
}

export async function getCandidateCountsAction(): Promise<
  ActionResult<{
    total: number;
    withLocation: number;
    withLinkedin: number;
    recentCount: number;
  }>
> {
  try {
    const org = await getCurrentOrganization();
    const counts = await getCandidateCounts(org.id);
    return { success: true, data: counts };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      data: { total: 0, withLocation: 0, withLinkedin: 0, recentCount: 0 },
    };
  }
}

export async function getCandidateIntelligenceAction(
  candidateId: string,
  applicationId?: string,
): Promise<ActionResult<CandidateIntelligence>> {
  try {
    const data = await getCandidateIntelligence(candidateId, applicationId);
    return { success: true, data };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to fetch candidate intelligence." };
  }
}
