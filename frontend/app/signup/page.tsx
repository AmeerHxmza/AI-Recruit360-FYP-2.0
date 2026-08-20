"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Mail, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validation
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            organization: organization.trim() || "AI-Recruit360 Workspace",
          },
        },
      });

      if (error) {
        if (error.message.includes("Database error saving new user")) {
          setErrorMsg(
            "Supabase Database Error: A trigger on auth.users is failing. Please check your Supabase SQL Editor triggers or create the profiles table."
          );
        } else {
          setErrorMsg(error.message || "Unable to create account. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Direct signup & login (Email confirmation disabled)
        router.push("/dashboard");
        router.refresh();
      } else if (data.user) {
        // Email confirmation is required by Supabase Auth settings
        setEmailConfirmationRequired(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error("Signup submission error:", err);
      setErrorMsg("Unable to connect to sign up service. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Header Logo */}
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

      {/* Main Auth Form Container */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-8 shadow-2xl ai-glow-subtle space-y-6">
          {emailConfirmationRequired ? (
            /* Email Confirmation Screen */
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-xl bg-[#39D9FF]/10 border border-[#39D9FF]/30 text-[#39D9FF] mx-auto flex items-center justify-center">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F5F7FA]">
                Check your email.
              </h2>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                Your account has been created. A confirmation link has been sent to{" "}
                <strong className="text-[#F5F7FA] font-mono">{email}</strong>.
              </p>
              <div className="p-3.5 rounded-lg bg-[#12151A] border border-[#242932] text-xs text-[#A7AFBC] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0" />
                <span>Confirm your email address, then click below to sign in.</span>
              </div>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-lg bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4"
              >
                Proceed to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Signup Registration Form */
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F7FA]">
                  Build your workspace.
                </h1>
                <p className="text-xs text-[#A7AFBC]">
                  Start discovering top candidate signals with AI-Recruit360.
                </p>
              </div>

              {/* Error Banner */}
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ameer Hamza"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                    Organization Name (Optional)
                  </label>
                  <input
                    type="text"
                    autoComplete="organization"
                    placeholder="NeuralScale Inc."
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="ameer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Workspace
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch Link */}
              <div className="pt-4 border-t border-[#242932] text-center text-xs text-[#A7AFBC]">
                Already have a workspace?{" "}
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

      {/* Footer copyright */}
      <footer className="text-center py-4 text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360 • Recruitment Intelligence
      </footer>
    </div>
  );
}
