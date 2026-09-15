import { getPublicJobBySlugAction } from "@/app/actions/jobs";
import PublicCandidateApplyClient from "./apply-client";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { measurePerformance } from "@/lib/performance/logger";

export const revalidate = 0; // Dynamic component

export default async function PublicCandidateApplyPage({
  params,
}: {
  params: Promise<{ "job-slug": string }>;
}) {
  const resolvedParams = await params;
  const jobSlugOrId = resolvedParams["job-slug"];

  const { result: jobRes } = await measurePerformance(
    "fetch-public-job",
    async () => {
      return getPublicJobBySlugAction(jobSlugOrId);
    },
  );

  if (!jobRes.success || !jobRes.data) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface text-center space-y-4 shadow-sm">
          <XCircle className="h-10 w-10 text-danger mx-auto" />
          <h2 className="text-lg font-bold tracking-tight text-text-primary">
            Position Unavailable
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {jobRes.error || "This job link is invalid or expired."}
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-surface border border-border text-xs text-action-blue hover:bg-hover"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <PublicCandidateApplyClient initialJob={jobRes.data} />;
}
