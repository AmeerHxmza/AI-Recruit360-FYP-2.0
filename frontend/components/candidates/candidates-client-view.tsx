"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { canManageCandidates } from "@/lib/auth/permissions";
import {
  getCandidatesAction,
  deleteCandidateAction,
  getCandidateCountsAction,
} from "@/app/actions/candidates";
import {
  Candidate,
  PaginatedCandidatesResult,
} from "@/lib/services/candidate-service";
import { OrganizationRole } from "@/types/database.types";
import {
  Users,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin,
  Globe,
  Clock,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CandidatesClientViewProps {
  initialCandidatesResult: PaginatedCandidatesResult;
  initialCounts: {
    total: number;
    withLocation: number;
    withLinkedin: number;
    recentCount: number;
  };
  role: OrganizationRole;
}

export function CandidatesClientView({
  initialCandidatesResult,
  initialCounts,
  role,
}: CandidatesClientViewProps) {
  const router = useRouter();
  const isAuthorizedToManage = canManageCandidates(role);

  const [candidates, setCandidates] = React.useState<Candidate[]>(
    initialCandidatesResult.data,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Pagination state
  const [page, setPage] = React.useState<number>(initialCandidatesResult.page);
  const [pageSize] = React.useState<number>(initialCandidatesResult.pageSize);
  const [totalPages, setTotalPages] = React.useState<number>(
    initialCandidatesResult.totalPages,
  );
  const [totalCandidates, setTotalCandidates] = React.useState<number>(
    initialCandidatesResult.total,
  );

  // Metrics state
  const [counts, setCounts] = React.useState(initialCounts);

  // Deletion Modal State
  const [candidateToDelete, setCandidateToDelete] =
    React.useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const requestVersion = React.useRef(0);
  const loadCandidates = React.useCallback(
    async (refreshCounts = false) => {
      const version = ++requestVersion.current;
      setLoading(true);
      setErrorMsg(null);

      try {
        const [res, countsRes] = await Promise.all([
          getCandidatesAction({ search: searchQuery, page, pageSize }),
          refreshCounts ? getCandidateCountsAction() : Promise.resolve(null),
        ]);

        if (version !== requestVersion.current) return;
        if (res.success && res.data) {
          setCandidates(res.data.data);
          setTotalPages(res.data.totalPages);
          setTotalCandidates(res.data.total);
        } else {
          setErrorMsg(res.error || "Unable to fetch candidate directory.");
        }

        if (countsRes?.success && countsRes.data) {
          setCounts(countsRes.data);
        }
      } catch {
        if (version === requestVersion.current)
          setErrorMsg("Could not load candidates. Please retry.");
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [searchQuery, page, pageSize],
  );

  // Refetch ONLY when user explicitly types in search or changes pagination page
  const prevSearchRef = React.useRef(searchQuery);
  const prevPageRef = React.useRef(page);
  const prevPageSizeRef = React.useRef(pageSize);

  React.useEffect(() => {
    const versionRef = requestVersion;
    const searchChanged = prevSearchRef.current !== searchQuery;
    const pageChanged = prevPageRef.current !== page;
    const pageSizeChanged = prevPageSizeRef.current !== pageSize;

    prevSearchRef.current = searchQuery;
    prevPageRef.current = page;
    prevPageSizeRef.current = pageSize;

    if (searchChanged || pageChanged || pageSizeChanged) {
      const timer = setTimeout(() => void loadCandidates(), 300);
      return () => {
        clearTimeout(timer);
        ++versionRef.current;
      };
    }
  }, [searchQuery, page, pageSize, loadCandidates]);

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);

    const res = await deleteCandidateAction(candidateToDelete.id);
    if (res.success) {
      setCandidateToDelete(null);
      void loadCandidates(true);
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
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        description="Searchable talent database with contact details and AI screening dossiers."
      />

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total candidates"
          value={counts.total}
          description="Registered talent profiles"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Recent submissions"
          value={counts.recentCount}
          description="Added in last 7 days"
          icon={<Clock className="h-4 w-4" />}
          highlight={true}
        />
        <MetricCard
          label="LinkedIn profiles"
          value={counts.withLinkedin}
          description="Verified profiles attached"
          icon={<Globe className="h-4 w-4" />}
        />
        <MetricCard
          label="Location records"
          value={counts.withLocation}
          description="Geographic locations indexed"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-between text-xs text-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void loadCandidates(true)}
            className="text-danger hover:bg-danger/20"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Section className="my-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface">
          <div className="flex flex-1 items-center gap-3">
            <Input
              type="search"
              placeholder="Search candidates by name, email, role, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              icon={<Search className="h-4 w-4" />}
              className="bg-background"
            />
          </div>
        </div>
      </Section>

      {/* Main Candidate Table */}
      <Section className="my-0">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
            <Loader2 className="h-6 w-6 animate-spin text-action-blue" />
          </div>
        ) : candidates.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-xl border border-border bg-surface space-y-4">
            <div className="h-12 w-12 rounded-xl bg-background border border-border text-text-muted mx-auto flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-semibold text-text-primary">
                {searchQuery
                  ? "No matching candidates found"
                  : "No candidates yet"}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {searchQuery
                  ? "Try clearing your search query to view all organization candidate profiles."
                  : "When candidates apply through public job links, their profiles and screening dossiers appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background hover:bg-background">
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Candidate
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Headline
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Location
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-text-secondary">
                      Added
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium text-text-secondary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((cand) => (
                    <TableRow
                      key={cand.id}
                      onClick={() => router.push(`/candidates/${cand.id}`)}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-hover"
                    >
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={getInitials(cand.full_name)}
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-text-primary text-xs">
                              {cand.full_name}
                            </span>
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <Mail className="h-3 w-3 text-text-muted" />{" "}
                              {cand.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-text-primary">
                        {(cand as unknown as { headline?: string }).headline ||
                          "Candidate Profile"}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {cand.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-text-muted" />{" "}
                            {cand.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Profile active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {formatDate(cand.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/candidates/${cand.id}`)
                            }
                            className="h-7 w-7 text-text-muted hover:text-text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          {isAuthorizedToManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCandidateToDelete(cand)}
                              className="h-7 w-7 text-text-muted hover:text-danger"
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface text-xs text-text-secondary">
                <span>
                  Showing page{" "}
                  <strong className="text-text-primary font-medium">
                    {page}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-text-primary font-medium">
                    {totalPages}
                  </strong>{" "}
                  ({totalCandidates} candidates)
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

      {/* Delete Candidate Confirmation Modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-[1650] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setCandidateToDelete(null)}
          />
          <div className="relative z-[1750] w-full max-w-md rounded-2xl border border-danger/40 bg-surface p-6 shadow-sm space-y-4 text-text-primary">
            <div className="flex items-center gap-3 border-b border-border pb-3 text-danger">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold font-display">
                Delete Candidate Profile?
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-text-primary">
                {candidateToDelete.full_name}
              </strong>
              ? This action will permanently remove the candidate record and
              associated workspace data.
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
