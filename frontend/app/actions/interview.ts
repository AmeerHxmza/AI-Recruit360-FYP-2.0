"use server";

import { revalidatePath } from "next/cache";
import { aiServiceClient } from "@/lib/api/ai-service-client";
import { ActionResult } from "@/app/actions/jobs";

export async function initializeInterviewAction(applicationId: string): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const data = await aiServiceClient.initializeInterview(applicationId);
    return { success: true, data: data as Record<string, unknown> };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to initialize interview.";
    return { success: false, error: errorMsg };
  }
}

export async function getNextInterviewQuestionAction(interviewId: string): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const data = await aiServiceClient.getNextInterviewQuestion(interviewId);
    return { success: true, data: data as Record<string, unknown> };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch next interview question.";
    return { success: false, error: errorMsg };
  }
}

export async function submitInterviewResponseAction(
  interviewId: string,
  questionId: string,
  responseText: string
): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const data = await aiServiceClient.evaluateInterviewResponse(interviewId, questionId, responseText);
    return { success: true, data: data as Record<string, unknown> };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to record response.";
    return { success: false, error: errorMsg };
  }
}

export async function finalizeEvaluationAction(applicationId: string): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const data = await aiServiceClient.generateFinalEvaluation(applicationId);

    revalidatePath("/candidates");
    revalidatePath("/applications");
    revalidatePath("/evaluations");

    return { success: true, data: data as Record<string, unknown> };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate evaluation scorecard.";
    return { success: false, error: errorMsg };
  }
}
