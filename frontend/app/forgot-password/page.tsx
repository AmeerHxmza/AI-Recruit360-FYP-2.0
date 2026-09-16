"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";

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
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
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
    <div className="min-h-screen bg-[#FAFAF7] text-[#121212] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#FF4F62] selection:text-white">
      {/* Top Header Logo */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <BrandLogo variant="full" size="md" href="/" />
        <Link
          href="/login"
          className="text-xs font-medium text-[#60605D] hover:text-[#121212] transition-colors"
        >
          ← Back to Sign In
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-[18px] border border-[#E7E7E2] p-6 sm:p-8 shadow-sm space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="size-12 rounded-xl bg-[#ECF9F3] border border-[#35C88A]/30 text-[#167348] mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-6 text-[#35C88A]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-[550] tracking-tight text-[#121212]">
                Check your inbox
              </h2>
              <p className="text-xs text-[#60605D] leading-relaxed">
                If an account exists for{" "}
                <strong className="text-[#121212] font-mono">{email}</strong>
                , password reset instructions have been dispatched.
              </p>
              <Link
                href="/login"
                className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xs hover:-translate-y-0.5"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="size-11 rounded-xl bg-[#111111]/5 border border-[#E7E7E2] text-[#121212] mx-auto flex items-center justify-center mb-1">
                  <KeyRound className="size-5" />
                </div>
                <h1 className="text-2xl font-[550] tracking-tight text-[#121212]">
                  Reset password
                </h1>
                <p className="text-xs text-[#60605D]">
                  Enter your verified work email address to receive password reset instructions.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-600 animate-in fade-in duration-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">
                    {errorMsg}
                  </span>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#60605D] hover:text-[#121212] transition-colors"
                >
                  Remember your password?{" "}
                  <span className="font-semibold text-[#121212] underline">
                    Sign in
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-text-muted">
        © 2026 AI-Recruit360 Inc. • Recruitment Intelligence System
      </footer>
    </div>
  );
}
