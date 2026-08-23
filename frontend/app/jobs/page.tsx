import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getJobsForOrg } from "@/lib/services/job-service";
import { JobsClientView } from "@/components/jobs/jobs-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function JobsSkeleton() {
  return (
    <div className="min-h-screen bg-[#08090B] p-6 space-y-6">
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming Jobs Directory...</span>
        </div>
      </div>
    </div>
  );
}

async function JobsServerData() {
  const ctx = await getOrganizationContext();
  if (!ctx) {
    redirect("/onboarding/organization");
  }

  const jobs = await getJobsForOrg(ctx.organization.id);

  return (
    <JobsClientView
      initialJobs={jobs}
      role={ctx.role}
      orgName={ctx.organization.name}
    />
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsSkeleton />}>
      <JobsServerData />
    </Suspense>
  );
}
