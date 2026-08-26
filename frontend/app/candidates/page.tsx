import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getCandidatesForOrg, getCandidateCounts } from "@/lib/services/candidate-service";
import { CandidatesClientView } from "@/components/candidates/candidates-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";

export const revalidate = 0; // Dynamic server component

function CandidatesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-[#12151A] border border-[#242932] animate-pulse" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming Candidate Directory...</span>
        </div>
      </div>
    </div>
  );
}

import { OrganizationRole } from "@/types/database.types";

async function CandidatesServerData({ role, orgId }: { role: OrganizationRole, orgId: string }) {
  const [candidatesResult, counts] = await Promise.all([
    getCandidatesForOrg(orgId, { page: 1, pageSize: 20 }),
    getCandidateCounts(orgId),
  ]);

  return (
    <CandidatesClientView
      initialCandidatesResult={candidatesResult}
      initialCounts={counts}
      role={role}
    />
  );
}

export default async function CandidatesPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const orgName = ctx.organization.name;

  return (
    <ApplicationShell
      activeNavId="candidates"
      pageBreadcrumb={[orgName || "AI-Recruit360", "Directory", "Candidates"]}
    >
      <Suspense fallback={<CandidatesSkeleton />}>
        <CandidatesServerData role={ctx.role} orgId={ctx.organization.id} />
      </Suspense>
    </ApplicationShell>
  );
}
