import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "@/lib/auth/session";
import { canManageCandidates } from "@/lib/auth/permissions";
import { ForbiddenError, NotFoundError, DatabaseError } from "@/lib/utils/errors";
import { validateEmail } from "@/lib/utils/validation";
import { Database } from "@/types/database.types";

export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type CandidateDocument = Database["public"]["Tables"]["candidate_documents"]["Row"];

export async function getCandidatesForOrg(orgId: string): Promise<Candidate[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new DatabaseError("Failed to retrieve candidate directory.");
  }

  return data || [];
}

export async function getCandidateById(orgId: string, candidateId: string): Promise<Candidate> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("organization_id", orgId)
    .eq("id", candidateId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Candidate profile not found.");
  }

  return data;
}

export async function createCandidate(
  orgId: string,
  input: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    headline?: string;
    summary?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  }
): Promise<Candidate> {
  await getCurrentOrganization(orgId);
  const role = await getCurrentRole(orgId);

  if (!canManageCandidates(role)) {
    throw new ForbiddenError("You do not have permission to add candidates.");
  }

  const validEmail = validateEmail(input.email);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .insert({
      organization_id: orgId,
      full_name: input.full_name.trim(),
      email: validEmail,
      phone: input.phone || null,
      location: input.location || null,
      headline: input.headline || null,
      summary: input.summary || null,
      linkedin_url: input.linkedin_url || null,
      portfolio_url: input.portfolio_url || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.message.includes("unique")) {
      throw new DatabaseError("A candidate with this email address already exists in your workspace.");
    }
    throw new DatabaseError("Failed to create candidate profile.");
  }

  return data;
}

export async function getCandidateDocuments(orgId: string, candidateId: string): Promise<CandidateDocument[]> {
  await getCurrentOrganization(orgId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidate_documents")
    .select("*")
    .eq("organization_id", orgId)
    .eq("candidate_id", candidateId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new DatabaseError("Failed to retrieve candidate documents.");
  }

  return data || [];
}
