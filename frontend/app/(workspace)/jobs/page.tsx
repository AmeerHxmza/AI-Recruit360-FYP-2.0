import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getJobsForOrg } from "@/lib/services/job-service";
import { JobsClientView } from "@/components/jobs/jobs-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function JobsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Streaming Jobs Directory...</span>
        </div>
      </div>
    </div>
  );
}

import { OrganizationRole } from "@/types/database.types";

async function JobsServerData({
  role,
  orgId,
}: {
  role: OrganizationRole;
  orgId: string;
}) {
  const jobs = await getJobsForOrg(orgId);

  return <JobsClientView key={orgId} initialJobs={jobs} role={role} />;
}

export default async function JobsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  return (
    <Suspense fallback={<JobsSkeleton />}>
      <JobsServerData role={ctx.role} orgId={ctx.organization.id} />
    </Suspense>
  );
}
