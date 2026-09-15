import Link from "next/link";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  MessageSquare,
  ListChecks,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <BrandLogo />
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/login" className="font-medium">
            Sign in
          </Link>
          <Link href="/signup" className="primary-link">
            Create workspace
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow">HIRING, WITH THE EVIDENCE IN VIEW</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.07] tracking-[-.055em] sm:text-6xl">
              A clearer path from application to decision.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-text-secondary">
              Bring resumes, skills assessments and structured interviews into
              one organized workspace. Review the evidence. Make the decision.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/signup" className="primary-link">
                Set up your workspace
                <ArrowRight className="size-4" />
              </Link>
              <a
                className="text-sm font-medium text-text-secondary"
                href="#workflow"
              >
                See the workflow ↓
              </a>
            </div>
            <p className="mt-8 text-xs text-text-secondary">
              Built for focused recruitment teams. Designed for human review.
            </p>
          </div>
          <div className="panel overflow-hidden">
            <div className="border-b border-border bg-background px-6 py-4">
              <p className="text-sm font-semibold">
                Every decision has a source.
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                The application review workflow
              </p>
            </div>
            <div className="divide-y divide-border px-6">
              {[
                {
                  icon: FileText,
                  title: "Resume evidence",
                  body: "Compare experience with the requirements of the role.",
                },
                {
                  icon: ListChecks,
                  title: "Skills assessment",
                  body: "Review answers to role-specific technical questions.",
                },
                {
                  icon: MessageSquare,
                  title: "Structured interview",
                  body: "Read the candidate’s responses alongside their evaluation.",
                },
                {
                  icon: CheckCircle2,
                  title: "Your decision",
                  body: "Review the full picture before shortlisting or rejecting.",
                },
              ].map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="flex gap-4 py-6">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hover text-action-blue">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-3">
                      <h2 className="text-sm font-semibold">{title}</h2>
                      <span className="text-xs text-text-muted">0{i + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="workflow" className="border-y border-border bg-background">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="eyebrow">ONE CONNECTED WORKFLOW</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Less chasing.
                <br />
                More reviewing.
              </h2>
            </div>
            <ol className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Define the role",
                  text: "Publish a job with clear requirements and share its application link.",
                },
                {
                  title: "Collect the evidence",
                  text: "Candidates submit a resume, complete an assessment and answer interview questions.",
                },
                {
                  title: "Review together",
                  text: "Compare the results in your workspace and record the next hiring decision.",
                },
              ].map((step, i) => (
                <li key={step.title}>
                  <span className="mb-4 block text-sm font-semibold text-action-blue">
                    {i + 1}
                  </span>
                  <h3 className="mb-3 font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Your next hire starts with a clear process.
            </h2>
            <p className="mt-3 text-text-secondary">
              Create a workspace and publish your first role.
            </p>
          </div>
          <Link href="/signup" className="primary-link">
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-text-secondary sm:px-8">
          <span>Recruit360 · Recruitment intelligence</span>
          <div className="flex gap-5">
            <Link href="/privacy">Data use</Link>
            <Link href="/login">Recruiter sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
