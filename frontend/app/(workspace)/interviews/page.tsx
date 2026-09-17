import { Suspense } from "react";
import { getOrganizationContext } from "@/lib/auth/session";
import { getInterviewsForOrgWithDetails } from "@/lib/services/interview-service";
import { InterviewsClientView } from "@/components/interviews/interviews-client-view";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component

function InterviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-surface border border-border animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Streaming AI Interview Rooms...</span>
        </div>
      </div>
    </div>
  );
}

async function InterviewsServerData() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  const interviews = await getInterviewsForOrgWithDetails(ctx.organization.id);

  return <InterviewsClientView initialInterviews={interviews} />;
}

export default async function InterviewsPage() {
  const ctx = await getOrganizationContext();
  if (!ctx) redirect("/onboarding/organization");

  return (
    <Suspense fallback={<InterviewsSkeleton />}>
      <InterviewsServerData />
    </Suspense>
  );
}
