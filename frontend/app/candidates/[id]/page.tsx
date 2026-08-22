"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { canManageCandidates } from "@/lib/auth/permissions";
import {
  getCandidateByIdAction,
  updateCandidateAction,
  deleteCandidateAction,
  getCandidateApplicationsAction,
  getCandidateDocumentsAction,
} from "@/app/actions/candidates";
import { Candidate, CandidateApplicationItem, CandidateDocumentWithUrl } from "@/lib/services/candidate-service";
import { CandidateDocumentUploader } from "@/components/candidates/candidate-document-uploader";
import {
  ArrowLeft,
  Edit3,
  Sparkles,
  Loader2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  User,
  X,
  Save,
  Briefcase,
  FileText,
  Download,
  Trash2,
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candId = (params?.id as string) || "";

  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageCandidates(role);

  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [applications, setApplications] = React.useState<CandidateApplicationItem[]>([]);
  const [documents, setDocuments] = React.useState<CandidateDocumentWithUrl[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editFullName, setEditFullName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editLocation, setEditLocation] = React.useState("");
  const [editHeadline, setEditHeadline] = React.useState("");
  const [editSummary, setEditSummary] = React.useState("");
  const [editLinkedinUrl, setEditLinkedinUrl] = React.useState("");
  const [editPortfolioUrl, setEditPortfolioUrl] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [editErrorMsg, setEditErrorMsg] = React.useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const refreshData = React.useCallback(async () => {
    if (!candId) return;
    const [candRes, appsRes, docsRes] = await Promise.all([
      getCandidateByIdAction(candId),
      getCandidateApplicationsAction(candId),
      getCandidateDocumentsAction(candId),
    ]);

    if (candRes.success && candRes.data) setCandidate(candRes.data);
    if (appsRes.success && appsRes.data) setApplications(appsRes.data);
    if (docsRes.success && docsRes.data) setDocuments(docsRes.data);
  }, [candId]);

  React.useEffect(() => {
    if (!candId) return;
    let isMounted = true;

    Promise.all([
      getCandidateByIdAction(candId),
      getCandidateApplicationsAction(candId),
      getCandidateDocumentsAction(candId),
    ]).then(([candRes, appsRes, docsRes]) => {
      if (!isMounted) return;
      if (candRes.success && candRes.data) {
        setCandidate(candRes.data);
      } else {
        setErrorMsg(candRes.error || "Candidate profile not found or access denied.");
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [candId, organization?.id]);

  const openEditModal = () => {
    if (!candidate) return;
    setEditFullName(candidate.full_name);
    setEditEmail(candidate.email);
    setEditPhone(candidate.phone || "");
    setEditLocation(candidate.location || "");
    setEditHeadline(candidate.headline || "");
    setEditSummary(candidate.summary || "");
    setEditLinkedinUrl(candidate.linkedin_url || "");
    setEditPortfolioUrl(candidate.portfolio_url || "");
    setEditErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !isAuthorizedToManage) return;
    setEditErrorMsg(null);

    if (!editFullName.trim() || !editEmail.trim()) {
      setEditErrorMsg("Full name and valid email address are required.");
      return;
    }

    setEditSubmitting(true);

    const res = await updateCandidateAction(candidate.id, {
      full_name: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || undefined,
      location: editLocation.trim() || undefined,
      headline: editHeadline.trim() || undefined,
      summary: editSummary.trim() || undefined,
      linkedin_url: editLinkedinUrl.trim() || undefined,
      portfolio_url: editPortfolioUrl.trim() || undefined,
    });

    if (res.success && res.data) {
      setCandidate(res.data);
      setIsEditModalOpen(false);
    } else {
      setEditErrorMsg(res.error || "Failed to update profile.");
    }
    setEditSubmitting(false);
  };

  const handleDeleteCandidate = async () => {
    if (!candidate) return;
    setIsDeleting(true);

    const res = await deleteCandidateAction(candidate.id);
    if (res.success) {
      router.push("/candidates");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to delete candidate.");
    }
    setIsDeleting(false);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Candidates", "Loading..."]}>
        <div className="p-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
          <p className="text-xs text-[#A7AFBC] font-mono">Loading candidate profile from database...</p>
        </div>
      </ApplicationShell>
    );
  }

  if (errorMsg || !candidate) {
    return (
      <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Candidates", "Not Found"]}>
        <div className="p-12 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F7FA]">Candidate Not Found</h3>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {errorMsg || "The requested candidate record does not exist or you do not have permission to view it."}
          </p>
          <Button variant="secondary" size="md" onClick={() => router.push("/candidates")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Candidates Directory
          </Button>
        </div>
      </ApplicationShell>
    );
  }

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Candidates", candidate.full_name]}>
      <PageHeader
        title={candidate.full_name}
        description={`${candidate.headline || "Candidate Profile"} · ${candidate.location || "Workspace Applicant"}`}
        badge={<Badge variant="ai">PostgreSQL Candidate</Badge>}
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
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={openEditModal}>
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="border-[#FF5C67]/40 text-[#FF5C67] hover:bg-[#FF5C67]/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate Information & Document Ingestion */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Candidate Profile Card */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242932]">
              <div className="flex items-center gap-4">
                <Avatar fallback={getInitials(candidate.full_name)} size="xl" />
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-[#F5F7FA] font-display">{candidate.full_name}</h2>
                  <span className="text-xs text-[#39D9FF] font-medium">
                    {candidate.headline || "Registered Workspace Candidate"}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A7AFBC] mt-2">
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#68717E]" /> {candidate.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#68717E]">
                      <Clock className="h-3.5 w-3.5" /> Added {formatDate(candidate.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information & Links */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#A7AFBC]">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#39D9FF]" /> {candidate.email}
                </span>
                {candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#39D9FF]" /> {candidate.phone}
                  </span>
                )}
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#39D9FF] hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> LinkedIn Profile
                  </a>
                )}
                {candidate.portfolio_url && (
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#39D9FF] hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                )}
              </div>

              {/* Background Summary */}
              {candidate.summary && (
                <div className="space-y-1.5 pt-2 border-t border-[#1C2027]">
                  <h4 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                    Background Summary
                  </h4>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed whitespace-pre-line bg-[#0D0F12] p-4 rounded-xl border border-[#242932]/80">
                    {candidate.summary}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Secure Candidate Document Ingestion Pipeline */}
          <CandidateDocumentUploader
            organizationId={organization?.id || "00000000-0000-0000-0000-000000000001"}
            candidateId={candidate.id}
            onSuccess={refreshData}
          />

          {/* Candidate Applications Section (Real Database Joins) */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Job Applications ({applications.length})
                </h3>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0D0F12] border border-[#242932]/60 space-y-2">
                <p className="text-xs text-[#A7AFBC]">
                  No active job applications associated with this candidate.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#1C2027] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[#F5F7FA]">{app.jobTitle}</span>
                      <span className="text-[11px] text-[#A7AFBC]">{app.department}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-[#242932]">
                        {app.status}
                      </Badge>
                      <span className="text-[10px] text-[#68717E] font-mono">{formatDate(app.appliedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Candidate Documents Section (Real Supabase Storage Files) */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Uploaded Candidate Documents ({documents.length})
                </h3>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0D0F12] border border-[#242932]/60 space-y-2">
                <p className="text-xs text-[#A7AFBC]">
                  No document files uploaded yet. Use the upload panel above to ingest resume PDFs.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-[#0D0F12] border border-[#1C2027] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#12151A] border border-[#242932] text-[#39D9FF]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#F5F7FA]">
                          {(doc as unknown as { original_filename?: string; file_name?: string }).original_filename || doc.original_filename}
                        </span>
                        <span className="text-[10px] text-[#A7AFBC] font-mono">
                          {(doc.file_size / 1024).toFixed(1)} KB · {doc.document_type} · Status: {(doc as unknown as { extraction_status?: string; processing_status?: string }).extraction_status || doc.extraction_status}
                        </span>
                      </div>
                    </div>

                    {doc.signedUrl && (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-[#39D9FF] hover:underline gap-1 bg-[#171B21] px-3 py-1.5 rounded-lg border border-[#39D9FF]/20"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Analysis Neutral Banner */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <Sparkles className="h-4 w-4 text-[#A7AFBC]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                AI Evaluation Intelligence
              </h3>
            </div>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              AI analysis not available yet. Automated vector embedding scoring and evidence extraction will occur in future AI pipeline execution steps.
            </p>
          </Card>
        </div>

        {/* Right Column: Metadata Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-[#242932] bg-[#12151A] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Candidate Metadata
            </h3>

            <div className="space-y-3 text-xs text-[#A7AFBC]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#39D9FF]" />
                  <span>Record ID</span>
                </span>
                <span className="font-mono text-[11px] text-[#68717E] truncate max-w-[140px]">
                  {candidate.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#35D07F]" />
                  <span>Created Date</span>
                </span>
                <span className="font-mono text-[#68717E]">{formatDate(candidate.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#F5B942]" />
                  <span>Last Updated</span>
                </span>
                <span className="font-mono text-[#68717E]">{formatDate(candidate.updated_at)}</span>
              </div>
            </div>
          </Card>

          <Card elevated className="p-5 border-[#39D9FF]/30 bg-[#171B21] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
              <Sparkles className="h-4 w-4 text-[#39D9FF]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Multi-Tenant Guard
              </h3>
            </div>
            <p className="text-[11px] text-[#A7AFBC] leading-relaxed">
              This candidate record belongs exclusively to {organization?.name || "your organization"}. Access control is governed by Row Level Security (RLS).
            </p>
          </Card>
        </div>
      </div>

      {/* Edit Candidate Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-xl rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Edit Candidate Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 text-xs text-[#FF5C67] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Full Name *</label>
                  <Input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Email Address *</label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Phone Number</label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Location</label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Professional Headline</label>
                <Input
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="Senior Full-Stack AI Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">LinkedIn URL</label>
                  <Input
                    type="url"
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Portfolio URL</label>
                  <Input
                    type="url"
                    value={editPortfolioUrl}
                    onChange={(e) => setEditPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Summary</label>
                <Textarea
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Candidate summary notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" disabled={editSubmitting}>
                  {editSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1650] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative z-[1750] w-full max-w-md rounded-2xl border border-[#FF5C67]/40 bg-[#12151A] p-6 shadow-2xl space-y-4 text-[#F5F7FA]">
            <div className="flex items-center gap-3 border-b border-[#242932] pb-3 text-[#FF5C67]">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold font-display">Delete Candidate Profile?</h3>
            </div>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              This will permanently remove <strong className="text-[#F5F7FA]">{candidate.full_name}</strong> and associated recruitment records. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCandidate}
                disabled={isDeleting}
                className="border-[#FF5C67]/50 text-[#FF5C67] hover:bg-[#FF5C67]/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1.5" />
                )}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </ApplicationShell>
  );
}
