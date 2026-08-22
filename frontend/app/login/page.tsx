"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
          Welcome back.
        </h1>
        <p className="text-sm text-[#A7AFBC] leading-relaxed">
          Continue managing your AI-powered recruitment pipeline.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3 text-xs text-[#FF5C67]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
            Work Email *
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF] transition-all"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
              Password *
            </label>
            <Link href="/forgot-password" className="text-xs font-mono text-[#39D9FF] hover:underline">
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
            className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#39D9FF]/20 mt-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#242932] text-center text-xs text-[#A7AFBC]">
        Don&apos;t have a workspace?{" "}
        <Link href="/signup" className="text-[#39D9FF] font-semibold hover:underline">
          Build your hiring workspace
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col lg:flex-row selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Left Column: Visual Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D0F12] border-r border-[#242932] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#39D9FF]/[0.06] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          <BrandLogo variant="full" size="lg" href="/" />
        </div>

        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="relative aspect-[16/10] rounded-2xl border border-[#242932] overflow-hidden bg-[#12151A] shadow-2xl ai-glow-subtle">
            <Image
              src="/images/auth-login.png"
              alt="AI-Recruit360 Workspace Visual"
              fill
              priority
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-[#F5F7FA]">
              Automated 360° Candidate Intelligence
            </h2>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Screen CVs, schedule timed assessments, conduct AI video interviews, and access data-backed hiring recommendations in one workspace.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-[#68717E]">
          © 2026 AI-Recruit360 • Enterprise Hiring Intelligence
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <BrandLogo variant="full" size="sm" href="/" />
          </div>
          <Link href="/" className="text-xs font-mono text-[#A7AFBC] hover:text-[#39D9FF]">
            ← Back to Overview
          </Link>
        </div>

        <main className="my-auto py-12 flex justify-center">
          <React.Suspense
            fallback={
              <div className="text-center p-8">
                <Loader2 className="h-6 w-6 text-[#39D9FF] animate-spin mx-auto" />
              </div>
            }
          >
            <LoginForm />
          </React.Suspense>
        </main>

        <footer className="text-center text-xs font-mono text-[#68717E]">
          Protected by enterprise multi-tenant RLS &amp; Supabase Auth
        </footer>
      </div>
    </div>
  );
}

