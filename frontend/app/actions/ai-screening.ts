"use server";

import { aiServiceClient } from "@/lib/api/ai-service-client";
import { requireApplicationAccess } from "@/lib/auth/candidate-session";

export async function runCvScreeningAction(applicationId: string) {
  try {
    await requireApplicationAccess(applicationId, true);
    // Call Python FastAPI AI Engine
    const result = await aiServiceClient.screenApplication({
      application_id: applicationId,
    });

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to run CV screening via Python AI backend.";
    return { success: false, error: msg };
  }
}
