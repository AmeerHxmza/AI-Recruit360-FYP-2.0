"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { loadSettingsAction, saveSettingsAction } from "@/app/actions/settings";
import {
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const [values, setValues] = useState<Awaited<
    ReturnType<typeof loadSettingsAction>
  > | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadSettingsAction()
      .then(setValues)
      .catch(() => {
        setFailed(true);
        setMessage("Could not load settings. Please refresh.");
      });
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
          title="Account & Workspace Settings"
          description="Manage your profile identity, recruiter workspace preferences, and security."
        />

        {message && (
          <div
            role="status"
            className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-all ${
              failed
                ? "border-danger/30 bg-danger/10 text-danger"
                : "border-success/30 bg-success/10 text-success"
            }`}
          >
            {failed ? (
              <AlertCircle className="size-5 shrink-0" />
            ) : (
              <CheckCircle2 className="size-5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {!values ? (
          <div className="panel space-y-6 p-8">
            <div className="flex items-center gap-3 text-text-secondary">
              <Loader2 className="size-5 animate-spin text-action-blue" />
              <span className="text-sm font-medium">Loading workspace settings…</span>
            </div>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setMessage("");
              try {
                const result = await saveSettingsAction(values);
                setFailed(!result.success);
                setMessage(
                  result.success
                    ? "Workspace settings successfully updated."
                    : result.error || "Could not save settings.",
                );
              } catch {
                setFailed(true);
                setMessage("Could not connect to server. Please retry.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {/* Personal Profile Card */}
            <div className="panel space-y-6 p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border/80 pb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-action-blue/10 text-action-blue">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Personal Profile
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Your recruiter identity across interviews and assessments
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="full-name"
                      className="field w-full rounded-xl pl-3 pr-3 py-2.5 text-sm"
                      required
                      maxLength={100}
                      value={values.name}
                      onChange={(e) => setValues({ ...values, name: e.target.value })}
                      placeholder="e.g. Ameer Hamza"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="job-title" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Job Title / Role
                  </label>
                  <div className="relative">
                    <input
                      id="job-title"
                      className="field w-full rounded-xl pl-3 pr-3 py-2.5 text-sm"
                      maxLength={100}
                      value={values.title}
                      onChange={(e) => setValues({ ...values, title: e.target.value })}
                      placeholder="e.g. Lead Technical Recruiter"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Email Address
                    </label>
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      <ShieldCheck className="size-3 text-action-blue" />
                      Verified Login
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="email"
                      className="field w-full rounded-xl bg-background/50 pl-3 pr-3 py-2.5 text-sm text-text-secondary cursor-not-allowed"
                      value={values.email}
                      readOnly
                      title="Email cannot be changed directly"
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Contact your administrator to transfer account ownership to a different email.
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace & Organization Card */}
            <div className="panel space-y-6 p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-border/80 pb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Organization Workspace
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Tenant workspace configuration and hiring team settings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="org-name" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Workspace Name
                  </label>
                  <input
                    id="org-name"
                    className="field w-full rounded-xl pl-3 pr-3 py-2.5 text-sm"
                    required
                    maxLength={100}
                    disabled={!values.canEditOrganization}
                    value={values.organization}
                    onChange={(e) =>
                      setValues({ ...values, organization: e.target.value })
                    }
                    placeholder="Company or Team Name"
                  />
                  {!values.canEditOrganization && (
                    <p className="text-[11px] text-text-secondary">
                      Only organization owners and administrators can rename this workspace.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Password Card */}
            <div className="panel p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <KeyRound className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Password & Authentication
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Secure your recruiter account with updated credentials
                    </p>
                  </div>
                </div>

                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary hover:bg-hover transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <KeyRound className="size-3.5 text-action-blue" />
                  <span>Change Password</span>
                </Link>
              </div>
            </div>

            {/* Dedicated Action Bar with Clear Margin and Separation */}
            <div className="panel mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:px-8 border-t border-border">
              <p className="text-xs text-text-secondary text-center sm:text-left">
                Ensure all details are accurate. Changes take effect across your hiring team immediately.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-action-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-action-blue/90 hover:shadow-md disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving changes…</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary/80 text-center pt-2">
              AI-Recruit360 complies with ethical AI hiring standards. Candidate data remains encrypted within your organization workspace.
            </p>
          </form>
        )}
      </div>
  );
}
