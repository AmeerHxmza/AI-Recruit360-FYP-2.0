"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { canManageCandidates } from "@/lib/auth/permissions";
import {
  getCandidatesAction,
  createCandidateAction,
  deleteCandidateAction,
  getCandidateCountsAction,
} from "@/app/actions/candidates";
import { Candidate } from "@/lib/services/candidate-service";
import {
  Users,
  Sparkles,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin,
  Globe,
  Clock,
  X,
  UserPlus,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useWorkspaceCache } from "@/providers/data-cache-provider";

export default function CandidatesPage() {
  const router = useRouter();
  const { role, organization } = useAuth();
  const { cache } = useWorkspaceCache();
  const isAuthorizedToManage = canManageCandidates(role);

  const initialCachedCandidates = Array.isArray(cache?.candidates) ? (cache.candidates as Candidate[]) : [];
  const [candidates, setCandidates] = React.useState<Candidate[]>(initialCachedCandidates);
  const [loading, setLoading] = React.useState<boolean>(initialCachedCandidates.length === 0);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Pagination state
  const [page, setPage] = React.useState<number>(1);
  const [pageSize] = React.useState<number>(20);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalCandidates, setTotalCandidates] = React.useState<number>(initialCachedCandidates.length);

  // Metrics state
  const [counts, setCounts] = React.useState({
    total: initialCachedCandidates.length,
    withLocation: initialCachedCandidates.filter(c => !!c.location).length,
    withLinkedin: initialCachedCandidates.filter(c => !!c.linkedin_url).length,
    recentCount: initialCachedCandidates.length,
  });

  // Modal State for Candidate Creation
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalErrorMsg, setModalErrorMsg] = React.useState<string | null>(null);

  // Deletion Modal State
  const [candidateToDelete, setCandidateToDelete] = React.useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadCandidates = React.useCallback(async () => {
    setErrorMsg(null);

    const [res, countsRes] = await Promise.all([
      getCandidatesAction({ search: searchQuery, page, pageSize }),
      getCandidateCountsAction(),
    ]);

    if (res.success && res.data) {
      setCandidates(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalCandidates(res.data.total);
    } else {
      setErrorMsg(res.error || "Unable to fetch candidate directory.");
    }

    if (countsRes.success && countsRes.data) {
      setCounts(countsRes.data);
    }

    setLoading(false);
  }, [searchQuery, page, pageSize]);

  React.useEffect(() => {
    if (cache?.candidates && cache.candidates.length > 0 && !searchQuery && page === 1) {
      return;
    }

    let isMounted = true;
    Promise.all([
      getCandidatesAction({ search: searchQuery, page, pageSize }),
      getCandidateCountsAction(),
    ]).then(([res, countsRes]) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setCandidates(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCandidates(res.data.total);
      } else {
        setErrorMsg(res.error || "Unable to fetch candidate directory.");
      }
      if (countsRes.success && countsRes.data) {
        setCounts(countsRes.data);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [cache?.candidates, searchQuery, page, pageSize, organization?.id]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMsg(null);

    if (!fullName.trim() || !email.trim()) {
      setModalErrorMsg("Full name and valid email address are required.");
      return;
    }

    setIsSubmitting(true);

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
      setIsAddModalOpen(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setHeadline("");
      setSummary("");
      setLinkedinUrl("");
      setPortfolioUrl("");
      loadCandidates();
    } else {
      setModalErrorMsg(res.error || "Failed to create candidate profile.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);

    const res = await deleteCandidateAction(candidateToDelete.id);
    if (res.success) {
      setCandidateToDelete(null);
      loadCandidates();
    } else {
      setErrorMsg(res.error || "Failed to delete candidate profile.");
    }
    setIsDeleting(false);
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "Candidates"]}>
      <PageHeader
        title="Candidate Directory"
        description="Workspace candidate profiles, contact details, and document intelligence storage."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> PostgreSQL Database
          </Badge>
        }
        actions={
          isAuthorizedToManage ? (
            <Button
              variant="ai"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              className="shadow-[0_0_16px_rgba(57,217,255,0.25)]"
            >
              <UserPlus className="h-4 w-4 mr-1.5" /> Add Candidate
            </Button>
          ) : undefined
        }
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Candidates"
          value={counts.total}
          description="Registered profiles"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Recent Submissions"
          value={counts.recentCount}
          description="Added last 7 days"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="LinkedIn Profiles"
          value={counts.withLinkedin}
          description="Verified URLs"
          icon={<Globe className="h-4 w-4" />}
        />
        <MetricCard
          label="Location Records"
          value={counts.withLocation}
          description="Geographic tags"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadCandidates} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Section className="my-0 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#242932] bg-[#12151A]">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search candidates by name, email, headline, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#0D0F12]"
            />
          </div>
        </div>
      </Section>

      {/* Main Candidate Table */}
      <Section title="Candidate Workspace Database">
        {loading ? (
          /* Loading Skeleton State */
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Loading...</p>
          </div>
        ) : candidates.length === 0 ? (
          /* Clean Empty State with image asset */
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-5">
            <div className="relative w-48 h-36 mx-auto rounded-xl overflow-hidden border border-[#242932] bg-[#12151A] shadow-lg">
              <Image
                src="/images/empty-candidates.png"
                alt="No Candidates Found"
                fill
                className="object-cover opacity-90"
              />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold font-display text-[#F5F7FA]">
                {searchQuery ? "No matching candidates found" : "No candidates yet"}
              </h3>
              <p className="text-xs text-[#A7AFBC] leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search query or clear the filter to view all workspace profiles."
                  : "Candidates will appear here when they apply through your public job links."}
              </p>
            </div>

            {isAuthorizedToManage && (
              <Button
                variant="ai"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2"
              >
                <UserPlus className="h-4 w-4 mr-1.5" /> Add First Candidate
              </Button>
            )}
          </div>
        ) : (
          /* Populated Table View */
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-[#242932] bg-[#12151A]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#242932] bg-[#0D0F12]">
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Candidate</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Headline / Title</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Location</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Evaluation Status</TableHead>
                    <TableHead className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Added Date</TableHead>
                    <TableHead className="text-right text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((cand) => (
                    <TableRow
                      key={cand.id}
                      onClick={() => router.push(`/candidates/${cand.id}`)}
                      className="cursor-pointer border-b border-[#1C2027] transition-micro hover:bg-[#171B21]/80"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={getInitials(cand.full_name)} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#F5F7FA] text-xs">
                              {cand.full_name}
                            </span>
                            <span className="text-[11px] text-[#A7AFBC] flex items-center gap-1">
                              <Mail className="h-3 w-3 text-[#39D9FF]" /> {cand.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-[#F5F7FA] font-medium">
                        {(cand as unknown as { headline?: string }).headline || "Candidate Profile"}
                      </TableCell>
                      <TableCell className="text-xs text-[#A7AFBC]">
                        {cand.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#68717E]" /> {cand.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-[#A7AFBC] border-[#242932]">
                          AI Analysis Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#68717E] font-mono">
                        {formatDate(cand.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/candidates/${cand.id}`)}
                            className="h-7 w-7 text-[#A7AFBC] hover:text-[#39D9FF]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          {isAuthorizedToManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCandidateToDelete(cand)}
                              className="h-7 w-7 text-[#A7AFBC] hover:text-[#FF5C67]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Server-Side Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#242932] bg-[#12151A] text-xs text-[#A7AFBC]">
                <span>
                  Showing page <strong className="text-[#F5F7FA]">{page}</strong> of <strong className="text-[#F5F7FA]">{totalPages}</strong> ({totalCandidates} candidates)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Add Candidate Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative z-[1700] w-full max-w-xl rounded-2xl border border-[#39D9FF]/30 bg-[#12151A] p-6 shadow-2xl space-y-5 text-[#F5F7FA] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#242932] pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#39D9FF]" />
                <h3 className="text-lg font-bold font-display text-[#F5F7FA]">Add New Candidate</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#A7AFBC] hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalErrorMsg && (
              <div className="p-3 rounded-lg bg-[#FF5C67]/10 border border-[#FF5C67]/30 text-xs text-[#FF5C67] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Full Name *</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Professional Headline</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack AI Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">LinkedIn URL</label>
                  <Input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A7AFBC]">Portfolio / Github URL</label>
                  <Input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A7AFBC]">Summary / Background Notes</label>
                <Textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief candidate background, key strengths, or referral notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242932]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="ai" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-1.5" />
                  )}
                  Save Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-[1650] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setCandidateToDelete(null)}
          />
          <div className="relative z-[1750] w-full max-w-md rounded-2xl border border-[#FF5C67]/40 bg-[#12151A] p-6 shadow-2xl space-y-4 text-[#F5F7FA]">
            <div className="flex items-center gap-3 border-b border-[#242932] pb-3 text-[#FF5C67]">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold font-display">Delete Candidate Profile?</h3>
            </div>
            <p className="text-xs text-[#A7AFBC] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#F5F7FA]">{candidateToDelete.full_name}</strong>? This action will permanently remove the candidate record and associated workspace data.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCandidateToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteConfirm}
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
