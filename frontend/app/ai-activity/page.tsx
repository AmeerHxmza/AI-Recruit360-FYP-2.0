import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getAiActivityLogsForOrg } from "@/lib/services/ai-activity-service";
import { AiActivityClientView } from "@/components/ai-activity/ai-activity-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function AiActivitySkeleton() {
  return (
    <div className="min-h-screen bg-[#08090B] p-6 space-y-6">
      <div className="h-96 rounded-xl bg-[#12151A] border border-[#242932] animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBC] font-mono">
          <Loader2 className="h-4 w-4 text-[#39D9FF] animate-spin" />
          <span>Streaming AI Event Stream...</span>
        </div>
      </div>
    </div>
  );
}

async function AiActivityServerData() {
  const ctx = await getOrganizationContext();
  if (!ctx) {
    redirect("/onboarding/organization");
  }

  const logs = await getAiActivityLogsForOrg(ctx.organization.id, 50);

  return (
    <AiActivityClientView
      initialLogs={logs}
      orgName={ctx.organization.name}
    />
  );
}

export default function AiActivityPage() {
  return (
    <Suspense fallback={<AiActivitySkeleton />}>
      <AiActivityServerData />
    </Suspense>
  );
}
