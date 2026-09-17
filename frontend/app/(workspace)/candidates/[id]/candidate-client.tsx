"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSetBreadcrumbs } from "@/providers/breadcrumb-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { canManageCandidates } from "@/lib/auth/permissions";
import {
  getCandidateByIdAction,
  updateCandidateAction,
  deleteCandidateAction,
  getCandidateApplicationsAction,
  getCandidateDocumentsAction,
  getCandidateIntelligenceAction,
} from "@/app/actions/candidates";
import { updateApplicationStatusAction } from "@/app/actions/applications";
import {
  Candidate,
  CandidateApplicationItem,
  CandidateDocumentWithUrl,
} from "@/lib/services/candidate-service";
import { CandidateIntelligence } from "@/lib/services/candidate-intelligence-service";
import { CandidateIntelligencePanel } from "@/components/candidates/candidate-intelligence-panel";
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

export interface CandidateClientProps {
  selectedApplication?: string;
  initialCandidate: Candidate | null;
  initialApplications: CandidateApplicationItem[];
  initialDocuments: CandidateDocumentWithUrl[];
  initialIntelligence: CandidateIntelligence | null;
}

export function CandidateClient({
  selectedApplication,
  initialCandidate,
  initialApplications,
  initialDocuments,
  initialIntelligence,
}: CandidateClientProps) {
  const router = useRouter();
  const { role, organization } = useAuth();
  const isAuthorizedToManage = canManageCandidates(role);

  const [candidate, setCandidate] = React.useState<Candidate | null>(
    initialCandidate,
  );
  const [applications, setApplications] =
    React.useState<CandidateApplicationItem[]>(initialApplications);
  const [documents, setDocuments] =
    React.useState<CandidateDocumentWithUrl[]>(initialDocuments);
  const [intelligence, setIntelligence] =
    React.useState<CandidateIntelligence | null>(initialIntelligence);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editFullName, setEditFullName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editLocation, setEditLocation] = React.useState("");
  const [editLinkedinUrl, setEditLinkedinUrl] = React.useState("");
  const [editPortfolioUrl, setEditPortfolioUrl] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [editErrorMsg, setEditErrorMsg] = React.useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const refreshData = React.useCallback(async () => {
    if (!candidate?.id) return;
    const candId = candidate.id;
    const [candRes, appsRes, docsRes, intRes] = await Promise.all([
      getCandidateByIdAction(candId),
      getCandidateApplicationsAction(candId),
      getCandidateDocumentsAction(candId),
      getCandidateIntelligenceAction(candId, selectedApplication),
    ]);

    if (candRes.success && candRes.data) setCandidate(candRes.data);
    if (appsRes.success && appsRes.data) setApplications(appsRes.data);
    if (docsRes.success && docsRes.data) setDocuments(docsRes.data);
    if (intRes.success && intRes.data) setIntelligence(intRes.data);
  }, [candidate, selectedApplication]);

  // Initial data is passed as props, so we don't need a mounting fetch

  const openEditModal = () => {
    if (!candidate) return;
    setEditFullName(candidate.full_name);
    setEditEmail(candidate.email);
    setEditPhone(candidate.phone || "");
    setEditLocation(candidate.location || "");
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

  useSetBreadcrumbs([
    organization?.name || "AI-Recruit360",
    "Candidates",
    candidate?.full_name || (errorMsg ? "Not Found" : "Profile"),
  ]);

  if (errorMsg || !candidate) {
    return (
      <div className="p-12 text-center rounded-2xl border border-border bg-surface space-y-4 max-w-lg mx-auto my-8">
        <AlertCircle className="h-10 w-10 text-danger mx-auto" />
        <h3 className="text-lg font-bold text-text-primary">
          Candidate Not Found
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {errorMsg ||
            "The requested candidate record does not exist or you do not have permission to view it."}
        </p>
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.push("/candidates")}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Candidates
          Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={candidate.full_name}
        description={`${candidate.location || "Workspace Applicant"}`}
        badge={
          intelligence?.application ? (
            <Badge variant="ai" className="capitalize text-xs">
              Stage: {intelligence.application.status.replace("_", " ")}
            </Badge>
          ) : (
            <Badge variant="outline">Candidate Profile</Badge>
          )
        }
        breadcrumbs={
          <button
            type="button"
            onClick={() => router.push("/candidates")}
            className="inline-flex items-center text-xs text-text-secondary hover:text-action-blue transition-micro mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Candidates
            Directory
          </button>
        }
        actions={
          isAuthorizedToManage ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={openEditModal}>
                <Edit3 className="size-4 mr-2" />
                Edit profile
              </Button>
              {intelligence?.application && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={intelligence.application.status !== "evaluation"}
                    onClick={async () => {
                      if (!intelligence.application?.id) return;
                      const result = await updateApplicationStatusAction(
                        intelligence.application.id,
                        "shortlisted",
                      );
                      if (!result.success) {
                        setErrorMsg(
                          result.error || "Could not shortlist candidate.",
                        );
                        return;
                      }
                      await refreshData();
                      router.refresh();
                    }}
                  >
                    Shortlist Candidate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger/40 text-danger hover:bg-danger/10"
                    disabled={intelligence.application.status === "rejected"}
                    onClick={async () => {
                      if (!intelligence.application?.id) return;
                      const result = await updateApplicationStatusAction(
                        intelligence.application.id,
                        "rejected",
                      );
                      if (!result.success) {
                        setErrorMsg(
                          result.error || "Could not reject candidate.",
                        );
                        return;
                      }
                      await refreshData();
                      router.refresh();
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-text-muted hover:text-danger hover:bg-danger/10 text-xs"
                title="Delete candidate record"
              >
                <Trash2 className="h-3.5 w-3.5" />
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
          <Card className="p-6 border-border bg-surface space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <Avatar fallback={getInitials(candidate.full_name)} size="xl" />
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-text-primary font-display">
                    {candidate.full_name}
                  </h2>
                  <span className="text-xs text-action-blue font-medium">
                    Registered Workspace Candidate
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-2">
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-text-muted" />{" "}
                        {candidate.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-xs text-text-muted">
                      <Clock className="h-3.5 w-3.5" /> Added{" "}
                      {formatDate(candidate.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information & Links */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-action-blue" />{" "}
                  {candidate.email}
                </span>
                {candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-action-blue" />{" "}
                    {candidate.phone}
                  </span>
                )}
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-action-blue hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> LinkedIn Profile
                  </a>
                )}
                {candidate.portfolio_url && (
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-action-blue hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Candidate Applications Section (Real Database Joins) */}
          <Card className="p-6 border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-action-blue" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                  Job Applications ({applications.length})
                </h3>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface border border-border/60 space-y-2">
                <p className="text-xs text-text-secondary">
                  No active job applications associated with this candidate.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary">
                        {app.jobTitle}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {app.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="text-xs uppercase font-mono border-border"
                      >
                        {app.status}
                      </Badge>
                      <span className="text-xs text-text-muted font-mono">
                        {formatDate(app.appliedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Candidate Documents Section (Real Supabase Storage Files) */}
          <Card className="p-6 border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-action-blue" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                  Uploaded Candidate Documents ({documents.length})
                </h3>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface border border-border/60 space-y-2">
                <p className="text-xs text-text-secondary">
                  No document files uploaded yet. Use the upload panel above to
                  ingest resume PDFs.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface border border-border text-action-blue">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">
                          {(
                            doc as unknown as {
                              original_filename?: string;
                              file_name?: string;
                            }
                          ).original_filename || doc.original_filename}
                        </span>
                        <span className="text-xs text-text-secondary font-mono">
                          {(doc.file_size / 1024).toFixed(1)} KB ·{" "}
                          {doc.document_type} · Status:{" "}
                          {(
                            doc as unknown as {
                              extraction_status?: string;
                              processing_status?: string;
                            }
                          ).extraction_status || doc.extraction_status}
                        </span>
                      </div>
                    </div>

                    {doc.signedUrl && (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-action-blue hover:underline gap-1 bg-hover px-3 py-1.5 rounded-lg border border-action-blue/20"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Analysis Integration */}
          <CandidateIntelligencePanel
            intelligence={intelligence}
            onStatusChange={refreshData}
          />
        </div>

        {/* Right Column: Metadata Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-border bg-surface space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display border-b border-border pb-3">
              Candidate Metadata
            </h3>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-action-blue" />
                  <span>Record ID</span>
                </span>
                <span className="font-mono text-xs text-text-muted truncate max-w-[140px]">
                  {candidate.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-success" />
                  <span>Created Date</span>
                </span>
                <span className="font-mono text-text-muted">
                  {formatDate(candidate.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-text-secondary" />
                  <span>Last Updated</span>
                </span>
                <span className="font-mono text-text-muted">
                  {formatDate(candidate.updated_at)}
                </span>
              </div>
            </div>
          </Card>

          <Card
            elevated
            className="p-5 border-action-blue/30 bg-hover space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="h-4 w-4 text-action-blue" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
                Multi-Tenant Guard
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              This candidate record belongs exclusively to{" "}
              {organization?.name || "your organization"}. Access control is
              governed by Row Level Security (RLS).
            </p>
          </Card>
        </div>
      </div>

      {/* Edit Candidate Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-xl rounded-2xl border border-action-blue/30 bg-surface p-6 shadow-sm space-y-5 text-text-primary max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold font-display text-text-primary">
                Edit Candidate Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Full Name *
                  </label>
                  <Input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Email Address *
                  </label>
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
                  <label className="text-xs font-semibold text-text-secondary">
                    Phone Number
                  </label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Location
                  </label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    LinkedIn URL
                  </label>
                  <Input
                    type="url"
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Portfolio URL
                  </label>
                  <Input
                    type="url"
                    value={editPortfolioUrl}
                    onChange={(e) => setEditPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="ai"
                  size="sm"
                  disabled={editSubmitting}
                >
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
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative z-[1750] w-full max-w-md rounded-2xl border border-danger/40 bg-surface p-6 shadow-sm space-y-4 text-text-primary">
            <div className="flex items-center gap-3 border-b border-border pb-3 text-danger">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold font-display">
                Delete Candidate Profile?
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              This will permanently remove{" "}
              <strong className="text-text-primary">
                {candidate.full_name}
              </strong>{" "}
              and associated recruitment records. This action cannot be undone.
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
                className="border-danger/50 text-danger hover:bg-danger/10"
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
    </div>
  );
}
