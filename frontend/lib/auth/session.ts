import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { Database, OrganizationRole } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow = Database["public"]["Tables"]["organization_members"]["Row"];

export interface OrganizationContext {
  user: User;
  profile: ProfileRow;
  organization: OrganizationRow;
  membership: OrganizationMemberRow;
  role: OrganizationRole;
}

export async function getCurrentUser(): Promise<User> {
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
    // Graceful fallback if profile trigger has not fired yet
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

export async function getOrganizationContext(
  requestedOrgId?: string
): Promise<OrganizationContext | null> {
  try {
    const user = await getCurrentUser();
    const supabase = await createClient();

    let targetOrgId = requestedOrgId;

    if (!targetOrgId) {
      try {
        const cookieStore = await cookies();
        targetOrgId = cookieStore.get("air360_org_id")?.value;
      } catch {
        // cookies() call might fail in non-request contexts
      }
    }

    let { data: memberships } = await supabase
      .from("organization_members")
      .select("*")
      .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) {
      // Self-healing fallback: Check if user owns an existing organization
      const { data: ownedOrg } = await supabase
        .from("organizations")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ownedOrg) {
        const { data: newMember } = await supabase
          .from("organization_members")
          .insert({ organization_id: ownedOrg.id, user_id: user.id, role: "owner" })
          .select()
          .single();

        if (newMember) {
          memberships = [newMember];
        }
      }
    }

    if (!memberships || memberships.length === 0) {
      return null;
    }

    let activeMembership = targetOrgId
      ? memberships.find((m) => m.organization_id === targetOrgId)
      : undefined;

    if (!activeMembership) {
      activeMembership = memberships[0];
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", activeMembership.organization_id)
      .single();

    if (!org) {
      return null;
    }

    const profile = await getCurrentProfile();

    return {
      user,
      profile,
      organization: org,
      membership: activeMembership,
      role: activeMembership.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentOrganization(requestedOrgId?: string): Promise<OrganizationRow> {
  const ctx = await getOrganizationContext(requestedOrgId);

  if (!ctx) {
    throw new NotFoundError(
      "No active organization membership found. Please create an organization workspace."
    );
  }

  return ctx.organization;
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
