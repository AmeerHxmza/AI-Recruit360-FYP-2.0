import * as React from "react";
import { redirect } from "next/navigation";
import { getOrganizationContext } from "@/lib/auth/session";
import { CandidateClient } from "./candidate-client";
import {
  getCandidateByIdAction,
  getCandidateApplicationsAction,
  getCandidateDocumentsAction,
  getCandidateIntelligenceAction,
} from "@/app/actions/candidates";

export const revalidate = 0; // Dynamic server component

export default async function CandidateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ application?: string }>;
}) {
  const resolvedParams = await params;
  const { application: selectedApplication } = await searchParams;
  const candId = resolvedParams.id;
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  // Fetch all candidate data concurrently on the server to eliminate Request Waterfalls
  const [candRes, appsRes, docsRes, intRes] = await Promise.all([
    getCandidateByIdAction(candId),
    getCandidateApplicationsAction(candId),
    getCandidateDocumentsAction(candId),
    getCandidateIntelligenceAction(candId, selectedApplication),
  ]);

  return (
    <CandidateClient
      key={`${candId}:${selectedApplication || "latest"}`}
      selectedApplication={selectedApplication}
      initialCandidate={candRes.success && candRes.data ? candRes.data : null}
      initialApplications={appsRes.success && appsRes.data ? appsRes.data : []}
      initialDocuments={docsRes.success && docsRes.data ? docsRes.data : []}
      initialIntelligence={intRes.success && intRes.data ? intRes.data : null}
    />
  );
}
