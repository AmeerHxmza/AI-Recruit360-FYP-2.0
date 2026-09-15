"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-md space-y-8">
        <BrandLogo href="/" />
        <form
          className="panel p-7 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("");
            if (password !== confirmation) {
              setMessage("Passwords do not match.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await createClient().auth.updateUser({
                password,
              });
              if (error) throw error;
              setSaved(true);
            } catch {
              setMessage(
                "Could not change your password. Request a new recovery link and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h1 className="text-2xl font-semibold">Set a new password</h1>
          {saved ? (
            <p role="status">
              Password updated.{" "}
              <Link className="text-action-blue underline" href="/dashboard">
                Continue to workspace
              </Link>
            </p>
          ) : (
            <>
              <p className="text-sm text-text-secondary">
                Open this page using the recovery link in your email.
              </p>
              <label className="form-label">
                New password
                <input
                  className="field mt-2"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="form-label">
                Confirm password
                <input
                  className="field mt-2"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
              {message && (
                <p role="alert" className="notice-error">
                  {message}
                </p>
              )}
              <button className="primary-link w-full" disabled={busy}>
                {busy ? "Updating…" : "Update password"}
              </button>
              <Link
                className="block text-sm text-action-blue underline"
                href="/forgot-password"
              >
                Request another recovery link
              </Link>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
