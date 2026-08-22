"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { canManageCandidates } from "@/lib/auth/permissions";
import { createCandidateAction } from "@/app/actions/candidates";
import { ArrowLeft, UserPlus, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function CreateCandidatePage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorized = canManageCandidates(role);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthorized) {
      setErrorMsg("You do not have authorization to add candidate profiles.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createCandidateAction({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        headline: headline.trim() || undefined,
        summary: summary.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        portfolio_url: portfolioUrl.trim() || undefined,
      });

      if (res.success && res.data) {
        router.push(`/candidates/${res.data.id}`);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to create candidate profile.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error("Candidate creation error:", err);
      setErrorMsg("An unexpected error occurred while adding the candidate.");
      setIsSubmitting(false);
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Candidates", "Add Candidate"]}>
      <form onSubmit={handleSubmit}>
        <PageHeader
          title="Add New Candidate"
          description="Create candidate workspace record, profile details, and document ingestion readiness."
          breadcrumbs={
            <button
              type="button"
              onClick={() => router.push("/candidates")}
              className="inline-flex items-center text-xs text-[#A7AFBC] hover:text-[#39D9FF] transition-micro mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Candidates Directory
            </button>
          }
          actions={
            <Button
              type="submit"
              variant="ai"
              size="md"
              disabled={isSubmitting || !isAuthorized}
              className="shadow-[0_0_16px_rgba(57,217,255,0.25)]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1.5" />
              )}
              Save Candidate Profile
            </Button>
          }
        />

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center gap-3 text-xs text-[#FF5C67]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isAuthorized && (
          <div className="mb-6 p-4 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-xs text-[#F5B942]">
            You have read-only access in this workspace. Adding candidates requires Recruiter, Admin, or Owner permissions.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Content */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                Candidate Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Jane Doe"
                    required
                    disabled={isSubmitting || !isAuthorized}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="jane.doe@example.com"
                    required
                    disabled={isSubmitting || !isAuthorized}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    disabled={isSubmitting || !isAuthorized}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Location
                  </label>
                  <Input
                    placeholder="e.g. San Francisco, CA"
                    disabled={isSubmitting || !isAuthorized}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                  Professional Headline
                </label>
                <Input
                  placeholder="e.g. Senior Machine Learning Engineer"
                  disabled={isSubmitting || !isAuthorized}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    disabled={isSubmitting || !isAuthorized}
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                    Portfolio / Github URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/username"
                    disabled={isSubmitting || !isAuthorized}
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A7AFBC] mb-1.5 block">
                  Summary &amp; Background Notes
                </label>
                <Textarea
                  rows={4}
                  disabled={isSubmitting || !isAuthorized}
                  placeholder="Enter candidate summary, key technical experience, or referral details..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: AI Readiness Context Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card elevated className="p-6 border-[#39D9FF]/30 bg-[#171B21] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" />
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Tenant Context Verification
                  </h3>
                </div>
                <Badge variant="ai" className="text-[10px]">
                  PostgreSQL
                </Badge>
              </div>

              <div className="space-y-3 text-xs text-[#A7AFBC]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tenant Scoped:</strong> Candidates belong exclusively to {organization?.name || "your organization"}.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Email Uniqueness:</strong> Enforces unique email per organization workspace.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Document Ingestion Ready:</strong> Once created, resumes can be ingested using the Step 21 pipeline.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </ApplicationShell>
  );
}
