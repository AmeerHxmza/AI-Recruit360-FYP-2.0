"use server";

import { getOrganizationContext } from "@/lib/auth/session";
import { analyzeJobDescription, AnalyzeJobInput } from "@/lib/ai/services/job-analyzer";
import { JobAnalysis } from "@/lib/ai/schemas/job-analysis-schema";
import { AppError } from "@/lib/utils/errors";

export interface AnalyzeJobActionResult {
  success: boolean;
  analysis?: JobAnalysis;
  error?: string;
}

export async function analyzeJobDescriptionAction(
  input: Omit<AnalyzeJobInput, "organizationId">
): Promise<AnalyzeJobActionResult> {
  try {
    const ctx = await getOrganizationContext();
    if (!ctx) {
      return { success: false, error: "Authentication and active workspace required." };
    }

    const analysis = await analyzeJobDescription({
      ...input,
      organizationId: ctx.organization.id,
    });

    return {
      success: true,
      analysis,
    };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return {
        success: false,
        error: err.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while analyzing job description.",
    };
  }
}
