# AI Recruitment Intelligence Architecture

This document describes the foundational AI recruitment intelligence engine implemented for **AI-Recruit360**.

---

## 1. Overview & Conceptual Architecture

AI-Recruit360 uses a provider-agnostic, server-only AI pipeline designed for enterprise recruitment intelligence:

```
Recruiter / Job Form
        ↓
Server Action (analyzeJobDescriptionAction)
        ↓
Server-Only Job Analyzer (lib/ai/services/job-analyzer.ts)
        ↓
AI Provider Abstraction (AIProvider Interface)
    ├── GeminiProvider (Google Gemini API)
    ├── OpenAIProvider (OpenAI REST API)
    └── MockFallbackProvider (Deterministic Offline Fallback)
        ↓
Zod Schema Validation (JobAnalysisSchema)
        ↓
Activity Audit Logger (ai_activity_logs)
        ↓
Validated Job Intelligence Output
```

---

## 2. Key Architectural Components

### A. Provider Abstraction (`lib/ai/providers/`)
The `AIProvider` interface encapsulates model communication details:
- `generateStructuredObject<T>({ prompt, schema, systemPrompt })`: Requests structured JSON and enforces Zod schema validation.
- `generateText({ prompt, systemPrompt })`: Requests standard text completion.

`getAIProvider()` inspects `GEMINI_API_KEY` or `OPENAI_API_KEY` and returns the active LLM provider. If credentials are missing, it safely falls back to `MockFallbackProvider` to guarantee system uptime.

### B. Server-Only Security Boundary
To ensure secret API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are never leaked to the client bundle:
- Every AI module enforces `if (typeof window !== "undefined") throw new Error(...)`.
- Credentials are read only from standard `process.env` server secrets, never `NEXT_PUBLIC_` variables.

### C. Zod Schema Validation (`lib/ai/schemas/job-analysis-schema.ts`)
LLM outputs are untrusted raw strings until validated. `JobAnalysisSchema` enforces strict types:
- `job_title`: Normalized position title.
- `skills`: Categorized into `critical`, `important`, or `nice_to_have`.
- `experience`: `minimum_years` and `preferred_years`.
- `education`: `required` (boolean) and acceptable `degrees`.
- `responsibilities`: List of core role duties.
- `semantic_requirements`: Core qualitative hiring benchmarks.

### D. Prompt Architecture (`lib/ai/prompts/job-analysis.ts`)
Prompts are isolated from business logic:
- System prompt instructs model to refrain from inventing unmentioned skills or requirements.
- Standardizes technology naming conventions (e.g. `JS` -> `JavaScript`, `Postgres` -> `PostgreSQL`).

### E. AI Activity Logging Integration
All AI jobs operations log event records to `public.ai_activity_logs`:
- Logs `organization_id`, `event_type` (`job_analysis`), `entity_type` (`job`), `status` (`completed` / `failed`), and sanitized metadata (skill counts, provider name).
- Protects security by stripping full prompt text and credentials from database logs.

---

## 3. Future Pipeline Extensions

The foundation established in Step 20 prepares AI-Recruit360 for upcoming pipeline modules:
- **Step 21 & 23**: Candidate Document Ingestion & Resume Extraction (`lib/ingestion/`).
- **Step 26**: Vector Embeddings & Hybrid RAG (`lib/embeddings/`).
- **Step 27 & 28**: Candidate Match Scoring & Adaptive AI Interviews.
