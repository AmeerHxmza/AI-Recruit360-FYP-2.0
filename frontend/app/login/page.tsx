"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_credentials")
        ) {
          setErrorMsg("Email or password is incorrect.");
        } else {
          setErrorMsg(error.message || "Unable to sign in right now. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push(nextUrl);
        router.refresh();
      } else {
        setErrorMsg("Authentication session could not be established.");
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error("Login submission exception:", err);
      setErrorMsg("Unable to connect to sign in service. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8 shadow-2xl ai-glow-subtle space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F7FA]">
          Welcome back.
        </h1>
        <p className="text-xs text-[#A7AFBC]">
          Sign in to your recruitment intelligence workspace.
        </p>
      </div>

      {/* Error Message Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-[#FF5C67] shrink-0 mt-0.5" />
          <p className="text-xs text-[#FF5C67] font-medium leading-relaxed">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Form Fields */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
            Work Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-mono text-[#39D9FF] hover:underline"
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
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#39D9FF]/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="pt-4 border-t border-[#242932] text-center text-xs text-[#A7AFBC]">
        Don&apos;t have a workspace?{" "}
        <Link
          href="/signup"
          className="text-[#39D9FF] font-semibold hover:underline"
        >
          Create workspace
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Top Header Logo */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#12151A] border border-[#242932] group-hover:border-[#39D9FF]/50 flex items-center justify-center transition-colors">
            <Sparkles className="h-4 w-4 text-[#39D9FF]" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#F5F7FA] font-display">
            AI-Recruit<span className="text-[#39D9FF]">360</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-mono text-[#A7AFBC] hover:text-[#39D9FF] transition-colors"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* Main Auth Form Container wrapped in Suspense */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <React.Suspense
          fallback={
            <div className="bg-[#0D0F12] rounded-2xl border border-[#242932] p-8 text-center space-y-4">
              <Loader2 className="h-6 w-6 text-[#39D9FF] animate-spin mx-auto" />
              <p className="text-xs text-[#A7AFBC]">Loading sign in form...</p>
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>
      </main>

      {/* Footer copyright */}
      <footer className="text-center py-4 text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360 • Recruitment Intelligence
      </footer>
    </div>
  );
}
