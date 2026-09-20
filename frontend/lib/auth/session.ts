import { cache } from "react";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { Database, OrganizationRole } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow =
  Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow =
  Database["public"]["Tables"]["organization_members"]["Row"];

export interface OrganizationContext {
  user: User;
  profile: ProfileRow;
  organization: OrganizationRow;
  membership: OrganizationMemberRow;
  role: OrganizationRole;
}

interface JoinedMembershipRow extends OrganizationMemberRow {
  organizations: OrganizationRow | null;
}

export const getCurrentUser = cache(async (): Promise<User> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("Authentication required to access workspace context.");
  }

  return user;
});

export const getCurrentProfile = cache(async (): Promise<ProfileRow> => {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, job_title, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return {
      id: user.id,
      full_name:
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Recruiter",
      avatar_url: user.user_metadata?.avatar_url || null,
      job_title: user.user_metadata?.job_title || "Recruitment Specialist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return profile;
});

// Single-request cached loader for all user memberships + joined organizations + profile
interface UserWorkspaceBundle {
  user: User;
  profile: ProfileRow;
  memberships: JoinedMembershipRow[];
  cookieOrgId: string | null;
}

const loadUserWorkspaceBundle = cache(
  async (): Promise<UserWorkspaceBundle | null> => {
    try {
      const user = await getCurrentUser();
      const supabase = await createClient();

      // Parallel fetch: cookieStore + memberships with joined organizations + profile
      const [cookieStore, { data: membershipsData }, profile] =
        await Promise.all([
          cookies().catch(() => null),
          supabase
            .from("organization_members")
            .select(
              "id, organization_id, user_id, role, created_at, organizations(id, name, slug, created_by, created_at, updated_at)",
            )
            .eq("user_id", user.id),
          getCurrentProfile(),
        ]);

      const memberships = (membershipsData ||
        []) as unknown as JoinedMembershipRow[];
      const cookieOrgId = cookieStore?.get("air360_org_id")?.value || null;

      return {
        user,
        profile,
        memberships,
        cookieOrgId,
      };
    } catch {
      return null;
    }
  },
);

export const getUserOrganizations = cache(
  async (): Promise<OrganizationRow[]> => {
    const bundle = await loadUserWorkspaceBundle();
    if (!bundle) return [];
    return bundle.memberships
      .map((m) => m.organizations)
      .filter((o): o is OrganizationRow => Boolean(o));
  },
);

export const getOrganizationContext = cache(
  async (requestedOrgId?: string): Promise<OrganizationContext | null> => {
    const bundle = await loadUserWorkspaceBundle();
    if (!bundle || bundle.memberships.length === 0) {
      return null;
    }

    const { user, profile, memberships, cookieOrgId } = bundle;
    const targetOrgId = requestedOrgId || cookieOrgId;

    let activeMembership = targetOrgId
      ? memberships.find((m) => m.organization_id === targetOrgId)
      : undefined;

    if (!activeMembership) {
      if (requestedOrgId) return null;
      activeMembership = memberships[0];
    }

    const org = activeMembership.organizations;
    if (!org) {
      return null;
    }

    return {
      user,
      profile,
      organization: org,
      membership: {
        id: activeMembership.id,
        organization_id: activeMembership.organization_id,
        user_id: activeMembership.user_id,
        role: activeMembership.role,
        created_at: activeMembership.created_at,
      },
      role: activeMembership.role as OrganizationRole,
    };
  },
);

export const getCurrentOrganization = cache(
  async (requestedOrgId?: string): Promise<OrganizationRow> => {
    const ctx = await getOrganizationContext(requestedOrgId);

    if (!ctx) {
      throw new NotFoundError(
        "No active organization membership found. Please create an organization workspace.",
      );
    }

    return ctx.organization;
  },
);

export const getCurrentMembership = cache(
  async (orgId: string): Promise<OrganizationMemberRow> => {
    const ctx = await getOrganizationContext(orgId);

    if (!ctx || ctx.organization.id !== orgId) {
      throw new ForbiddenError(
        "Access denied. Active organization membership required.",
      );
    }

    return ctx.membership;
  },
);

export const getCurrentRole = cache(
  async (orgId: string): Promise<OrganizationRole> => {
    const ctx = await getOrganizationContext(orgId);
    if (!ctx || ctx.organization.id !== orgId) {
      throw new ForbiddenError(
        "Access denied. Active organization membership required.",
      );
    }
    return ctx.role;
  },
);
