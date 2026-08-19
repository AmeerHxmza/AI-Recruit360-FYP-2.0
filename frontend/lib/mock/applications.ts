/**
 * Temporary Development Mock Data: Applications Pipeline
 * ------------------------------------------------------
 * Isolated application lifecycle mock dataset.
 */

export interface ApplicationMockItem {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  avatarFallback: string;
  jobId: string;
  jobTitle: string;
  stage: "Applied" | "Screening" | "Interview" | "Evaluation" | "Shortlisted" | "Rejected";
  matchScore: number;
  appliedDate: string;
  lastActivity: string;
}

export const mockApplications: ApplicationMockItem[] = [
  {
    id: "app-001",
    candidateId: "cand-001",
    candidateName: "Sophia Chen",
    candidateEmail: "sophia.chen@example.com",
    avatarFallback: "SC",
    jobId: "job-001",
    jobTitle: "Senior AI/ML Engineer",
    stage: "Shortlisted",
    matchScore: 94,
    appliedDate: "2026-08-14",
    lastActivity: "12 mins ago",
  },
  {
    id: "app-002",
    candidateId: "cand-002",
    candidateName: "Marcus Vance",
    candidateEmail: "marcus.vance@example.com",
    avatarFallback: "MV",
    jobId: "job-002",
    jobTitle: "Lead Full-Stack Architect",
    stage: "Interview",
    matchScore: 92,
    appliedDate: "2026-08-12",
    lastActivity: "45 mins ago",
  },
  {
    id: "app-003",
    candidateId: "cand-003",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@example.com",
    avatarFallback: "ER",
    jobId: "job-003",
    jobTitle: "Backend Systems Engineer",
    stage: "Screening",
    matchScore: 88,
    appliedDate: "2026-08-15",
    lastActivity: "2 hours ago",
  },
  {
    id: "app-004",
    candidateId: "cand-004",
    candidateName: "David Kim",
    candidateEmail: "david.kim@example.com",
    avatarFallback: "DK",
    jobId: "job-001",
    jobTitle: "Senior AI/ML Engineer",
    stage: "Evaluation",
    matchScore: 84,
    appliedDate: "2026-08-11",
    lastActivity: "4 hours ago",
  },
  {
    id: "app-005",
    candidateId: "cand-005",
    candidateName: "Amara Nwosu",
    candidateEmail: "amara.nwosu@example.com",
    avatarFallback: "AN",
    jobId: "job-001",
    jobTitle: "Senior AI/ML Engineer",
    stage: "Interview",
    matchScore: 96,
    appliedDate: "2026-08-10",
    lastActivity: "1 day ago",
  },
];
