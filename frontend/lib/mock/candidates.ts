/**
 * Temporary Development Mock Data: Candidates
 * --------------------------------------------
 * Isolated candidate UI placeholder data for candidate directory and detail views.
 */

export interface MatchBreakdown {
  overall: number;
  skills: number;
  experience: number;
  role: number;
  education: number;
}

export interface CandidateEvidenceItem {
  id: string;
  claim: string;
  verified: boolean;
  sourceContext: string;
}

export interface CandidateTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface CandidateMockItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatarFallback: string;
  role: string;
  targetJobId: string;
  matchScore: number;
  matchLabel: "Strong Match" | "Good Match" | "Potential" | "Low Match";
  confidenceLevel: "High" | "Medium" | "Low";
  experience: string;
  skills: string[];
  status: "Screening" | "Interview" | "Shortlisted" | "Review";
  lastActivity: string;
  education: string;
  currentCompany: string;
  matchBreakdown: MatchBreakdown;
  evidence: CandidateEvidenceItem[];
  aiRecommendation: {
    verdict: "STRONGLY RECOMMENDED" | "RECOMMENDED" | "POTENTIAL" | "NOT RECOMMENDED";
    summary: string;
    keyPoints: string[];
  };
  timeline: CandidateTimelineEvent[];
}

export const mockCandidates: CandidateMockItem[] = [
  {
    id: "cand-001",
    name: "Sophia Chen",
    email: "sophia.chen@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatarFallback: "SC",
    role: "Senior AI/ML Engineer",
    targetJobId: "job-001",
    matchScore: 94,
    matchLabel: "Strong Match",
    confidenceLevel: "High",
    experience: "6 yrs",
    skills: ["Python", "FastAPI", "LangGraph", "RAG", "PostgreSQL", "Next.js"],
    status: "Shortlisted",
    lastActivity: "12 mins ago",
    education: "M.S. Computer Science, Stanford University",
    currentCompany: "NeuralScale Labs",
    matchBreakdown: {
      overall: 94,
      skills: 96,
      experience: 91,
      role: 97,
      education: 88,
    },
    evidence: [
      { id: "ev-1", claim: "Production Python microservices & FastAPI architecture", verified: true, sourceContext: "Led backend redesign serving 1M daily requests" },
      { id: "ev-2", claim: "Retrieval-Augmented Generation (RAG) & pgvector indexing", verified: true, sourceContext: "Architected vector database search with 99.2% recall" },
      { id: "ev-3", claim: "Agentic workflow orchestration with LangGraph", verified: true, sourceContext: "Implemented multi-agent evaluation graphs" },
      { id: "ev-4", claim: "High-throughput PostgreSQL schema optimization", verified: true, sourceContext: "Optimized database queries reducing p99 latency" },
    ],
    aiRecommendation: {
      verdict: "STRONGLY RECOMMENDED",
      summary: "Candidate demonstrates exceptional alignment with the Senior AI/ML Engineer role, exhibiting verified production experience across RAG pipelines and LangGraph workflows.",
      keyPoints: [
        "6 years of verified production AI/ML engineering experience",
        "Built and deployed enterprise RAG architecture",
        "Strong backend foundations in Python & FastAPI",
        "Relevant academic background from top CS program",
      ],
    },
    timeline: [
      { id: "t-1", title: "Application Submitted", description: "Applied via LinkedIn Referral", timestamp: "2026-08-14 09:30 AM", completed: true },
      { id: "t-2", title: "Resume Analyzed", description: "Evidence parsed & embedded", timestamp: "2026-08-14 09:32 AM", completed: true },
      { id: "t-3", title: "AI Screening Completed", description: "Generated 94% match score", timestamp: "2026-08-14 09:35 AM", completed: true },
      { id: "t-4", title: "Recruiter Reviewed", description: "Approved by Ameer Hamza", timestamp: "2026-08-15 02:15 PM", completed: true },
      { id: "t-5", title: "Interview Scheduled", description: "AI Adaptive Interview booked for Today 10:00 AM", timestamp: "2026-08-18 04:00 PM", completed: true },
    ],
  },
  {
    id: "cand-002",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+1 (555) 876-5432",
    location: "Austin, TX",
    avatarFallback: "MV",
    role: "Lead Full-Stack Architect",
    targetJobId: "job-002",
    matchScore: 92,
    matchLabel: "Strong Match",
    confidenceLevel: "High",
    experience: "8 yrs",
    skills: ["Next.js", "TypeScript", "Python", "Tailwind CSS", "AWS"],
    status: "Interview",
    lastActivity: "45 mins ago",
    education: "B.S. Software Engineering, UT Austin",
    currentCompany: "Apex Tech Cloud",
    matchBreakdown: {
      overall: 92,
      skills: 94,
      experience: 95,
      role: 90,
      education: 86,
    },
    evidence: [
      { id: "ev-1", claim: "Next.js App Router & TypeScript frontend architecture", verified: true, sourceContext: "Architected enterprise design systems" },
      { id: "ev-2", claim: "Python REST API microservices", verified: true, sourceContext: "Maintained FastAPI infrastructure" },
    ],
    aiRecommendation: {
      verdict: "STRONGLY RECOMMENDED",
      summary: "Candidate displays strong leadership and deep mastery of Next.js, React, and Python full-stack architecture.",
      keyPoints: [
        "8 years of full-stack engineering expertise",
        "Built enterprise design systems with Tailwind & TypeScript",
      ],
    },
    timeline: [
      { id: "t-1", title: "Application Submitted", description: "Direct Website Application", timestamp: "2026-08-12 11:00 AM", completed: true },
      { id: "t-2", title: "AI Screening Completed", description: "Generated 92% match score", timestamp: "2026-08-12 11:05 AM", completed: true },
      { id: "t-3", title: "Interview Scheduled", description: "Technical Interview confirmed", timestamp: "2026-08-16 01:00 PM", completed: true },
    ],
  },
  {
    id: "cand-003",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+1 (555) 432-1098",
    location: "Seattle, WA",
    avatarFallback: "ER",
    role: "Backend Systems Engineer",
    targetJobId: "job-003",
    matchScore: 88,
    matchLabel: "Good Match",
    confidenceLevel: "High",
    experience: "5 yrs",
    skills: ["FastAPI", "Python", "PostgreSQL", "Docker", "Redis"],
    status: "Screening",
    lastActivity: "2 hours ago",
    education: "B.S. Computer Science, University of Washington",
    currentCompany: "DataStream Corp",
    matchBreakdown: {
      overall: 88,
      skills: 90,
      experience: 87,
      role: 89,
      education: 85,
    },
    evidence: [
      { id: "ev-1", claim: "FastAPI microservices & PostgreSQL schema optimization", verified: true, sourceContext: "Refactored core data access layer" },
    ],
    aiRecommendation: {
      verdict: "RECOMMENDED",
      summary: "Solid backend candidate with proven Python and database engineering capability.",
      keyPoints: ["5 years backend Python experience", "Strong relational database design skills"],
    },
    timeline: [
      { id: "t-1", title: "Application Submitted", description: "Applied via Referral", timestamp: "2026-08-15 03:00 PM", completed: true },
      { id: "t-2", title: "AI Screening Completed", description: "Generated 88% match score", timestamp: "2026-08-15 03:05 PM", completed: true },
    ],
  },
];

export const mockRecentCandidates = mockCandidates;
