/**
 * Temporary Development Mock Data: Candidate Evaluations
 * ------------------------------------------------------
 * Isolated evaluation summary and scorecard dataset.
 */

export interface EvaluationMockItem {
  id: string;
  candidateId: string;
  candidateName: string;
  avatarFallback: string;
  role: string;
  overallScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  roleAlignmentScore: number;
  recommendation: "STRONGLY RECOMMENDED" | "RECOMMENDED" | "POTENTIAL" | "NOT RECOMMENDED";
  status: "Completed" | "Pending Review" | "In Review";
  evaluatedDate: string;
  strengths: string[];
  concerns: string[];
  recommendedNextStep: string;
}

export const mockEvaluations: EvaluationMockItem[] = [
  {
    id: "eval-001",
    candidateId: "cand-001",
    candidateName: "Sophia Chen",
    avatarFallback: "SC",
    role: "Senior AI/ML Engineer",
    overallScore: 94,
    technicalScore: 96,
    problemSolvingScore: 94,
    communicationScore: 92,
    roleAlignmentScore: 97,
    recommendation: "STRONGLY RECOMMENDED",
    status: "Completed",
    evaluatedDate: "2026-08-18",
    strengths: [
      "Deep theoretical and production mastery of RAG and vector databases",
      "Proven track record building FastAPI & LangGraph multi-agent systems",
      "Clear, articulate technical communication",
    ],
    concerns: [
      "High current market demand; require competitive compensation package",
    ],
    recommendedNextStep: "Proceed to Final Executive & Offer Stage",
  },
  {
    id: "eval-002",
    candidateId: "cand-002",
    candidateName: "Marcus Vance",
    avatarFallback: "MV",
    role: "Lead Full-Stack Architect",
    overallScore: 91,
    technicalScore: 93,
    problemSolvingScore: 90,
    communicationScore: 89,
    roleAlignmentScore: 92,
    recommendation: "RECOMMENDED",
    status: "Completed",
    evaluatedDate: "2026-08-17",
    strengths: [
      "Extensive Next.js App Router and design system leadership",
      "Solid architectural instincts across frontend and cloud microservices",
    ],
    concerns: [
      "Slightly less Python backend focus compared to pure backend specialists",
    ],
    recommendedNextStep: "Schedule Technical System Architecture Deep-Dive",
  },
  {
    id: "eval-003",
    candidateId: "cand-005",
    candidateName: "Amara Nwosu",
    avatarFallback: "AN",
    role: "NLP & LLM Specialist",
    overallScore: 96,
    technicalScore: 98,
    problemSolvingScore: 96,
    communicationScore: 95,
    roleAlignmentScore: 95,
    recommendation: "STRONGLY RECOMMENDED",
    status: "Completed",
    evaluatedDate: "2026-08-19",
    strengths: [
      "Exceptional LLM fine-tuning and benchmark optimization expertise",
      "Published research in NLP retrieval models",
    ],
    concerns: [],
    recommendedNextStep: "Accelerate to Final Hiring Manager Review",
  },
];
