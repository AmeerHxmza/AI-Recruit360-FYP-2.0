"use client";

import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthMetadata {
  fullName: string;
  organization: string;
  roleTitle: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userMetadata: AuthMetadata;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const router = useRouter();

  // Create a memoized Supabase browser client
  const supabase = React.useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

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
      setUser(currentSession?.user ?? null);
    } catch (err) {
      console.error("Auth session retrieval error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    if (!supabase) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  // Derived user display details with graceful fallbacks
  const userMetadata = React.useMemo<AuthMetadata>(() => {
    if (!user) {
      return {
        fullName: "Ameer Hamza",
        organization: "AI-Recruit360 Workspace",
        roleTitle: "Recruitment Specialist",
      };
    }

    const meta = user.user_metadata || {};
    const emailPrefix = user.email ? user.email.split("@")[0] : "Recruiter";
    const formattedPrefix =
      emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    return {
      fullName: meta.full_name || meta.name || formattedPrefix || "Ameer Hamza",
      organization: meta.organization || "AI-Recruit360 Workspace",
      roleTitle: meta.role_title || "Recruitment Specialist",
    };
  }, [user]);

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      userMetadata,
      signOut,
      refreshSession,
    }),
    [user, session, loading, userMetadata, signOut, refreshSession]
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
