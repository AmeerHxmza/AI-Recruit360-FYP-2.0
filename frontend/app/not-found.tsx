import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <section className="panel max-w-md p-8 space-y-5">
        <p className="eyebrow">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-text-secondary">
          Check the link or return to Recruit360.
        </p>
        <Link className="primary-link" href="/">
          Go to home
        </Link>
      </section>
    </main>
  );
}
