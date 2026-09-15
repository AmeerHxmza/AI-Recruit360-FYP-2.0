"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createOrganizationAction } from "@/app/actions/organization";
import { useAuth } from "@/providers/auth-provider";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { refreshSession, user } = useAuth();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMsg("Organization name is required.");
      return;
    }
    if (trimmedName.length > 100) {
      setErrorMsg("Organization name cannot exceed 100 characters.");
      return;
    }
    if (!trimmedSlug) {
      setErrorMsg("Organization URL slug is required.");
      return;
    }
    if (trimmedSlug.length < 3 || trimmedSlug.length > 50) {
      setErrorMsg("Slug must be between 3 and 50 characters long.");
      return;
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(trimmedSlug)) {
      setErrorMsg(
        "Slug can only contain lowercase letters, numbers, and hyphens.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrganizationAction(trimmedName, trimmedSlug);

      if (!result.success) {
        setErrorMsg(
          result.error ||
            "Failed to create organization. Please check your input.",
        );
        setIsSubmitting(false);
        return;
      }

      try {
        await refreshSession();
      } catch {
        // ignore
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Organization creation error:", err);
      setErrorMsg(
        "An unexpected error occurred while setting up your workspace.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between p-4 sm:p-6 selection:bg-action-blue/20 selection:text-action-blue">
      {/* Brand Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <BrandLogo variant="full" size="md" href="/dashboard" />

        {user && (
          <div className="text-xs text-text-secondary font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>Authenticated as {user.email}</span>
          </div>
        )}
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-10 shadow-sm space-y-6">
          {/* Step Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-action-blue border border-blue-500/20">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Setup • Step 1 of 1</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Create your organization
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Set up your team workspace to start running autonomous candidate
              evaluations and adaptive AI interviews.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-danger">
                  Setup Failed
                </p>
                <p className="text-xs text-danger/90 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Organization Name Field */}
            <div className="space-y-2 text-left">
              <label
                htmlFor="org-name"
                className="text-xs font-medium text-text-secondary uppercase tracking-wider block"
              >
                Organization Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                <input
                  id="org-name"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Acme Talent Labs"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-text-muted">
                Your official company or recruiting team name. Max 100
                characters.
              </p>
            </div>

            {/* Organization Slug Field */}
            <div className="space-y-2 text-left">
              <label
                htmlFor="org-slug"
                className="text-xs font-medium text-text-secondary uppercase tracking-wider block"
              >
                Workspace URL Slug *
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                <input
                  id="org-slug"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="acme-talent-labs"
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action-blue focus:ring-1 focus:ring-action-blue/40 transition-colors font-mono disabled:opacity-50"
                />
              </div>

              {/* URL Preview */}
              <div className="flex items-center gap-2 text-xs text-text-secondary bg-background px-3.5 py-2 rounded-lg border border-border font-mono">
                <span className="text-text-muted">Workspace URL:</span>
                <span className="text-action-blue truncate font-medium">
                  ai-recruit360.com/workspace/{slug || "acme"}
                </span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Automatic Owner Role Assignment</span>
              </div>
              <p className="text-xs text-text-muted pl-6 leading-relaxed">
                You will automatically become the primary Organization Owner
                with full administrative, pipeline, and API access.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !slug.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-action-blue hover:bg-action-blue active:bg-action-blue text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Organization Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-text-muted">
        © 2026 AI-Recruit360 Inc. • Enterprise Multi-Tenant Intelligence
      </footer>
    </div>
  );
}
