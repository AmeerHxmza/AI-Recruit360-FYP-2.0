import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getJobsForOrg } from "@/lib/services/job-service";
import { JobsClientView } from "@/components/jobs/jobs-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";

export const revalidate = 0; // Dynamic server component

function JobsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 rounded-xl bg-[#131B2A] border border-[#1E293B] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
          <Loader2 className="h-4 w-4 text-[#38BDF8] animate-spin" />
          <span>Streaming Jobs Directory...</span>
        </div>
      </div>
    </div>
  );
}

import { OrganizationRole } from "@/types/database.types";

async function JobsServerData({ role, orgId }: { role: OrganizationRole, orgId: string }) {
  const jobs = await getJobsForOrg(orgId);

  return (
    <JobsClientView
      initialJobs={jobs}
      role={role}
    />
  );
}

export default async function JobsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const orgName = ctx.organization.name;

  return (
    <ApplicationShell
      activeNavId="jobs"
      pageBreadcrumb={[orgName || "AI-Recruit360", "Jobs", "Directory"]}
    >
      <Suspense fallback={<JobsSkeleton />}>
        <JobsServerData role={ctx.role} orgId={ctx.organization.id} />
      </Suspense>
    </ApplicationShell>
  );
}
