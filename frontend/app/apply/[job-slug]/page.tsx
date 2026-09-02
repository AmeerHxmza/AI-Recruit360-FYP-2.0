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
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-[#1E293B] bg-[#131B2A] text-center space-y-4 shadow-xl">
          <XCircle className="h-10 w-10 text-[#EF4444] mx-auto" />
          <h2 className="text-lg font-bold tracking-tight text-[#F8FAFC]">Position Unavailable</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {jobRes.error || "This job link is invalid or expired."}
          </p>
          <Link href="/" className="inline-block px-4 py-2 rounded-lg bg-[#182236] border border-[#1E293B] text-xs text-[#38BDF8] hover:bg-[#1E293B]">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <PublicCandidateApplyClient initialJob={jobRes.data} />;
}
