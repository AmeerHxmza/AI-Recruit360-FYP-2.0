"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  getEvaluationsForOrgWithDetails,
  createEvaluation,
  FinalEvaluationItemWithDetails,
  FinalEvaluation,
} from "@/lib/services/evaluation-service";
import { FinalRecommendation } from "@/types/database.types";
import { AppError } from "@/lib/utils/errors";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getEvaluationsAction(): Promise<ActionResult<FinalEvaluationItemWithDetails[]>> {
  try {
    const org = await getCurrentOrganization();
    const evaluations = await getEvaluationsForOrgWithDetails(org.id);
    return { success: true, data: evaluations };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve candidate evaluations." };
  }
}

export async function createEvaluationAction(input: {
  application_id: string;
  cv_score?: number;
  assessment_score?: number;
  interview_score?: number;
  overall_score?: number;
  recommendation?: FinalRecommendation;
  ai_summary?: string;
}): Promise<ActionResult<FinalEvaluation>> {
  try {
    const org = await getCurrentOrganization();
    const evaluation = await createEvaluation(org.id, input);

    revalidatePath("/evaluations");
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true, data: evaluation };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to submit candidate evaluation." };
  }
}
