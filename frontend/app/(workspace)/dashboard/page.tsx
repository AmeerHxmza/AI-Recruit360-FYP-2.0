import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getDashboardDataForOrg } from "@/lib/services/dashboard-service";
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-surface border border-border animate-pulse"
          />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Streaming Workspace Data...</span>
        </div>
      </div>
    </div>
  );
}

async function DashboardServerData({
  userName,
  orgId,
}: {
  userName: string;
  orgId: string;
}) {
  const dashboardData = await getDashboardDataForOrg(orgId);

  return (
    <DashboardClientView initialData={dashboardData} userName={userName} />
  );
}

export default async function DashboardPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const userName =
    ctx.profile.full_name || ctx.user.email?.split("@")[0] || "Recruiter";

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServerData userName={userName} orgId={ctx.organization.id} />
    </Suspense>
  );
}
