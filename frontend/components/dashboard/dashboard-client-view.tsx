"use client";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { DashboardData } from "@/lib/services/dashboard-service";

export function DashboardClientView({
  initialData: data,
  userName,
}: {
  initialData: DashboardData;
  userName: string;
}) {
  const metrics = [
    {
      label: "Active jobs",
      value: data.metrics.activeJobs,
      detail: "Open for applications",
      href: "/jobs",
    },
    {
      label: "Applications",
      value: data.metrics.totalApplications,
      detail: "Across your workspace",
      href: "/applications",
    },
    {
      label: "Passed screening",
      value: data.aiSummary.qualifiedCount,
      detail: "Ready for the next stage",
      href: "/applications",
    },
    {
      label: "Interview sessions",
      value: data.metrics.aiInterviews,
      detail: "Active and completed",
      href: "/interviews",
    },
  ];
  const stages = [
    { label: "Applications received", value: data.funnel.applied },
    { label: "Resumes screened", value: data.funnel.screening },
    { label: "Assessments started", value: data.funnel.assessment },
    { label: "Interviews started", value: data.funnel.interview },
    { label: "Evaluations ready", value: data.funnel.evaluation },
  ];
  const score = (value: number | null) =>
    value === null ? (
      <span className="text-text-muted">—</span>
    ) : (
      <span className="tabular-nums font-medium">
        {Math.round(value)}
        <span className="text-text-muted text-xs"> / 100</span>
      </span>
    );
  const status = (value: string) =>
    ({
      knocked_out: "Not advanced",
      assessment_failed: "Assessment not passed",
      extraction_failed: "Resume needs review",
      evaluation: "Ready for review",
    })[value] || value.replaceAll("_", " ");
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Your recruitment workspace</p>
          <h1 className="page-title">Overview</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome back, {userName.split(" ")[0]}. Here’s where your hiring
            stands.
          </p>
        </div>
        <Link className="primary-link" href="/jobs/new">
          <Plus className="size-4" />
          Create a job
        </Link>
      </header>
      <section
        aria-label="Workspace metrics"
        className="grid grid-cols-2 lg:grid-cols-4 border border-border rounded-xl bg-surface divide-x divide-border"
      >
        {metrics.map((metric) => (
          <Link
            href={metric.href}
            key={metric.label}
            className="p-5 sm:p-6 hover:bg-hover"
          >
            <p className="text-sm text-text-secondary">{metric.label}</p>
            <p className="my-3 text-3xl font-semibold tracking-tight tabular-nums">
              {metric.value}
            </p>
            <p className="text-xs text-text-muted">{metric.detail}</p>
          </Link>
        ))}
      </section>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <section className="panel min-w-0">
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Recent applications</h2>
              <p className="mt-1 text-xs text-text-secondary">
                Saved evidence, from resume to interview.
              </p>
            </div>
            <Link
              className="text-sm text-action-blue inline-flex gap-1 items-center shrink-0"
              href="/applications"
            >
              View all
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          {data.recentApplications.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-text-secondary text-xs">
                  <tr>
                    {[
                      "Candidate",
                      "CV match",
                      "Assessment",
                      "Interview",
                      "Stage",
                    ].map((label) => (
                      <th
                        className="px-5 py-3 font-medium whitespace-nowrap"
                        key={label}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-border hover:bg-hover"
                    >
                      <td className="px-5 py-4">
                        <Link
                          className="font-medium hover:text-action-blue whitespace-nowrap"
                          href={`/candidates/${application.candidateId}?application=${application.id}`}
                        >
                          {application.candidateName}
                        </Link>
                        <p className="text-xs text-text-secondary mt-1">
                          {application.jobTitle}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {score(application.cvMatch)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {score(application.assessmentScore)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {score(application.interviewScore)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs capitalize whitespace-nowrap ${application.status === "evaluation" ? "bg-action-blue/10 text-action-blue" : "bg-background text-text-secondary"}`}
                        >
                          {status(application.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <h3 className="font-semibold">
                Your first application starts with a job.
              </h3>
              <p className="mx-auto mt-2 mb-5 max-w-sm text-sm text-text-secondary">
                Publish a role, share its link, and candidate applications will
                appear here.
              </p>
              <Link
                className="text-sm text-action-blue underline"
                href="/jobs/new"
              >
                Create your first job
              </Link>
            </div>
          )}
          <p className="border-t border-border px-5 py-3 text-xs text-text-muted">
            A dash means that a stage has not been completed.
          </p>
        </section>
        <aside className="space-y-5">
          <section className="panel p-5">
            <h2 className="font-semibold">Pipeline progress</h2>
            <p className="text-xs text-text-secondary mt-1 mb-6">
              Applications reaching each stage.
            </p>
            <ol className="space-y-5">
              {stages.map((stage, index) => (
                <li key={stage.label}>
                  <div className="flex justify-between gap-2 text-xs mb-2">
                    <span className="text-text-secondary">
                      {index + 1}. {stage.label}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {stage.value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-action-blue"
                      style={{
                        width: `${data.funnel.total ? Math.min(100, (stage.value / data.funnel.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold">Review before deciding</h2>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              AI scores summarize the evidence. Read the candidate’s answers and
              supporting details before making a hiring decision.
            </p>
            <Link
              className="mt-4 inline-flex gap-1 items-center text-sm text-action-blue"
              href="/evaluations"
            >
              Open evaluations
              <ArrowUpRight className="size-4" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
