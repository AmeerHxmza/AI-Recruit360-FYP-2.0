"use client";

import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Database, OrganizationRole } from "@/types/database.types";
import { switchOrganizationAction } from "@/app/actions/organization";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow = Database["public"]["Tables"]["organization_members"]["Row"];

export interface AuthMetadata {
  fullName: string;
  organization: string;
  roleTitle: string;
  role?: OrganizationRole;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileRow | null;
  organization: OrganizationRow | null;
  membership: OrganizationMemberRow | null;
  organizations: OrganizationRow[];
  role: OrganizationRole | null;
  userMetadata: AuthMetadata;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [organization, setOrganization] = React.useState<OrganizationRow | null>(null);
  const [membership, setMembership] = React.useState<OrganizationMemberRow | null>(null);
  const [organizations, setOrganizations] = React.useState<OrganizationRow[]>([]);
  const [role, setRole] = React.useState<OrganizationRole | null>(null);

  const router = useRouter();

  // Create a memoized Supabase browser client
  const supabase = React.useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const fetchContextData = React.useCallback(
    async (currentUser: User | null) => {
      if (!supabase || !currentUser) {
        setProfile(null);
        setOrganization(null);
        setMembership(null);
        setOrganizations([]);
        setRole(null);
        return;
      }

      try {
        // 1. Fetch user profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, job_title, created_at, updated_at")
          .eq("id", currentUser.id)
          .single();

        if (prof) setProfile(prof as ProfileRow);

        // 2. Fetch organization memberships
        const { data: memberRows } = await supabase
          .from("organization_members")
          .select("id, organization_id, user_id, role, created_at")
          .eq("user_id", currentUser.id);

        if (memberRows && memberRows.length > 0) {
          const orgIds = memberRows.map((m) => m.organization_id);
          const { data: orgs } = await supabase
            .from("organizations")
            .select("id, name, slug, created_by, created_at, updated_at")
            .in("id", orgIds);

          if (orgs && orgs.length > 0) {
            setOrganizations(orgs as OrganizationRow[]);

            // Determine active organization matching cookie preference if possible
            const activeMember = memberRows[0];
            const activeOrg = orgs.find((o) => o.id === activeMember.organization_id) || orgs[0];
            setMembership(activeMember as OrganizationMemberRow);
            setRole(activeMember.role as OrganizationRole);
            setOrganization(activeOrg as OrganizationRow);
          } else {
            setOrganizations([]);
            setOrganization(null);
          }
        } else {
          setMembership(null);
          setRole(null);
          setOrganizations([]);
          setOrganization(null);
        }
      } catch (err) {
        console.error("Error fetching auth context data:", err);
      }
    },
    [supabase]
  );

  const refreshSession = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      await fetchContextData(currentUser);
    } catch (err) {
      console.error("Auth session retrieval error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchContextData]);

  const switchOrganization = React.useCallback(
    async (orgId: string) => {
      const res = await switchOrganizationAction(orgId);
      if (res.success) {
        await refreshSession();
        router.refresh();
      } else {
        throw new Error(res.error || "Failed to switch organization workspace.");
      }
    },
    [refreshSession, router]
  );

  React.useEffect(() => {
    if (!supabase) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (isMounted) {
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchContextData(currentUser);
        }
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchContextData(currentUser);
        } else {
          setProfile(null);
          setOrganization(null);
          setMembership(null);
          setOrganizations([]);
          setRole(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchContextData]);

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setMembership(null);
    setOrganizations([]);
    setRole(null);
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  // Derived user display details with graceful fallbacks
  const userMetadata = React.useMemo<AuthMetadata>(() => {
    if (!user) {
      return {
        fullName: "Recruiter Workspace",
        organization: "AI-Recruit360",
        roleTitle: "Recruitment Specialist",
        role: "owner",
      };
    }

    const meta = user.user_metadata || {};
    const emailPrefix = user.email ? user.email.split("@")[0] : "Recruiter";
    const formattedPrefix =
      emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const fullUserTitle =
      profile?.full_name || meta.full_name || meta.name || formattedPrefix || "Recruiter";
    const activeOrgName = organization?.name || meta.organization || "AI-Recruit360 Workspace";
    const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member";

    return {
      fullName: fullUserTitle,
      organization: activeOrgName,
      roleTitle: `${formattedRole} • ${activeOrgName}`,
      role: role || undefined,
    };
  }, [user, profile, organization, role]);

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      profile,
      organization,
      membership,
      organizations,
      role,
      userMetadata,
      signOut,
      refreshSession,
      switchOrganization,
    }),
    [
      user,
      session,
      loading,
      profile,
      organization,
      membership,
      organizations,
      role,
      userMetadata,
      signOut,
      refreshSession,
      switchOrganization,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
