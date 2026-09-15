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
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between p-4 sm:p-6 selection:bg-action-blue/20 selection:text-action-blue">
      {/* Top Header Logo */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <BrandLogo variant="full" size="md" href="/" />
        <Link
          href="/login"
          className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Back to Sign In
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                Check your inbox
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                If an account exists for{" "}
                <strong className="text-text-primary font-mono">{email}</strong>
                , password reset instructions have been dispatched.
              </p>
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-lg bg-action-blue hover:bg-action-blue text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                Return to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-action-blue mx-auto flex items-center justify-center mb-1">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Reset password
                </h1>
                <p className="text-xs text-text-secondary">
                  Enter your work email address to receive password recovery
                  instructions.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-danger font-medium leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="recruiter@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-action-blue hover:bg-action-blue text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 mt-2 disabled:opacity-50 cursor-pointer"
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

              <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="text-action-blue font-medium hover:underline"
                >
                  Sign In
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
