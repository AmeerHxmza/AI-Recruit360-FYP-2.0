"use client";

import { useState, useRef } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  FileText,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Users,
  Video,
} from "lucide-react";
import styles from "./product-preview.module.css";

const stages = ["Resume", "Assessment", "Interview"];
const candidates = [
  {
    name: "Alex Morgan",
    initials: "AM",
    role: "Full-stack developer",
    skills: ["React", "Python", "PostgreSQL"],
    scores: [86, 80, 84],
    quote:
      "Built a customer portal using React and Python, with PostgreSQL for reporting.",
    answer:
      "I separated the API from the interface so each could be tested and deployed independently.",
  },
  {
    name: "Sam Rivera",
    initials: "SR",
    role: "Backend developer",
    skills: ["Python", "FastAPI", "SQL"],
    scores: [82, 90, 78],
    quote:
      "Developed Python APIs and optimized SQL queries for an inventory application.",
    answer:
      "I first measured the slow queries, then checked the execution plan before adding indexes.",
  },
  {
    name: "Jamie Chen",
    initials: "JC",
    role: "Frontend developer",
    skills: ["React", "TypeScript", "CSS"],
    scores: [79, 80, 88],
    quote:
      "Created accessible React interfaces and reusable components in TypeScript.",
    answer:
      "I started with the user's main task, then tested keyboard navigation and small-screen layouts.",
  },
];

export function ProductPreview() {
  const [selected, setSelected] = useState(0);
  const [stage, setStage] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const candidate = candidates[selected];
  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.windowDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Recruitment workspace</span>
        <span className={styles.demo}>Interactive preview · sample data</span>
      </div>
      <div className={styles.workspace}>
        <aside className={styles.rail} aria-label="Preview workspace sections">
          <span className={styles.railLogo}>360</span>
          <LayoutDashboard />
          <BriefcaseBusiness />
          <Users className={styles.activeIcon} />
          <Video />
          <span className={styles.railAvatar}>JD</span>
        </aside>
        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <p>ENGINEERING / HIRING PIPELINE</p>
              <h2>A closer look at each candidate.</h2>
            </div>
            <span className={styles.role}>
              Software engineer <ArrowUpRight size={14} />
            </span>
          </div>
          <div className={styles.split}>
            <div className={styles.candidateList}>
              <div className={styles.listLabel}>
                Applications <span>3</span>
              </div>
              {candidates.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selected === index}
                  className={`${styles.candidate} ${selected === index ? styles.selected : ""}`}
                  onClick={() => setSelected(index)}
                >
                  <span className={styles.avatar}>{item.initials}</span>
                  <span className={styles.candidateText}>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
              <p className={styles.hint}>
                Select a candidate to explore their evaluation.
              </p>
            </div>
            <div className={styles.detail}>
              <div className={styles.person}>
                <div>
                  <h3>{candidate.name}</h3>
                  <p>{candidate.role}</p>
                </div>
                <span className={styles.status}>
                  <span /> Ready for review
                </span>
              </div>
              <div
                className={styles.tabs}
                role="tablist"
                aria-label="Evaluation stage"
              >
                {stages.map((label, index) => (
                  <button
                    key={label}
                    ref={(element) => {
                      tabs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`preview-tab-${index}`}
                    aria-controls="preview-panel"
                    aria-selected={stage === index}
                    tabIndex={stage === index ? 0 : -1}
                    className={stage === index ? styles.activeTab : ""}
                    onClick={() => setStage(index)}
                    onKeyDown={(event) => {
                      let next = index;
                      if (event.key === "ArrowRight") next = (index + 1) % 3;
                      else if (event.key === "ArrowLeft")
                        next = (index + 2) % 3;
                      else if (event.key === "Home") next = 0;
                      else if (event.key === "End") next = 2;
                      else return;
                      event.preventDefault();
                      setStage(next);
                      tabs.current[next]?.focus();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                id="preview-panel"
                role="tabpanel"
                aria-labelledby={`preview-tab-${stage}`}
                tabIndex={0}
                className={styles.panel}
              >
                <div
                  key={`${selected}-${stage}`}
                  className={styles.panelContent}
                >
                  <div className={styles.scoreHeading}>
                    <span>
                      {stage === 0 ? (
                        <FileText size={17} />
                      ) : stage === 1 ? (
                        <ListChecks size={17} />
                      ) : (
                        <MessageSquare size={17} />
                      )}
                      {stage === 0
                        ? "Resume match"
                        : stage === 1
                          ? "Skills assessment"
                          : "Interview evaluation"}
                    </span>
                    <strong>
                      {candidate.scores[stage]}
                      <small>/100</small>
                    </strong>
                  </div>
                  <div className={styles.track} aria-hidden="true">
                    <span style={{ width: `${candidate.scores[stage]}%` }} />
                  </div>
                  <div className={styles.evidence}>
                    <p>
                      {stage === 0
                        ? "RESUME EXCERPT"
                        : stage === 1
                          ? "ASSESSMENT SUMMARY"
                          : "ANSWER EXCERPT"}
                    </p>
                    <blockquote>
                      {stage === 0
                        ? `“${candidate.quote}”`
                        : stage === 1
                          ? `${candidate.scores[1] / 10} of 10 questions answered correctly. Questions cover the skills and experience relevant to the role.`
                          : `“${candidate.answer}”`}
                    </blockquote>
                  </div>
                  <div className={styles.skills}>
                    {candidate.skills.map((skill) => (
                      <span key={skill}>
                        <Check size={12} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.detailFooter}>
                <span>Evidence supports the score.</span>
                <strong>Your team makes the decision.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
