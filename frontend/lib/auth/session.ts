import { createClient } from "@/lib/supabase/server";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { Database, OrganizationRole } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow = Database["public"]["Tables"]["organization_members"]["Row"];

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("Authentication required to access workspace context.");
  }

  return user;
}

export async function getCurrentProfile(): Promise<ProfileRow> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Graceful fallback if trigger has not fired yet
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Recruiter",
      avatar_url: user.user_metadata?.avatar_url || null,
      job_title: user.user_metadata?.job_title || "Recruitment Specialist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return profile;
}

export async function getUserOrganizations(): Promise<OrganizationRow[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: memberOrgs, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);

  if (error || !memberOrgs || memberOrgs.length === 0) {
    return [];
  }

  const orgIds = memberOrgs.map((m) => m.organization_id);
  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("*")
    .in("id", orgIds);

  if (orgsError || !orgs) {
    return [];
  }

  return orgs;
}

export async function getCurrentOrganization(requestedOrgId?: string): Promise<OrganizationRow> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  if (requestedOrgId) {
    // Validate that the user is actually a member of the requested organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", requestedOrgId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      throw new ForbiddenError("You do not have access to this organization workspace.");
    }

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", requestedOrgId)
      .single();

    if (error || !org) {
      throw new NotFoundError("Organization not found.");
    }

    return org;
  }

  // Default: Get the user's first available organization
  const { data: firstMembership, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !firstMembership) {
    throw new NotFoundError("No active organization membership found. Please create an organization workspace.");
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", firstMembership.organization_id)
    .single();

  if (orgError || !org) {
    throw new NotFoundError("Organization workspace record not found.");
  }

  return org;
}

export async function getCurrentMembership(orgId: string): Promise<OrganizationMemberRow> {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (error || !membership) {
    throw new ForbiddenError("Access denied. Active organization membership required.");
  }

  return membership;
}

export async function getCurrentRole(orgId: string): Promise<OrganizationRole> {
  const membership = await getCurrentMembership(orgId);
  return membership.role;
}
