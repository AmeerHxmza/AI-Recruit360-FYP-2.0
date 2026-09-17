import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getApplicationsForOrgWithDetails } from "@/lib/services/application-service";
import { ApplicationsClientView } from "@/components/applications/applications-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function ApplicationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Streaming Pipeline Applications...</span>
        </div>
      </div>
    </div>
  );
}

import { OrganizationRole } from "@/types/database.types";

async function ApplicationsServerData({
  role,
  orgId,
}: {
  role: OrganizationRole;
  orgId: string;
}) {
  const applications = await getApplicationsForOrgWithDetails(orgId);

  return (
    <ApplicationsClientView initialApplications={applications} role={role} />
  );
}

export default async function ApplicationsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  return (
    <Suspense fallback={<ApplicationsSkeleton />}>
      <ApplicationsServerData role={ctx.role} orgId={ctx.organization.id} />
    </Suspense>
  );
}
