/**
 * Temporary Development Mock Data: AI Operations Console Activity Log
 * --------------------------------------------------------------------
 * Isolated mock activity stream events representing AI system operations.
 */

export interface AiActivityEvent {
  id: string;
  category: "Resume Analysis" | "RAG Retrieval" | "Candidate Matching" | "Interview" | "Evaluation";
  title: string;
  candidateName: string;
  targetRole: string;
  description: string;
  timestamp: string;
  status: "Completed" | "In Progress" | "Triggered";
}

export const mockAiActivityEvents: AiActivityEvent[] = [
  {
    id: "act-001",
    category: "Resume Analysis",
    title: "AI Resume Processing",
    candidateName: "Sophia Chen",
    targetRole: "Senior AI/ML Engineer",
    description: "Resume parsed, evidence extracted, and 94% match generated.",
    timestamp: "2 minutes ago",
    status: "Completed",
  },
  {
    id: "act-002",
    category: "RAG Retrieval",
    title: "Evidence Retrieval",
    candidateName: "Sophia Chen",
    targetRole: "Senior AI/ML Engineer",
    description: "12 relevant evidence chunks retrieved via vector index.",
    timestamp: "3 minutes ago",
    status: "Completed",
  },
  {
    id: "act-003",
    category: "Candidate Matching",
    title: "Candidate Ranking Engine",
    candidateName: "All Candidates",
    targetRole: "Senior AI/ML Engineer",
    description: "Re-ranked 27 strong match candidates based on RAG benchmarks.",
    timestamp: "5 minutes ago",
    status: "Completed",
  },
  {
    id: "act-004",
    category: "Interview",
    title: "AI Adaptive Interview Question Gen",
    candidateName: "Sophia Chen",
    targetRole: "Senior AI/ML Engineer",
    description: "Generated Question 4 on enterprise RAG design and latency optimization.",
    timestamp: "8 minutes ago",
    status: "In Progress",
  },
  {
    id: "act-005",
    category: "Evaluation",
    title: "Scorecard Synthesis",
    candidateName: "Marcus Vance",
    targetRole: "Lead Full-Stack Architect",
    description: "Synthesized technical depth score (93%) and recommendation verdict.",
    timestamp: "12 minutes ago",
    status: "Completed",
  },
];
