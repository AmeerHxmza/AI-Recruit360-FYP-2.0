import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ListChecks,
  Video,
  Check,
  LockKeyhole,
  MousePointer2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ProductPreview } from "@/components/landing/product-preview";
import styles from "./home.module.css";

const features = [
  {
    icon: FileText,
    label: "Resume screening",
    title: "Go beyond the keyword match.",
    text: "Review skills and experience alongside excerpts from the candidate’s resume.",
    detail: "Job-specific evaluation",
    number: "01",
  },
  {
    icon: ListChecks,
    label: "Skills assessment",
    title: "Give experience a practical check.",
    text: "Ten timed questions shaped around the role and the candidate’s background.",
    detail: "Consistent, timed assessments",
    number: "02",
  },
  {
    icon: Video,
    label: "Structured interviews",
    title: "Understand how they think.",
    text: "Let candidates explain their approach through typed or recorded answers to an AI interviewer.",
    detail: "Answers your team can review",
    number: "03",
  },
];
export default function Home() {
  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <BrandLogo size="md" />
          <nav aria-label="Main navigation">
            <a href="#product">Product</a>
            <a href="#workflow">How it works</a>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className={styles.smallCta}>
              Get started <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            <span /> Your next hire starts here.
          </p>
          <h1>
            A clearer view.
            <br />
            <span>A better hiring decision.</span>
          </h1>
          <p className={styles.intro}>
            Resumes, assessments, and interviews.
            <br className={styles.desktopBreak} /> One workspace to bring the
            right people into focus.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={styles.primary}>
              Create your workspace <ArrowRight size={17} />
            </Link>
            <a href="#product" className={styles.secondary}>
              Explore the product <ArrowRight size={16} />
            </a>
          </div>
          <div className={styles.assurances}>
            <span>
              <Check /> Evidence alongside scores
            </span>
            <span>
              <Check /> Your team makes the decision
            </span>
          </div>
        </section>
        <section
          id="product"
          aria-label="Interactive product preview"
          className={styles.product}
        >
          <div className={styles.previewLabel}>
            <span>THE WORKSPACE, AT A GLANCE</span>
            <span>
              <MousePointer2 size={13} /> Try the candidate cards and tabs
            </span>
          </div>
          <ProductPreview />
          <div className={styles.caption}>
            <span>From the first application to your final review.</span>
            <span>
              <LockKeyhole size={13} /> Private resume storage
            </span>
          </div>
        </section>
        <section id="workflow" className={styles.features}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>LESS SWITCHING. MORE CLARITY.</p>
              <h2>
                Every stage.
                <br />
                The same clear picture.
              </h2>
            </div>
            <p>
              Create a role, share its application link, and review each
              eligible candidate’s progress in one place.
            </p>
          </div>
          <div className={styles.cards}>
            {features.map(
              ({ icon: Icon, label, title, text, detail, number }) => (
                <article key={label} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.icon}>
                      <Icon size={21} />
                    </span>
                    <span>{number}</span>
                  </div>
                  <p className={styles.cardLabel}>{label}</p>
                  <h3>{title}</h3>
                  <p className={styles.cardText}>{text}</p>
                  <div className={styles.cardBottom}>
                    <Check size={14} />
                    <span>{detail}</span>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
        <section className={styles.review}>
          <div>
            <p className={styles.kicker}>BUILT AROUND YOUR JUDGEMENT</p>
            <h2>
              AI supports the process.
              <br />
              You choose the person.
            </h2>
            <p>
              Compare the results, read the answers, and make an informed
              decision. Every score is a starting point for your review.
            </p>
            <Link href="/signup" className={styles.textLink}>
              Start with your next role <ArrowRight size={17} />
            </Link>
          </div>
          <div className={styles.scorecard}>
            <div className={styles.scorecardHeader}>
              <span>How the score comes together</span>
              <ListChecks size={19} />
            </div>
            {[
              ["Resume match", 40],
              ["Skills assessment", 25],
              ["Interview", 35],
            ].map(([label, weight]) => (
              <div className={styles.scoreRow} key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{weight}%</strong>
                </div>
                <div className={styles.scoreTrack}>
                  <span style={{ width: `${weight}%` }} />
                </div>
              </div>
            ))}
            <p>Three perspectives. One combined evaluation.</p>
          </div>
        </section>
        <section className={styles.closing}>
          <h2>Make room for your next great hire.</h2>
          <p>Bring your recruitment process together.</p>
          <Link href="/signup" className={styles.primary}>
            Create your workspace <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <BrandLogo size="sm" />
        <span>AI-assisted recruitment. Human decisions.</span>
        <Link href="/privacy">
          Privacy &amp; data use <ArrowRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
