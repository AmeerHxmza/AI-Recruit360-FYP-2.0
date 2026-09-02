import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageCandidates } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateEmail } from "@/lib/utils/validation";
import { Database, ApplicationStatus } from "@/types/database.types";
import { measurePerformance } from "@/lib/performance/logger";

export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type CandidateDocument = Database["public"]["Tables"]["candidate_documents"]["Row"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

export interface CandidateFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCandidatesResult {
  data: Candidate[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CandidateApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface CandidateDocumentWithUrl extends CandidateDocument {
  signedUrl?: string | null;
}

export interface CreateCandidateInput {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface UpdateCandidateInput {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

import { getCachedData, invalidateCachePrefix } from "@/lib/redis/cache";

export async function getCandidatesForOrg(
  orgId: string,
  filters?: CandidateFilters
): Promise<PaginatedCandidatesResult> {
  const cacheKey = `org:${orgId}:candidates:${JSON.stringify(filters || {})}`;

  return await getCachedData(cacheKey, async () => {
    const supabase = await createClient();

    const { result } = await measurePerformance("DB Query (getCandidatesForOrg)", async () => {
    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.max(1, Math.min(100, filters?.pageSize || 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("candidates")
      .select("id, organization_id, full_name, email, phone, location, linkedin_url, portfolio_url, created_at, updated_at", { count: "exact" })
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (filters?.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      query = query.or(
        `full_name.ilike.%${term}%,email.ilike.%${term}%,location.ilike.%${term}%`
      );
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      throw new DatabaseError("Failed to retrieve candidate directory.");
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

      return {
        data: (data || []) as Candidate[],
        page,
        pageSize,
        total,
        totalPages,
      };
    });

    return result;
  }, 30);
}

export async function getCandidateById(orgId: string, candidateId: string): Promise<Candidate> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select("id, organization_id, full_name, email, phone, location, linkedin_url, portfolio_url, created_at, updated_at")
    .eq("organization_id", orgId)
    .eq("id", candidateId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Candidate profile not found.");
  }

  return data as Candidate;
}

export async function createCandidate(
  orgId: string,
  input: CreateCandidateInput
): Promise<Candidate> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageCandidates(role)) {
    throw new ForbiddenError("You do not have permission to add candidates.");
  }

  if (!input.full_name || input.full_name.trim().length === 0) {
    throw new DatabaseError("Candidate full name is required.");
  }

  const validEmail = validateEmail(input.email);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .insert({
      organization_id: orgId,
      full_name: input.full_name.trim(),
      email: validEmail,
      phone: input.phone?.trim() || null,
      location: input.location?.trim() || null,
      linkedin_url: input.linkedin_url?.trim() || null,
      portfolio_url: input.portfolio_url?.trim() || null,
    })
    .select("id, organization_id, full_name, email, phone, location, linkedin_url, portfolio_url, created_at, updated_at")
    .single();

  if (error || !data) {
    if (error?.message?.includes("unique") || error?.details?.includes("already exists")) {
      throw new DatabaseError("A candidate with this email address already exists in your workspace.");
    }
    throw new DatabaseError(error?.message || "Failed to create candidate profile.");
  }

  return data;
}

export async function updateCandidate(
  orgId: string,
  candidateId: string,
  input: UpdateCandidateInput
): Promise<Candidate> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageCandidates(role)) {
    throw new ForbiddenError("You do not have permission to edit candidate profiles.");
  }

  await getCandidateById(orgId, candidateId);

  const updatePayload: Database["public"]["Tables"]["candidates"]["Update"] = {};

  if (input.full_name !== undefined) {
    if (!input.full_name.trim()) throw new DatabaseError("Full name cannot be empty.");
    updatePayload.full_name = input.full_name.trim();
  }
  if (input.email !== undefined) {
    updatePayload.email = validateEmail(input.email);
  }
  if (input.phone !== undefined) updatePayload.phone = input.phone.trim() || null;
  if (input.location !== undefined) updatePayload.location = input.location.trim() || null;
  if (input.linkedin_url !== undefined) updatePayload.linkedin_url = input.linkedin_url.trim() || null;
  if (input.portfolio_url !== undefined) updatePayload.portfolio_url = input.portfolio_url.trim() || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .update(updatePayload)
    .eq("organization_id", orgId)
    .eq("id", candidateId)
    .select("id, organization_id, full_name, email, phone, location, linkedin_url, portfolio_url, created_at, updated_at")
    .single();

  if (error || !data) {
    if (error?.message?.includes("unique") || error?.details?.includes("already exists")) {
      throw new DatabaseError("A candidate with this email address already exists in your workspace.");
    }
    throw new DatabaseError(error?.message || "Failed to update candidate profile.");
  }

  return data;
}

export async function deleteCandidate(orgId: string, candidateId: string): Promise<boolean> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageCandidates(role)) {
    throw new ForbiddenError("You do not have permission to delete candidates.");
  }

  await getCandidateById(orgId, candidateId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("organization_id", orgId)
    .eq("id", candidateId);

  if (error) {
    throw new DatabaseError(`Failed to delete candidate: ${error.message}`);
  }

  return true;
}

export async function getCandidateApplications(
  orgId: string,
  candidateId: string
): Promise<CandidateApplicationItem[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      status,
      applied_at,
      jobs!fk_apps_job_org (
        title,
        department
      )
    `)
    .eq("organization_id", orgId)
    .eq("candidate_id", candidateId)
    .order("applied_at", { ascending: false });

  interface ApplicationQueryResult {
    id: string;
    job_id: string;
    status: string;
    applied_at: string;
    jobs: {
      title: string;
      department: string;
    } | null;
  }

  const typedData = data as unknown as ApplicationQueryResult[];

  return typedData.map((item) => ({
    id: item.id,
    jobId: item.job_id,
    jobTitle: item.jobs?.title || "Position Role",
    department: item.jobs?.department || "General",
    status: item.status as ApplicationStatus,
    appliedAt: item.applied_at,
  }));
}

export async function getCandidateDocuments(
  orgId: string,
  candidateId: string
): Promise<CandidateDocumentWithUrl[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data: docs, error } = await supabase
    .from("candidate_documents")
    .select("id, organization_id, candidate_id, application_id, document_type, storage_path, original_filename, mime_type, file_size, extraction_status, created_at, updated_at")
    .eq("organization_id", orgId)
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error || !docs) {
    return [];
  }

  const result: CandidateDocumentWithUrl[] = [];

  const adminClient = await createAdminClient();

  for (const doc of docs) {
    let signedUrl: string | null = null;
    try {
      const { data: signedData } = await adminClient.storage
        .from("candidate_documents")
        .createSignedUrl(doc.storage_path, 3600);
      signedUrl = signedData?.signedUrl || null;
    } catch {
      signedUrl = null;
    }

    result.push({
      ...(doc as CandidateDocument),
      signedUrl,
    });
  }

  return result;
}

export async function getCandidateCounts(orgId: string): Promise<{
  total: number;
  withLocation: number;
  withLinkedin: number;
  recentCount: number;
}> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data } = await supabase
    .from("candidates")
    .select("location, linkedin_url, created_at")
    .eq("organization_id", orgId);

  if (!data) {
    return { total: 0, withLocation: 0, withLinkedin: 0, recentCount: 0 };
  }

  const total = data.length;
  const withLocation = data.filter((c) => Boolean(c.location)).length;
  const withLinkedin = data.filter((c) => Boolean(c.linkedin_url)).length;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentCount = data.filter((c) => new Date(c.created_at).getTime() >= sevenDaysAgo).length;

  return { total, withLocation, withLinkedin, recentCount };
}
