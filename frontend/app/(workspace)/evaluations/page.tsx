import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getEvaluationsForOrgWithDetails } from "@/lib/services/evaluation-service";
import { EvaluationsClientView } from "@/components/evaluations/evaluations-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function EvaluationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-surface border border-border animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Aggregating AI Hiring Scorecards &amp; Evaluations...</span>
        </div>
      </div>
    </div>
  );
}

async function EvaluationsServerData({ orgId }: { orgId: string }) {
  const evaluations = await getEvaluationsForOrgWithDetails(orgId);
  return <EvaluationsClientView initialEvaluations={evaluations} />;
}

export default async function EvaluationsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  return (
    <Suspense fallback={<EvaluationsSkeleton />}>
      <EvaluationsServerData orgId={ctx.organization.id} />
    </Suspense>
  );
}
