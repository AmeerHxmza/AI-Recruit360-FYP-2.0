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
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming Jobs Directory...</span>
        </div>
      </div>
    </div>
  );
}

async function JobsServerData({ role }: { role: string }) {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const jobs = await getJobsForOrg(ctx.organization.id);

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
        <JobsServerData role={ctx.role} />
      </Suspense>
    </ApplicationShell>
  );
}
