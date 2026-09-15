import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <BrandLogo />
      <h1 className="page-title mt-12">How application data is used</h1>
      <div className="mt-8 space-y-7 leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            What you submit
          </h2>
          <p>
            The application collects your name, contact details and resume. If
            you continue, it also records assessment answers and interview
            responses.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            AI processing and recruiter review
          </h2>
          <p>
            Resume text and interview responses are sent to the configured AI
            provider to prepare questions and evaluation suggestions. If you
            record audio, it is sent to the transcription provider. You can type
            instead. Recruiters in the hiring organization can review your
            application and its results.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            Access and retention
          </h2>
          <p>
            Your resume is stored in private storage. Candidate access uses a
            session in the browser where the application was submitted, expiring
            after 24 hours. Contact the organization that shared the job link to
            request access help, correction or deletion. This FYP has no
            automatic retention schedule; the project operator must manage
            retained data.
          </p>
        </section>
        <p>
          This is an academic recruitment project. AI output can be incomplete
          or incorrect and should be reviewed by a person before a hiring
          decision.
        </p>
        <Link className="inline-block text-action-blue underline" href="/">
          Return to homepage
        </Link>
      </div>
    </main>
  );
}
