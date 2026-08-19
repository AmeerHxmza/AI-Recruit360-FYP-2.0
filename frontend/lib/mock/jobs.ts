/**
 * Temporary Development Mock Data: Job Postings
 * ---------------------------------------------
 * Isolated job posting mock data for jobs list, detail, and screening configuration views.
 */

export interface JobMockItem {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Remote";
  status: "Active" | "Draft" | "Paused" | "Closed";
  applicantsCount: number;
  screeningCount: number;
  interviewsCount: number;
  shortlistedCount: number;
  createdAt: string;
  description: string;
  requirements: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  aiThreshold: number;
}

export const mockJobs: JobMockItem[] = [
  {
    id: "job-001",
    title: "Senior AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    employmentType: "Full-time",
    status: "Active",
    applicantsCount: 124,
    screeningCount: 48,
    interviewsCount: 21,
    shortlistedCount: 7,
    createdAt: "2026-08-10",
    description:
      "We are seeking an experienced Senior AI/ML Engineer to lead the design and deployment of scalable RAG architecture, vector search pipelines, and agentic workflows.",
    requirements: [
      "5+ years of experience with Python and ML frameworks (PyTorch/TensorFlow)",
      "Production experience building RAG pipelines and vector search indexing",
      "Proficiency with FastAPI, LangGraph, and PostgreSQL/pgvector",
      "Solid understanding of model evaluation metrics and bias mitigation",
    ],
    requiredSkills: ["Python", "FastAPI", "RAG", "LangGraph", "PyTorch"],
    preferredSkills: ["pgvector", "Docker", "Kubernetes", "Next.js"],
    aiThreshold: 85,
  },
  {
    id: "job-002",
    title: "Lead Full-Stack Architect",
    department: "Engineering",
    location: "Hybrid (San Francisco, CA)",
    employmentType: "Full-time",
    status: "Active",
    applicantsCount: 86,
    screeningCount: 32,
    interviewsCount: 14,
    shortlistedCount: 4,
    createdAt: "2026-08-12",
    description:
      "Architect and build high-performance web interfaces and microservice backends for our core recruitment intelligence platform.",
    requirements: [
      "7+ years in full-stack web software engineering",
      "Deep expertise in React, Next.js (App Router), TypeScript, and Tailwind CSS",
      "Backend architecture experience with Node.js/Python and PostgreSQL",
    ],
    requiredSkills: ["Next.js", "TypeScript", "React", "Python", "PostgreSQL"],
    preferredSkills: ["Tailwind CSS", "AWS", "Supabase"],
    aiThreshold: 80,
  },
  {
    id: "job-003",
    title: "Backend Systems Engineer",
    department: "Infrastructure",
    location: "Remote",
    employmentType: "Full-time",
    status: "Active",
    applicantsCount: 62,
    screeningCount: 20,
    interviewsCount: 9,
    shortlistedCount: 3,
    createdAt: "2026-08-15",
    description:
      "Design high-throughput APIs, asynchronous queue processing, and reliable data pipelines for AI analysis operations.",
    requirements: [
      "4+ years building high-throughput REST APIs and microservices in Python",
      "Experience with database schema design and ORM migrations",
    ],
    requiredSkills: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis"],
    preferredSkills: ["Alembic", "Celery", "Kafka"],
    aiThreshold: 80,
  },
  {
    id: "job-004",
    title: "Data Infrastructure Lead",
    department: "Data & AI",
    location: "New York, NY",
    employmentType: "Full-time",
    status: "Draft",
    applicantsCount: 0,
    screeningCount: 0,
    interviewsCount: 0,
    shortlistedCount: 0,
    createdAt: "2026-08-18",
    description:
      "Lead data engineering pipelines for vector embedding generation and resume knowledge graph indexing.",
    requirements: [
      "6+ years in data engineering and ETL pipeline architecture",
    ],
    requiredSkills: ["Python", "Spark", "PostgreSQL", "Vector DBs"],
    preferredSkills: ["Airflow", "Snowflake"],
    aiThreshold: 85,
  },
];
