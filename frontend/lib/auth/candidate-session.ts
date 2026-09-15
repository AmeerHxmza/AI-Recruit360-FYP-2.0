import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentOrganization, getCurrentRole } from "./session";
import { canManageApplications } from "./permissions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lifetime = 60 * 60 * 24;

export function validateCandidateSessionConfiguration() {
  const secret =
    process.env.CANDIDATE_SESSION_SECRET ||
    process.env.AI_SERVICE_SHARED_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "Configure a candidate session secret of at least 32 characters.",
    );
  return secret;
}

function signature(value: string) {
  const secret = validateCandidateSessionConfiguration();
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function issueCandidateSession(applicationId: string) {
  const expires = Math.floor(Date.now() / 1000) + lifetime;
  const value = `${applicationId}.${expires}`;
  (await cookies()).set(
    `air360_candidate_${applicationId}`,
    `${value}.${signature(value)}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: lifetime,
    },
  );
}

export async function requireCandidateSession(applicationId: string) {
  if (!UUID.test(applicationId))
    throw new Error("Invalid application identifier.");
  const token = (await cookies()).get(
    `air360_candidate_${applicationId}`,
  )?.value;
  const [id, expires, mac] = token?.split(".") || [];
  if (
    id !== applicationId ||
    !expires ||
    !mac ||
    !/^[a-f0-9]{64}$/.test(mac) ||
    Number(expires) <= Date.now() / 1000
  ) {
    throw new Error(
      "This application session has expired. Please contact the recruitment team.",
    );
  }
  const expected = signature(`${id}.${expires}`);
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected)))
    throw new Error("Invalid application session.");
}

/** Candidate sessions authorize this application only; recruiter access still uses membership/RLS. */
export async function requireApplicationAccess(
  applicationId: string,
  recruiterAllowed = false,
) {
  if (!UUID.test(applicationId))
    throw new Error("Invalid application identifier.");
  try {
    await requireCandidateSession(applicationId);
  } catch (error) {
    if (!recruiterAllowed) throw error;
    const org = await getCurrentOrganization();
    if (!canManageApplications(await getCurrentRole(org.id)))
      throw new Error("Recruiter permission is required to run screening.");
    const db = await createAdminClient();
    const { data } = await db
      .from("applications")
      .select("id")
      .eq("id", applicationId)
      .eq("organization_id", org.id)
      .single();
    if (!data) throw new Error("Application not found in this workspace.");
  }
}

export async function requireAssessmentAccess(assessmentId: string) {
  if (!UUID.test(assessmentId))
    throw new Error("Invalid assessment identifier.");
  const db = await createAdminClient();
  const { data } = await db
    .from("assessments")
    .select("application_id")
    .eq("id", assessmentId)
    .single();
  if (!data) throw new Error("Assessment not found.");
  await requireCandidateSession(data.application_id);
  return data.application_id;
}

export async function requireInterviewAccess(interviewId: string) {
  if (!UUID.test(interviewId)) throw new Error("Invalid interview identifier.");
  const db = await createAdminClient();
  const { data } = await db
    .from("interviews")
    .select("application_id")
    .eq("id", interviewId)
    .single();
  if (!data) throw new Error("Interview not found.");
  await requireCandidateSession(data.application_id);
  return data.application_id;
}
