import { getPublicJobBySlugAction } from "@/app/actions/jobs";
import PublicCandidateApplyClient from "./apply-client";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { measurePerformance } from "@/lib/performance/logger";

export const revalidate = 0; // Dynamic component

export default async function PublicCandidateApplyPage({ params }: { params: Promise<{ "job-slug": string }> }) {
  const resolvedParams = await params;
  const jobSlugOrId = resolvedParams["job-slug"];
  
  const { result: jobRes } = await measurePerformance("fetch-public-job", async () => {
    return getPublicJobBySlugAction(jobSlugOrId);
  });

  if (!jobRes.success || !jobRes.data) {
    return (
      <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#242932] bg-[#12151A] text-center space-y-4">
          <XCircle className="h-10 w-10 text-[#FF5C67] mx-auto" />
          <h2 className="text-lg font-bold font-display text-[#F5F7FA]">Position Unavailable</h2>
          <p className="text-xs text-[#A7AFBC] leading-relaxed">
            {jobRes.error || "This job link is invalid or expired."}
          </p>
          <Link href="/" className="inline-block px-4 py-2 rounded-lg bg-[#171B21] border border-[#242932] text-xs text-[#39D9FF]">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <PublicCandidateApplyClient initialJob={jobRes.data} />;
}
