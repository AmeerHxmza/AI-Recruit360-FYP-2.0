"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/login?reset=success`,
      });

      if (error) {
        console.error("Password reset request error:", error);
      }

      // Always show success message without revealing account existence
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset exception:", err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

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
          href="/login"
          className="text-xs font-mono text-[#A7AFBC] hover:text-[#39D9FF] transition-colors"
        >
          ← Back to Sign In
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8 shadow-2xl ai-glow-subtle space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/30 text-[#35D07F] mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F5F7FA]">
                Check your email.
              </h2>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                If an account exists for <strong className="text-[#F5F7FA] font-mono">{email}</strong>, password reset instructions have been sent.
              </p>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-lg bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4"
              >
                Return to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F7FA]">
                  Reset password.
                </h1>
                <p className="text-xs text-[#A7AFBC]">
                  Enter your work email address to receive password recovery instructions.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 text-[#FF5C67] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#FF5C67] font-medium leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#39D9FF]/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      Send Reset Instructions
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#242932] text-center text-xs text-[#A7AFBC]">
                Remembered password?{" "}
                <Link
                  href="/login"
                  className="text-[#39D9FF] font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360 • Recruitment Intelligence
      </footer>
    </div>
  );
}
