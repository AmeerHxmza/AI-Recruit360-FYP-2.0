"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/providers/auth-provider";
import { canManageJobs } from "@/lib/auth/permissions";
import { createJobAction } from "@/app/actions/jobs";
import type { EmploymentType, WorkplaceType } from "@/types/database.types";

export default function CreateJobPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <PageHeader
        title="Create a job"
        description="Define the role clearly. These requirements guide every candidate assessment."
      />
      {!canManageJobs(role) ? (
        <p>You need recruiter permissions to create a job.</p>
      ) : (
        <form
          className="panel max-w-3xl p-6 sm:p-8 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            const field = (name: string) => String(form.get(name) || "").trim();
            try {
              const result = await createJobAction({
                title: field("title"),
                department: field("department"),
                location: field("location"),
                employment_type: field("employment_type") as EmploymentType,
                workplace_type: field("workplace_type") as WorkplaceType,
                description: field("description"),
                requirements: field("requirements"),
                status: "active",
              });
              if (!result.success || !result.data)
                throw new Error(result.error || "Could not create job.");
              router.push(`/jobs/${result.data.id}`);
              router.refresh();
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Could not connect. Please retry.",
              );
              setBusy(false);
            }
          }}
        >
          <h2 className="text-lg font-semibold">Role details</h2>
          <label className="form-label">
            Job title
            <input
              className="field mt-2"
              name="title"
              required
              maxLength={150}
              placeholder="e.g. Software Engineer"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="form-label">
              Department
              <input
                className="field mt-2"
                name="department"
                required
                maxLength={100}
                placeholder="Engineering"
              />
            </label>
            <label className="form-label">
              Location
              <input
                className="field mt-2"
                name="location"
                required
                maxLength={150}
                placeholder="Lahore, Pakistan"
              />
            </label>
            <label className="form-label">
              Employment
              <select className="field mt-2" name="employment_type">
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </label>
            <label className="form-label">
              Workplace
              <select className="field mt-2" name="workplace_type">
                <option value="on_site">On site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            About the role
            <textarea
              className="field mt-2 min-h-36"
              name="description"
              required
              minLength={40}
              maxLength={12000}
              placeholder="Describe the work, responsibilities, and expected outcomes."
            />
          </label>
          <label className="form-label">
            Requirements
            <textarea
              className="field mt-2 min-h-36"
              name="requirements"
              required
              minLength={20}
              maxLength={8000}
              placeholder="List the skills and experience needed. Distinguish essential requirements from nice-to-haves."
            />
          </label>
          <p className="text-sm text-text-secondary">
            Publishing creates a public application link. You can pause
            applications from the job details page.
          </p>
          {error && (
            <p role="alert" className="notice-error">
              {error}
            </p>
          )}
          <div className="flex items-center gap-5 border-t border-border pt-5">
            <button className="primary-link" disabled={busy}>
              {busy ? "Publishing…" : "Publish job"}
            </button>
            <Link className="text-sm text-text-secondary" href="/jobs">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
