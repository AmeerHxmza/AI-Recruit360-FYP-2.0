import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getDashboardDataForOrg } from "@/lib/services/dashboard-service";
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ApplicationShell } from "@/components/layout/application-shell";

export const revalidate = 0; // Dynamic server component

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-lg bg-[#12151A] border border-[#242932] animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming Workspace Data...</span>
        </div>
      </div>
    </div>
  );
}

async function DashboardServerData({ userName, orgId }: { userName: string, orgId: string }) {
  const dashboardData = await getDashboardDataForOrg(orgId);

  return (
    <DashboardClientView
      initialData={dashboardData}
      userName={userName}
    />
  );
}

export default async function DashboardPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const userName = ctx.profile.full_name || ctx.user.email?.split("@")[0] || "Recruiter";
  const orgName = ctx.organization.name;

  return (
    <ApplicationShell
      activeNavId="dashboard"
      pageBreadcrumb={[orgName || "AI-Recruit360", "Command Center", "Overview"]}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardServerData userName={userName} orgId={ctx.organization.id} />
      </Suspense>
    </ApplicationShell>
  );
}
