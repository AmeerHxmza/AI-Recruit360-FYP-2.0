"use client";
import Link from "next/link";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen grid place-items-center bg-background p-6">
      <section className="panel max-w-lg p-8 space-y-5">
        <p className="eyebrow">Page unavailable</p>
        <h1 className="text-2xl font-semibold">We couldn’t load this page.</h1>
        <p className="text-text-secondary">
          Please retry. If this continues, check that the project services are
          running and the database migrations have been applied.
        </p>
        <div className="flex gap-5 items-center">
          <button className="primary-link" onClick={reset}>
            Try again
          </button>
          <Link className="text-action-blue text-sm" href="/dashboard">
            Back to workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
