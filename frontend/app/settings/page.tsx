"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { loadSettingsAction, saveSettingsAction } from "@/app/actions/settings";

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
    <ApplicationShell pageBreadcrumb={["Workspace", "Settings"]}>
      <PageHeader
        title="Settings"
        description="Your profile and workspace details."
      />
      {message && (
        <p
          role="status"
          className={failed ? "notice-error mb-5" : "mb-5 text-success"}
        >
          {message}
        </p>
      )}
      {!values ? (
        <p>Loading settings…</p>
      ) : (
        <form
          className="panel max-w-2xl p-6 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              const result = await saveSettingsAction(values);
              setFailed(!result.success);
              setMessage(
                result.success
                  ? "Changes saved."
                  : result.error || "Could not save settings.",
              );
            } catch {
              setFailed(true);
              setMessage("Could not connect. Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-lg font-semibold">Profile</h2>
          <label className="form-label">
            Full name
            <input
              className="field mt-2"
              required
              maxLength={100}
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </label>
          <label className="form-label">
            Job title
            <input
              className="field mt-2"
              maxLength={100}
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
          </label>
          <label className="form-label">
            Email
            <input className="field mt-2" value={values.email} readOnly />
          </label>
          <label className="form-label">
            Workspace name
            <input
              className="field mt-2"
              required
              maxLength={100}
              disabled={!values.canEditOrganization}
              value={values.organization}
              onChange={(e) =>
                setValues({ ...values, organization: e.target.value })
              }
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button className="primary-link" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <Link
              className="text-action-blue text-sm underline"
              href="/forgot-password"
            >
              Change password
            </Link>
          </div>
          <p className="text-sm text-text-secondary border-t border-border pt-5">
            Assessment rules are configured by the project administrator. AI
            scores support recruiter review; hiring decisions remain with your
            team.
          </p>
        </form>
      )}
    </ApplicationShell>
  );
}
