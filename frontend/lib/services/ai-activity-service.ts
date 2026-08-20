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
    event_type: string;
    entity_type?: string;
    entity_id?: string;
    status?: AiActivityStatus;
    metadata?: Json;
  }
): Promise<AiActivityLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_activity_logs")
    .insert({
      organization_id: orgId,
      event_type: input.event_type,
      entity_type: input.entity_type || null,
      entity_id: input.entity_id || null,
      status: input.status || "success",
      metadata: input.metadata || {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new DatabaseError("Failed to record AI activity log event.");
  }

  return data;
}
