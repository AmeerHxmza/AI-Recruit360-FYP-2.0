import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getEvaluationsForOrgWithDetails } from "@/lib/services/evaluation-service";
import { EvaluationsClientView } from "@/components/evaluations/evaluations-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";

export const revalidate = 0; // Dynamic server component

function EvaluationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-[#12151A] border border-[#242932] animate-pulse" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Aggregating AI Hiring Scorecards &amp; Evaluations...</span>
        </div>
      </div>
    </div>
  );
}

async function EvaluationsServerData() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const evaluations = await getEvaluationsForOrgWithDetails(ctx.organization.id);

  return (
    <EvaluationsClientView
      initialEvaluations={evaluations}
    />
  );
}

export default async function EvaluationsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const orgName = ctx.organization.name;

  return (
    <ApplicationShell
      activeNavId="evaluations"
      pageBreadcrumb={[orgName || "AI-Recruit360", "Evaluations", "Scorecards"]}
    >
      <Suspense fallback={<EvaluationsSkeleton />}>
        <EvaluationsServerData />
      </Suspense>
    </ApplicationShell>
  );
}
