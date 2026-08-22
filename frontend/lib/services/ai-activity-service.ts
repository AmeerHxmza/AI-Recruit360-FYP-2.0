import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/session";
import { DatabaseError } from "@/lib/utils/errors";
import { AiActivityStatus, Database, Json } from "@/types/database.types";

export type AiActivityLog = Database["public"]["Tables"]["ai_activity_logs"]["Row"];

export async function getAiActivityLogsForOrg(orgId: string, limit = 50): Promise<AiActivityLog[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_activity_logs")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new DatabaseError("Failed to retrieve AI activity event stream.");
  }

  return data || [];
}

export async function recordAiActivityLog(
  orgId: string,
  input: {
    event_type: Database["public"]["Tables"]["ai_activity_logs"]["Insert"]["event_type"];
    application_id?: string | null;
    job_id?: string | null;
    entity_type?: string | null;
    entity_id?: string | null;
    status?: AiActivityStatus;
    metadata?: Json;
  }
): Promise<AiActivityLog> {
  const supabase = await createClient();

  const metadataObj = (input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata))
    ? { ...input.metadata, entity_type: input.entity_type, entity_id: input.entity_id }
    : { entity_type: input.entity_type, entity_id: input.entity_id };

  const { data, error } = await supabase
    .from("ai_activity_logs")
    .insert({
      organization_id: orgId,
      event_type: input.event_type,
      application_id: input.application_id || (input.entity_type === "application" ? input.entity_id : null),
      job_id: input.job_id || (input.entity_type === "job" ? input.entity_id : null),
      status: input.status || "success",
      metadata: metadataObj as Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to record AI activity log event.");
  }

  return data;
}

export async function logAiActivity(input: {
  organization_id: string;
  event_type: Database["public"]["Tables"]["ai_activity_logs"]["Insert"]["event_type"];
  application_id?: string | null;
  job_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  status?: AiActivityStatus;
  metadata?: Json;
}): Promise<AiActivityLog> {
  return recordAiActivityLog(input.organization_id, {
    event_type: input.event_type,
    application_id: input.application_id,
    job_id: input.job_id,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    status: input.status,
    metadata: input.metadata,
  });
}
