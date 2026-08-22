"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, Mail, Loader2 } from "lucide-react";

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
            "Supabase Database Error: A trigger on auth.users is failing. Please check your Supabase SQL Editor triggers or profiles table."
          );
        } else {
          setErrorMsg(error.message || "Unable to create account. Please try again.");
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
              src="/images/auth-signup.png"
              alt="AI-Recruit360 Recruitment Workspace"
              fill
              priority
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-[#F5F7FA]">
              Build your AI-powered hiring workspace.
            </h2>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Create your organization in seconds. Generate public job links, screen candidate CVs, conduct timed MCQ tests, and run automated AI interviews.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-[#68717E]">
          © 2026 AI-Recruit360 • Enterprise Hiring Workspace
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

        <main className="my-auto py-8 flex justify-center">
          <div className="w-full max-w-md space-y-6">
            {emailConfirmationRequired ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-12 w-12 rounded-xl bg-[#39D9FF]/10 border border-[#39D9FF]/30 text-[#39D9FF] mx-auto flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold font-display text-[#F5F7FA]">
                  Check your email.
                </h2>
                <p className="text-xs text-[#A7AFBC] leading-relaxed">
                  Confirmation link sent to <strong className="text-[#F5F7FA] font-mono">{email}</strong>.
                </p>
                <Link
                  href="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-left">
                  <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
                    Build your workspace.
                  </h1>
                  <p className="text-sm text-[#A7AFBC] leading-relaxed">
                    Start discovering top candidate signals with AI-Recruit360.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3 text-xs text-[#FF5C67]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
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
                      className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                      Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme Corp"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
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
                      className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Min. 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
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
                        className="w-full px-4 py-3 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#39D9FF]/20 mt-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Workspace...
                      </>
                    ) : (
                      <>
                        Create Workspace
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-4 border-t border-[#242932] text-center text-xs text-[#A7AFBC]">
                  Already have a workspace?{" "}
                  <Link href="/login" className="text-[#39D9FF] font-semibold hover:underline">
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="text-center text-xs font-mono text-[#68717E]">
          Protected by enterprise multi-tenant RLS &amp; Supabase Auth
        </footer>
      </div>
    </div>
  );
}

