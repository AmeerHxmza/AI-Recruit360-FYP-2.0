"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createOrganizationAction } from "@/app/actions/organization";
import { useAuth } from "@/providers/auth-provider";
import { ArrowRight, AlertCircle, Loader2, Building2, Globe, CheckCircle2 } from "lucide-react";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { refreshSession, user } = useAuth();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-generate slug from organization name if not manually edited
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

    // Client-side validation
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
      setErrorMsg("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute canonical Server Action
      const result = await createOrganizationAction(trimmedName, trimmedSlug);

      if (!result.success) {
        setErrorMsg(result.error || "Failed to create organization. Please check your input.");
        setIsSubmitting(false);
        return;
      }

      // Refresh auth context session so organization membership state updates immediately
      try {
        await refreshSession();
      } catch {
        // ignore
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Organization creation error:", err);
      setErrorMsg("An unexpected error occurred while setting up your workspace.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Brand Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <BrandLogo variant="full" size="md" href="/dashboard" />

        {user && (
          <div className="text-xs text-[#A7AFBC] font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#35D07F]" />
            <span>Authenticated as {user.email}</span>
          </div>
        )}
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-[#0D0F12] rounded-2xl border border-[#242932] p-6 sm:p-10 shadow-2xl space-y-6">
          
          {/* Progress / Context Badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#39D9FF]/10 px-3 py-1 text-[11px] font-mono font-semibold text-[#39D9FF] border border-[#39D9FF]/30 uppercase tracking-wider">
              Step 1 of 1 • Workspace Setup
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F7FA] tracking-tight">
              Create your organization.
            </h1>
            <p className="text-xs sm:text-sm text-[#A7AFBC] leading-relaxed">
              Set up your team workspace to start running AI candidate evaluations and adaptive video interviews.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-[#FF5C67] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#FF5C67]">Organization Creation Failed</p>
                <p className="text-xs text-[#FF5C67]/90 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Organization Name Field */}
            <div className="space-y-2 text-left">
              <label htmlFor="org-name" className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block font-semibold">
                Organization Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-[#68717E]" />
                <input
                  id="org-name"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Acme Talent Labs"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF] focus:ring-1 focus:ring-[#39D9FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#68717E]">
                Your official company or recruiting team name. Max 100 characters.
              </p>
            </div>

            {/* Organization Slug Field */}
            <div className="space-y-2 text-left">
              <label htmlFor="org-slug" className="text-xs font-mono text-[#A7AFBC] uppercase tracking-wider block font-semibold">
                Workspace URL Slug *
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-[#68717E]" />
                <input
                  id="org-slug"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="acme-talent-labs"
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] placeholder-[#68717E] focus:outline-none focus:border-[#39D9FF] focus:ring-1 focus:ring-[#39D9FF] transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* URL Preview */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#A7AFBC] bg-[#12151A]/50 px-3 py-1.5 rounded-lg border border-[#242932]/60 font-mono">
                <span className="text-[#68717E]">Workspace Preview:</span>
                <span className="text-[#39D9FF] truncate font-semibold">
                  ai-recruit360.com/workspace/{slug || "acme"}
                </span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="p-3.5 rounded-xl bg-[#12151A] border border-[#242932] space-y-2 text-xs text-[#A7AFBC]">
              <div className="flex items-center gap-2 text-[#F5F7FA] font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#35D07F]" />
                <span>Automatic Owner Role Assignment</span>
              </div>
              <p className="text-[11px] text-[#A7AFBC] pl-6">
                You will automatically become the primary Organization Owner with full administrative controls.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !slug.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#39D9FF] hover:bg-[#63E3FF] text-[#08090B] text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#39D9FF]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
      <footer className="text-center py-4 text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360 • Enterprise Multi-Tenant Intelligence
      </footer>
    </div>
  );
}
