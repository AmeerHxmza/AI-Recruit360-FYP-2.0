"use client";

import * as React from "react";
import Link from "next/link";
import { AuthIntroduction } from "@/components/layout/auth-introduction";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertCircle, Mail, Loader2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-background text-text-primary flex flex-col lg:flex-row selection:bg-action-blue/20 selection:text-action-blue">
      <AuthIntroduction />

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12">
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

        <main className="my-auto py-8 flex justify-center">
          <div className="w-full max-w-md space-y-6">
            {emailConfirmationRequired ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-action-blue mx-auto flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Check your inbox
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Confirmation link sent to{" "}
                  <strong className="text-text-primary font-mono">
                    {email}
                  </strong>
                  .
                </p>
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-lg bg-action-blue hover:bg-action-blue text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  Proceed to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-action-blue">
                    <Sparkles className="h-3 w-3" />
                    <span>Create Free Workspace</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                    Get started today
                  </h1>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Set up your enterprise hiring workspace in less than 60
                    seconds.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-xs text-danger animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">
                      {errorMsg}
                    </span>
                  </div>
                )}

                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ameer Hamza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                      Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme Talent Labs"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ameer@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Min. 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block">
                        Confirm *
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-action-blue hover:bg-action-blue active:bg-action-blue text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 mt-3 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Workspace...
                      </>
                    ) : (
                      <>
                        Create Free Workspace
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-5 border-t border-border text-center text-xs text-text-secondary">
                  Already have a workspace?{" "}
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

        <footer className="text-center text-xs text-text-muted">
          Protected by enterprise multi-tenant Row Level Security &amp; Supabase
          Auth
        </footer>
      </div>
    </div>
  );
}
