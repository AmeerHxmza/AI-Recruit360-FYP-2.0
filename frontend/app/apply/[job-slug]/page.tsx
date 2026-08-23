"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPublicJobBySlugAction } from "@/app/actions/jobs";
import { submitPublicApplicationAction, getPublicApplicationStatusAction } from "@/app/actions/applications";
import { runCvScreeningAction } from "@/app/actions/ai-screening";
import { Job } from "@/lib/services/job-service";
import { ApplicationStatus } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Briefcase,
  XCircle,
  FileText,
} from "lucide-react";

export default function PublicCandidateApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobSlugOrId = (params?.["job-slug"] as string) || "";

  // Core Job Data State
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Application Flow Step: 1 = Form, 2 = Polling, 3 = Knockout, 4 = Assessment Ready
  const [flowStep, setFlowStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [applicationId, setApplicationId] = React.useState<string | null>(null);
  const [appStatus, setAppStatus] = React.useState<ApplicationStatus | null>(null);

  // Candidate Form Inputs
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [linkedIn, setLinkedIn] = React.useState("");
  const [portfolio, setPortfolio] = React.useState("");
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [formSubmitting, setFormSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Fetch Job details on mount using public slug query
  React.useEffect(() => {
    if (!jobSlugOrId) return;
    let isMounted = true;

    getPublicJobBySlugAction(jobSlugOrId).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setFetchError("Job position not found or no longer accepting applications.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [jobSlugOrId]);

  // Polling for Status
  React.useEffect(() => {
    if (flowStep !== 2 || !applicationId) return;
    
    const interval = setInterval(async () => {
      const res = await getPublicApplicationStatusAction(applicationId);
      if (res.success && res.data) {
        setAppStatus(res.data);
        
        if (res.data === "knocked_out") {
          setFlowStep(3);
        } else if (res.data === "assessment") {
          setFlowStep(4);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [flowStep, applicationId]);

  // Submit Application Form Step 1
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid full name and email address.");
      return;
    }

    if (!phone.trim()) {
      setFormError("Mobile phone number is mandatory to submit your application.");
      return;
    }

    if (!cvFile) {
      setFormError("Please upload your CV (PDF or DOCX).");
      return;
    }

    if (cvFile.size > 10 * 1024 * 1024) {
      setFormError("File size must be under 10MB.");
      return;
    }

    if (!job) {
      setFormError("Job details not loaded.");
      return;
    }

    setFormSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("job_id", job.id);
      formData.append("organization_id", job.organization_id);
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      if (location.trim()) formData.append("location", location.trim());
      if (linkedIn.trim()) formData.append("linkedin_url", linkedIn.trim());
      if (portfolio.trim()) formData.append("portfolio_url", portfolio.trim());
      formData.append("cv_file", cvFile);

      const res = await submitPublicApplicationAction(formData);

      if (res.success && res.data) {
        const appId = res.data.application_id;
        setApplicationId(appId);
        setAppStatus("applied");

        // Trigger AI Screening async (do not wait for it to finish for the UI)
        runCvScreeningAction(appId).catch((err) => {
          console.error("Failed to trigger async screening workflow", err);
        });

        setFlowStep(2);
      } else {
        setFormError(res.error || "Failed to submit job application.");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading job application...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-4">
          <XCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Position Unavailable</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {fetchError || "This job link is invalid or expired."}
          </p>
          <Link href="/" className="inline-block px-4 py-2 rounded-lg bg-[#171B21] border border-[#242932] text-xs text-[#39D9FF]">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]">
      {/* Public Candidate Header */}
      <header className="border-b border-[#242932] bg-[#0D0F12] py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="/" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#A7AFBC] hidden sm:inline uppercase tracking-wider">Candidate Application</span>
          </div>
        </div>
      </header>

      {/* Main Candidate Experience Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Step 1: Candidate Application Form */}
        {flowStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-2xl border border-[#242932] bg-[#12151A] p-6 space-y-4 overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#39D9FF] font-bold tracking-wider">
                    {job.department}
                  </span>
                  <h1 className="text-2xl font-bold text-[#F5F7FA] font-display">
                    {job.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[#A7AFBC] pt-1 border-t border-[#242932]">
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <MapPin className="h-3.5 w-3.5 text-[#39D9FF]" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <Briefcase className="h-3.5 w-3.5 text-[#35D07F]" /> {(job.employment_type || "full_time").replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#0D0F12] px-2.5 py-1 rounded border border-[#242932]">
                    <Building2 className="h-3.5 w-3.5 text-[#F5B942]" /> {job.workplace_type || "hybrid"}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#242932]">
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Description
                  </h3>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line">
                    {job.description || "No overview provided."}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#242932]">
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Requirements
                  </h3>
                  <div className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line bg-[#0D0F12] p-3 rounded-lg border border-[#242932]">
                    {job.requirements || "Standard job qualifications apply."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Candidate Application Submission Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#242932] bg-[#12151A] p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="border-b border-[#242932] pb-4 space-y-1">
                  <h2 className="text-xl font-bold font-display text-[#F5F7FA]">Submit Application</h2>
                  <p className="text-xs text-[#A7AFBC]">Please provide your details below.</p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-start gap-2.5 text-xs text-[#FF5C67]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">Current Location</label>
                      <input
                        type="text"
                        placeholder="San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#A7AFBC]">LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedIn}
                        onChange={(e) => setLinkedIn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Portfolio URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F12] border border-[#242932] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#39D9FF]"
                    />
                  </div>

                  {/* Resume PDF / DOCX File Drag & Drop Dropzone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#A7AFBC]">Upload CV (PDF or DOCX) *</label>
                    <div className="border-2 border-dashed border-[#242932] hover:border-[#39D9FF]/50 bg-[#0D0F12] rounded-xl p-4 text-center transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCvFile(file);
                            setFormError(null);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                        <div className="p-2 rounded-lg bg-[#171B21] border border-[#242932] text-[#39D9FF] group-hover:scale-105 transition-transform">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#F5F7FA]">
                          Drop your CV here, or <span className="text-[#39D9FF]">browse</span>
                        </span>
                        {cvFile && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F] text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="ai"
                    size="md"
                    disabled={formSubmitting}
                    className="w-full text-sm py-4 mt-4 bg-[#39D9FF] text-[#08090B] hover:bg-[#63E3FF] border-none shadow-none"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Screening / Polling Timeline */}
        {flowStep === 2 && (
          <div className="max-w-2xl mx-auto text-center space-y-6 py-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#39D9FF]/10 border border-[#39D9FF]/30 flex items-center justify-center text-[#39D9FF]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
                Reviewing your application
              </h1>
              <p className="text-xs text-[#A7AFBC] leading-relaxed max-w-md mx-auto">
                Please wait while we process your CV and verify the requirements for this role.
              </p>
            </div>

            {/* Pipeline Timeline Status */}
            <div className="p-6 rounded-2xl bg-[#12151A] border border-[#242932] text-left mt-8">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#242932]">
                
                {/* Step 1: Received */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#12151A] border-[#35D07F] text-[#35D07F] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-[#35D07F]/20">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-[#35D07F]/30 bg-[#35D07F]/5 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F5F7FA] text-sm">Application Received</div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2: Screening */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#12151A] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${appStatus === 'screening' || appStatus === 'applied' ? 'border-[#39D9FF] text-[#39D9FF] shadow shadow-[#39D9FF]/20' : 'border-[#242932] text-[#68717E]'}`}>
                    <div className={`w-2 h-2 rounded-full ${appStatus === 'screening' || appStatus === 'applied' ? 'bg-[#39D9FF] animate-pulse' : 'bg-[#68717E]'}`}></div>
                  </div>
                  <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border ${appStatus === 'screening' || appStatus === 'applied' ? 'border-[#39D9FF]/30 bg-[#39D9FF]/5' : 'border-[#242932] bg-[#0D0F12]/50'} shadow-sm`}>
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F5F7FA] text-sm">CV Analysis</div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Assessment */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#12151A] border-[#242932] text-[#68717E] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#68717E]"></div>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-[#242932] bg-[#0D0F12]/50 shadow-sm opacity-60">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F5F7FA] text-sm">Assessment</div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Interview */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#12151A] border-[#242932] text-[#68717E] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#68717E]"></div>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-[#242932] bg-[#0D0F12]/50 shadow-sm opacity-60">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F5F7FA] text-sm">AI Interview</div>
                    </div>
                  </div>
                </div>

                {/* Step 5: Final Evaluation */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#12151A] border-[#242932] text-[#68717E] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#68717E]"></div>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-[#242932] bg-[#0D0F12]/50 shadow-sm opacity-60">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F5F7FA] text-sm">Evaluation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Knockout */}
        {flowStep === 3 && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#242932] flex items-center justify-center text-[#A7AFBC]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
                Application Review Complete
              </h1>
              <p className="text-sm text-[#A7AFBC] leading-relaxed">
                Thank you for your interest in this position. Based on the requirements for this role, your application will not proceed to the next stage at this time.
              </p>
              <p className="text-sm text-[#A7AFBC] leading-relaxed">
                We appreciate you taking the time to apply and wish you the best in your job search.
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-lg bg-[#12151A] border border-[#242932] text-sm text-[#F5F7FA] hover:bg-[#171B21] transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* Step 4: Assessment Pass */}
        {flowStep === 4 && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#35D07F]/10 border border-[#35D07F]/30 flex items-center justify-center text-[#35D07F] shadow-[0_0_24px_rgba(53,208,127,0.2)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold font-display text-[#F5F7FA]">
                You&apos;re moving to the next stage.
              </h1>
              <p className="text-sm text-[#A7AFBC] leading-relaxed">
                Your application meets the initial requirements. Please continue to the technical assessment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#12151A] border border-[#242932] text-left mt-8 space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
                Technical Assessment
              </h3>
              <ul className="text-sm text-[#A7AFBC] space-y-2 list-disc list-inside">
                <li>10 Multiple Choice Questions</li>
                <li>30 seconds per question</li>
                <li>Focuses on key skills for the role</li>
              </ul>
              
              <Button
                variant="ai"
                onClick={() => router.push(`/assessment/${applicationId}`)}
                className="w-full text-sm py-4 mt-2 bg-[#35D07F] hover:bg-[#35D07F]/90 text-[#08090B] border-none shadow-[0_0_20px_rgba(53,208,127,0.3)]"
              >
                Start Assessment
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#242932] py-6 text-center text-xs font-mono text-[#68717E]">
        © 2026 AI-Recruit360
      </footer>
    </div>
  );
}
