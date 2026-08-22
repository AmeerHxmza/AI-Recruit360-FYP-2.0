"use server";

import { getCurrentOrganization } from "@/lib/auth/session";
import { getAiActivityLogsForOrg, AiActivityLog } from "@/lib/services/ai-activity-service";
import { AppError } from "@/lib/utils/errors";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAiActivityLogsAction(
  limit = 50
): Promise<ActionResult<AiActivityLog[]>> {
  try {
    const org = await getCurrentOrganization();
    const logs = await getAiActivityLogsForOrg(org.id, limit);
    return { success: true, data: logs };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve AI activity event stream." };
  }
}
