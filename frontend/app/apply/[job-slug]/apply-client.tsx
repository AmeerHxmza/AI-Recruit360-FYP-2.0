"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  submitPublicApplicationAction,
  getPublicApplicationStatusAction,
} from "@/app/actions/applications";
import { runCvScreeningAction } from "@/app/actions/ai-screening";
import type { Job } from "@/lib/services/job-service";
import { CandidateShell } from "@/components/layout/candidate-shell";
import { Button } from "@/components/ui/button";
import { JobContentRenderer } from "@/components/jobs/job-content-renderer";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ApplyPage({ initialJob: job }: { initialJob: Job }) {
  const [applicationId, setApplicationId] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = useRef("");
  useEffect(() => {
    const storageKey = `submission:${job.id}`;
    key.current = sessionStorage.getItem(storageKey) || crypto.randomUUID();
    sessionStorage.setItem(storageKey, key.current);
    const saved = sessionStorage.getItem(`application:${job.id}`);
    if (saved) {
      void getPublicApplicationStatusAction(saved).then((res) => {
        setApplicationId(saved);
        if (res.success && res.data) setStatus(res.data);
        else setError(res.error || "Could not resume this application.");
      });
    }
  }, [job.id]);
  async function screen(id: string) {
    setBusy(true);
    setError("");
    try {
      const result = await runCvScreeningAction(id);
      if (!result.success)
        throw new Error(
          result.error ||
            "Screening is unavailable. Your application is saved.",
        );
      const state = await getPublicApplicationStatusAction(id);
      if (!state.success || !state.data)
        throw new Error(state.error || "Could not refresh your application.");
      setStatus(state.data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not screen your resume. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("job_id", job.id);
    form.set("organization_id", job.organization_id);
    form.set("submission_key", key.current);
    try {
      const file = form.get("cv_file");
      if (
        !(file instanceof File) ||
        file.size === 0 ||
        file.size > 4 * 1024 * 1024
      )
        throw new Error("Upload a PDF or DOCX file up to 4 MB.");
      const res = await submitPublicApplicationAction(form);
      if (!res.success || !res.data)
        throw new Error(res.error || "Could not save your application.");
      const id = res.data.application_id;
      setApplicationId(id);
      setStatus("applied");
      sessionStorage.setItem(`application:${job.id}`, id);
      await screen(id);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not submit. Your form has been preserved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const next =
    status === "assessment"
      ? `/assessment/${applicationId}`
      : status === "interview"
        ? `/interview-room/${applicationId}`
        : null;
  return (
    <CandidateShell step={1}>
      <p className="eyebrow">
        {job.department || "Open position"} ·{" "}
        {job.location || "Location not specified"}
      </p>
      <h1 className="page-title">{job.title}</h1>
      <p className="mt-3 mb-8 text-text-secondary">
        {job.employment_type?.replaceAll("_", " ")} ·{" "}
        {job.workplace_type?.replaceAll("_", " ")}
      </p>
      {error && (
        <div role="alert" className="notice-error mb-6">
          {error}
        </div>
      )}
      {applicationId ? (
        <div className="panel p-8">
          <CheckCircle2 className="mb-4 size-8 text-success" />
          <h2 className="text-xl font-semibold">Application received.</h2>
          <p className="my-4 text-text-secondary">
            {busy
              ? "We are comparing your resume with the role requirements. Keep this page open while we prepare your next step."
              : next
                ? "Your next step is ready. Continue when you are comfortable."
                : ["knocked_out", "assessment_failed", "rejected"].includes(
                      status,
                    )
                  ? "Your application has not met the criteria to advance. The recruitment team can review the result."
                  : ["evaluation", "shortlisted", "hired"].includes(status)
                    ? "Your completed application is available to the recruitment team."
                    : "Your resume is saved. Continue screening to prepare your next step."}
          </p>
          {busy ? (
            <span role="status" className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Processing your resume
            </span>
          ) : next ? (
            <Link className="primary-link" href={next}>
              Continue <ArrowRight className="size-4" />
            </Link>
          ) : ["applied", "screening", "extraction_failed", ""].includes(
              status,
            ) ? (
            <Button onClick={() => void screen(applicationId)}>
              Retry screening
            </Button>
          ) : null}
          <p className="mt-6 text-xs text-text-secondary">
            You can return to this link in the same browser within 24 hours to
            resume. If your session expires, contact the recruitment team.
          </p>
        </div>
      ) : (
        <>
          <details className="mb-8 border-y border-border py-4" open>
            <summary className="cursor-pointer text-sm font-semibold">
              About this role
            </summary>
            <div className="prose-copy mt-4">
              <JobContentRenderer content={job.description} />
              {job.requirements && (
                <>
                  <h2 className="mt-5 mb-2 font-semibold">Requirements</h2>
                  <JobContentRenderer content={job.requirements} />
                </>
              )}
            </div>
          </details>
          <form onSubmit={submit} className="panel space-y-5 p-5 sm:p-8">
            <h2 className="text-xl font-semibold">Your application</h2>
            <p className="text-sm text-text-secondary">
              Upload your resume to begin. If you qualify, you can complete an
              assessment and interview in this browser.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { name: "full_name", label: "Full name", type: "text" },
                { name: "email", label: "Email address", type: "email" },
                { name: "phone", label: "Phone number", type: "tel" },
                {
                  name: "location",
                  label: "Location (optional)",
                  type: "text",
                },
              ].map((f) => (
                <label key={f.name} className="form-label">
                  {f.label}
                  <input
                    className="field mt-2"
                    name={f.name}
                    type={f.type}
                    maxLength={f.name === "phone" ? 40 : 120}
                    required={f.name !== "location"}
                    disabled={busy}
                  />
                </label>
              ))}
            </div>
            <label className="form-label block">
              Resume
              <input
                className="field mt-2 file:mr-4 file:rounded file:border-0 file:bg-hover file:px-3 file:py-1"
                type="file"
                name="cv_file"
                accept=".pdf,.docx"
                required
                disabled={busy}
              />
              <span className="mt-2 block text-xs font-normal text-text-secondary">
                PDF or DOCX, up to 4 MB. Use a text-based resume for reliable
                extraction.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-text-secondary">
              <input type="checkbox" required className="mt-1" />
              <span>
                I understand my resume and responses will be processed by AI
                services and shared with the recruitment team.{" "}
                <Link href="/privacy" className="text-action-blue underline">
                  Data use details
                </Link>
              </span>
            </label>
            <Button disabled={busy} type="submit">
              {busy ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving application
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </CandidateShell>
  );
}
