import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrganizations } from "@/lib/auth/session";
import { validateOrganizationInput } from "@/lib/utils/validation";
import { DatabaseError, NotFoundError } from "@/lib/utils/errors";
import { Database } from "@/types/database.types";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export async function createOrganization(name: string, slug: string): Promise<Organization> {
  await getCurrentUser();
  const valid = validateOrganizationInput(name, slug);

  const supabase = await createClient();

  // Invoke the canonical database RPC: create_organization(_name, _slug)
  const { data, error } = await supabase.rpc("create_organization", {
    _name: valid.name,
    _slug: valid.slug,
  });

  if (error) {
    if (error.message.includes("unique") || error.message.includes("slug")) {
      throw new DatabaseError("An organization with this URL slug already exists. Please choose a different slug.");
    }
    throw new DatabaseError(error.message || "Failed to create organization workspace.");
  }

  if (!data) {
    throw new DatabaseError("Organization workspace creation produced no record.");
  }

  return data;
}

export async function getOrganizationById(id: string): Promise<Organization> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_by, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new NotFoundError("Organization not found.");
  }

  return data;
}

export async function getMyOrganizations(): Promise<Organization[]> {
  return getUserOrganizations();
}
