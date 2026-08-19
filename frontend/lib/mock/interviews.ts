/**
 * Temporary Development Mock Data: AI Adaptive Interviews
 * --------------------------------------------------------
 * Isolated interview session mock dataset.
 */

export interface InterviewTranscriptItem {
  id: string;
  speaker: "AI System" | "Candidate";
  text: string;
  timestamp: string;
}

export interface InterviewEvaluationScores {
  communication: number;
  technicalDepth: number;
  problemSolving: number;
  reasoning: number;
}

export interface InterviewMockItem {
  id: string;
  candidateId: string;
  candidateName: string;
  avatarFallback: string;
  role: string;
  interviewType: "AI Adaptive Technical" | "System Architecture" | "Culture & Alignment";
  date: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Needs Evaluation";
  currentQuestion: number;
  totalQuestions: number;
  activeQuestionText: string;
  transcript: InterviewTranscriptItem[];
  evaluationScores: InterviewEvaluationScores;
}

export const mockInterviews: InterviewMockItem[] = [
  {
    id: "int-001",
    candidateId: "cand-001",
    candidateName: "Sophia Chen",
    avatarFallback: "SC",
    role: "Senior AI/ML Engineer",
    interviewType: "AI Adaptive Technical",
    date: "Today",
    time: "10:00 AM",
    status: "In Progress",
    currentQuestion: 4,
    totalQuestions: 10,
    activeQuestionText:
      "Explain how you would design a production RAG system for an enterprise application, specifically addressing chunking strategies, vector database indexing, and latency optimization.",
    transcript: [
      {
        id: "tr-1",
        speaker: "AI System",
        text: "Welcome Sophia. Let's begin by discussing your approach to vector indexing and retrieval accuracy in production.",
        timestamp: "10:01 AM",
      },
      {
        id: "tr-2",
        speaker: "Candidate",
        text: "Thank you. In my previous work at NeuralScale, we implemented hierarchical semantic chunking with pgvector HNSW indexing, reducing p99 latency to under 45ms.",
        timestamp: "10:03 AM",
      },
      {
        id: "tr-3",
        speaker: "AI System",
        text: "Excellent context. How did you validate semantic retrieval quality and handle out-of-domain edge cases?",
        timestamp: "10:05 AM",
      },
    ],
    evaluationScores: {
      communication: 92,
      technicalDepth: 96,
      problemSolving: 94,
      reasoning: 91,
    },
  },
  {
    id: "int-002",
    candidateId: "cand-002",
    candidateName: "Marcus Vance",
    avatarFallback: "MV",
    role: "Lead Full-Stack Architect",
    interviewType: "System Architecture",
    date: "Today",
    time: "02:00 PM",
    status: "Scheduled",
    currentQuestion: 1,
    totalQuestions: 8,
    activeQuestionText: "How do you manage complex application state and server rendering boundaries in Next.js 16 App Router?",
    transcript: [],
    evaluationScores: {
      communication: 88,
      technicalDepth: 90,
      problemSolving: 89,
      reasoning: 87,
    },
  },
  {
    id: "int-003",
    candidateId: "cand-005",
    candidateName: "Amara Nwosu",
    avatarFallback: "AN",
    role: "NLP & LLM Specialist",
    interviewType: "AI Adaptive Technical",
    date: "Yesterday",
    time: "04:30 PM",
    status: "Needs Evaluation",
    currentQuestion: 10,
    totalQuestions: 10,
    activeQuestionText: "Describe your experience fine-tuning open-weights models vs prompt engineering with proprietary APIs.",
    transcript: [
      {
        id: "tr-1",
        speaker: "AI System",
        text: "Tell us about your model fine-tuning benchmark experiments.",
        timestamp: "04:31 PM",
      },
      {
        id: "tr-2",
        speaker: "Candidate",
        text: "We fine-tuned Llama 3 70B using LoRA on domain-specific recruitment data, achieving 89% accuracy vs GPT-4 baseline.",
        timestamp: "04:35 PM",
      },
    ],
    evaluationScores: {
      communication: 95,
      technicalDepth: 98,
      problemSolving: 96,
      reasoning: 94,
    },
  },
];
