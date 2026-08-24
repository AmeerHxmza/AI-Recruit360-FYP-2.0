import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getApplicationsForOrgWithDetails } from "@/lib/services/application-service";
import { ApplicationsClientView } from "@/components/applications/applications-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";

export const revalidate = 0; // Dynamic server component

function ApplicationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming Pipeline Applications...</span>
        </div>
      </div>
    </div>
  );
}

async function ApplicationsServerData({ role }: { role: string }) {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const applications = await getApplicationsForOrgWithDetails(ctx.organization.id);

  return (
    <ApplicationsClientView
      initialApplications={applications}
      role={role}
    />
  );
}

export default async function ApplicationsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const orgName = ctx.organization.name;

  return (
    <ApplicationShell
      activeNavId="applications"
      pageBreadcrumb={[orgName || "AI-Recruit360", "Recruitment", "Pipeline"]}
    >
      <Suspense fallback={<ApplicationsSkeleton />}>
        <ApplicationsServerData role={ctx.role} />
      </Suspense>
    </ApplicationShell>
  );
}
