import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export function CandidateShell({
  step,
  children,
  interview = false,
}: {
  step: number;
  children: React.ReactNode;
  interview?: boolean;
}) {
  return (
    <div
      className={`min-h-screen bg-background text-foreground ${interview ? "interview-shell" : ""}`}
    >
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <BrandLogo />
          <span className="text-xs text-text-secondary">
            Candidate experience
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <ol
          aria-label="Application progress"
          className="mb-10 flex gap-2 border-b border-border pb-5 text-xs sm:gap-8 sm:text-sm"
        >
          {["Application", "Assessment", "Interview"].map((label, i) => (
            <li
              key={label}
              aria-current={step === i + 1 ? "step" : undefined}
              className={`flex items-center gap-2 ${step === i + 1 ? "font-semibold text-action-blue" : "text-text-secondary"}`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${step === i + 1 ? "border-action-blue bg-action-blue/10" : "border-border"}`}
              >
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        {interview ? (
          <div className="interview-content">{children}</div>
        ) : (
          children
        )}
        <footer className="mt-10 border-t border-border pt-5 text-xs leading-6 text-text-secondary">
          Your responses are shared with the recruitment team for this role. AI
          supports the review; the team makes the final hiring decision.{" "}
          <Link href="/privacy" className="underline">
            How your data is used
          </Link>
        </footer>
      </main>
    </div>
  );
}
