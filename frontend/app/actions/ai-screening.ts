"use me";
"use server";

import { aiServiceClient } from "@/lib/api/ai-service-client";
import { createClient } from "@/lib/supabase/server";

export async function runCvScreeningAction(applicationId: string) {
  try {
    const supabase = await createClient();

    // Fetch application details
    const { data: app, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error || !app) {
      return { success: false, error: "Application record not found." };
    }

    const { data: job } = await supabase.from("jobs").select("*").eq("id", app.job_id).single();
    const { data: cand } = await supabase.from("candidates").select("*").eq("id", app.candidate_id).single();
    const { data: docs } = await supabase.from("candidate_documents").select("*").eq("application_id", applicationId);

    if (!job || !cand) {
      return { success: false, error: "Associated job position or candidate profile not found." };
    }

    // Get CV text
    let cvText = "";
    if (docs && docs.length > 0 && docs[0].extracted_text) {
      cvText = docs[0].extracted_text;
    } else {
      cvText = `${cand.full_name} - Experienced Applicant for ${job.title}. Email: ${cand.email}.`;
    }

    // Call Python FastAPI AI Engine
    const result = await aiServiceClient.screenApplication({
      application_id: applicationId,
      job_title: job.title,
      job_description: job.description || "",
      job_requirements: job.requirements || null,
      cv_text: cvText,
      candidate_name: cand.full_name,
      organization_id: app.organization_id,
      candidate_id: app.candidate_id,
      job_id: app.job_id,
    });

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run CV screening via Python AI backend.";
    return { success: false, error: msg };
  }
}
