"use client";

import * as React from "react";
import Link from "next/link";
import { AuthIntroduction } from "@/components/layout/auth-introduction";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl =
    searchParams.get("next")?.startsWith("/") &&
    !searchParams.get("next")?.startsWith("//") &&
    !searchParams.get("next")?.includes("\\")
      ? searchParams.get("next")!
      : "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const attempt = React.useRef(0);

  React.useEffect(
    () => () => {
      ++attempt.current;
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const currentAttempt = ++attempt.current;
    // Also bound SDK initialization/session refresh before the password request.
    const deadline = setTimeout(() => {
      if (attempt.current !== currentAttempt) return;
      ++attempt.current;
      setErrorMsg(
        "Sign-in took too long. Check your connection and try again.",
      );
      setLoading(false);
    }, 25_000);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (attempt.current !== currentAttempt) return;

      if (error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_credentials")
        ) {
          setErrorMsg("Email or password is incorrect.");
        } else {
          setErrorMsg(
            error.message || "Unable to sign in right now. Please try again.",
          );
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Start a fresh authenticated document after Supabase writes the cookies.
        // push + refresh races can reuse the unauthenticated router state.
        window.location.assign(nextUrl);
      } else {
        setErrorMsg("Authentication session could not be established.");
        setLoading(false);
      }
    } catch (err: unknown) {
      if (attempt.current !== currentAttempt) return;
      console.error(
        "Login submission exception:",
        err instanceof Error ? err.name : "UnknownError",
      );
      setErrorMsg(
        "Unable to connect to sign in service. Please check your connection.",
      );
      setLoading(false);
    } finally {
      clearTimeout(deadline);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-white px-3 py-1 text-xs font-medium text-[#121212] shadow-2xs">
          <span className="size-1.5 rounded-full bg-[#35C88A]" />
          <span>Recruiter Workspace</span>
        </div>
        <h1 className="text-3xl font-[550] tracking-[-0.035em] text-[#121212]">
          Welcome back
        </h1>
        <p className="text-sm text-[#60605D] leading-relaxed">
          Sign in to access your recruitment pipeline and candidate
          intelligence.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-600 animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMsg}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
            Work Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#60605D] hover:text-[#121212] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 mt-4 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-5 border-t border-[#E7E7E2] text-center text-xs text-[#60605D]">
        Don&apos;t have an organization workspace?{" "}
        <Link
          href="/signup"
          className="text-[#121212] font-semibold hover:underline"
        >
          Create a workspace
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#121212] flex flex-col lg:flex-row selection:bg-[#FF4F62] selection:text-white">
      <AuthIntroduction />

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 bg-[#FAFAF7]">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <BrandLogo variant="full" size="sm" href="/" />
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back to Overview
          </Link>
        </div>

        <main className="my-auto py-12 flex justify-center">
          <React.Suspense
            fallback={
              <div className="text-center p-8">
                <Loader2 className="h-6 w-6 text-action-blue animate-spin mx-auto" />
              </div>
            }
          >
            <LoginForm />
          </React.Suspense>
        </main>

        <footer className="text-center text-xs text-text-muted">
          Protected by enterprise multi-tenant Row Level Security &amp; Supabase
          Auth
        </footer>
      </div>
    </div>
  );
}
