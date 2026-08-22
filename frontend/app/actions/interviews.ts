"use server";

import { revalidatePath } from "next/cache";
import { getCurrentOrganization } from "@/lib/auth/session";
import {
  getInterviewsForOrgWithDetails,
  getInterviewByIdWithDetails,
  createInterview,
  updateInterviewStatus,
  getInterviewQuestions,
  InterviewItemWithDetails,
  Interview,
  InterviewQuestion,
} from "@/lib/services/interview-service";
import { InterviewStatus, InterviewType } from "@/types/database.types";
import { AppError } from "@/lib/utils/errors";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getInterviewsAction(): Promise<ActionResult<InterviewItemWithDetails[]>> {
  try {
    const org = await getCurrentOrganization();
    const interviews = await getInterviewsForOrgWithDetails(org.id);
    return { success: true, data: interviews };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to retrieve interview sessions." };
  }
}

export async function getInterviewByIdAction(
  interviewId: string
): Promise<ActionResult<{ interview: InterviewItemWithDetails; questions: InterviewQuestion[] }>> {
  try {
    const org = await getCurrentOrganization();
    const interview = await getInterviewByIdWithDetails(org.id, interviewId);
    const questions = await getInterviewQuestions(interviewId);
    return { success: true, data: { interview, questions } };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Interview session record not found." };
  }
}

export async function createInterviewAction(input: {
  application_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  interview_type?: InterviewType;
}): Promise<ActionResult<Interview>> {
  try {
    const org = await getCurrentOrganization();
    const interview = await createInterview(org.id, input);

    revalidatePath("/interviews");
    revalidatePath("/applications");
    revalidatePath("/dashboard");

    return { success: true, data: interview };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to schedule interview session." };
  }
}

export async function updateInterviewStatusAction(
  interviewId: string,
  newStatus: InterviewStatus
): Promise<ActionResult<Interview>> {
  try {
    const org = await getCurrentOrganization();
    const interview = await updateInterviewStatus(org.id, interviewId, newStatus);

    revalidatePath("/interviews");
    revalidatePath(`/interviews/${interviewId}`);
    revalidatePath("/dashboard");

    return { success: true, data: interview };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to update interview status." };
  }
}
