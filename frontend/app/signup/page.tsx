"use client";

import * as React from "react";
import Link from "next/link";
import { AuthIntroduction } from "@/components/layout/auth-introduction";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, Loader2, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] =
    React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            organization: organization.trim() || "AI-Recruit360 Workspace",
          },
        },
      });

      if (error) {
        if (error.message.includes("Database error saving new user")) {
          setErrorMsg(
            "Supabase Database Error: A trigger on auth.users is failing. Please check your Supabase SQL Editor triggers or profiles table.",
          );
        } else {
          setErrorMsg(
            error.message || "Unable to create account. Please try again.",
          );
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else if (data.user) {
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
            className="text-xs font-medium text-[#60605D] hover:text-[#121212] transition-colors"
          >
            ← Back to Overview
          </Link>
        </div>

        <main className="my-auto py-8 flex justify-center">
          <div className="w-full max-w-md space-y-6">
            {emailConfirmationRequired ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-xl bg-[#111111]/5 border border-[#E7E7E2] text-[#121212] mx-auto flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-[550] tracking-tight text-[#121212]">
                  Check your inbox
                </h2>
                <p className="text-xs text-[#60605D] leading-relaxed">
                  Confirmation link sent to{" "}
                  <strong className="text-[#121212] font-mono">
                    {email}
                  </strong>
                  .
                </p>
                <Link
                  href="/login"
                  className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 mt-4 shadow-xs hover:-translate-y-0.5"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-white px-3 py-1 text-xs font-medium text-[#121212] shadow-2xs">
                    <span className="size-1.5 rounded-full bg-[#35C88A]" />
                    <span>Create Free Workspace</span>
                  </div>
                  <h1 className="text-3xl font-[550] tracking-[-0.035em] text-[#121212]">
                    Get started today
                  </h1>
                  <p className="text-sm text-[#60605D] leading-relaxed">
                    Set up your enterprise hiring workspace in less than 60 seconds.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-600 animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">
                      {errorMsg}
                    </span>
                  </div>
                )}

                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ameer Hamza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                      Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme Talent Labs"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ameer@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Min. 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 mt-4 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Free Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-5 border-t border-[#E7E7E2] text-center text-xs text-[#60605D]">
                  Already have a workspace?{" "}
                  <Link
                    href="/login"
                    className="text-[#121212] font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="text-center text-xs text-text-muted">
          Protected by enterprise multi-tenant Row Level Security &amp; Supabase
          Auth
        </footer>
      </div>
    </div>
  );
}
