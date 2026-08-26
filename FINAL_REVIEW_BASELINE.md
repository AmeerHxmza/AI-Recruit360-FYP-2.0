# AI-Recruit360 Final Review Baseline

## 1. Repository Structure
```
AI-Recruit360/
├── ai-service/                   # Python FastAPI Intelligence Engine
│   ├── app/
│   │   ├── api/routes/          # FastAPI HTTP Endpoints (health, screening, assessments, interviews, evaluations)
│   │   ├── core/                # Config, Redis, Rate Limiter, Cache, Logger, Exceptions
│   │   ├── db/                  # Supabase client wrapper & async helpers
│   │   ├── providers/           # LLM Providers (Gemini, OpenAI factory)
│   │   ├── repositories/        # Database data access repositories
│   │   ├── schemas/             # Pydantic models for screening, assessment, interview, evaluation
│   │   ├── services/            # Core business & AI orchestration (screening, assessment, interview, evaluation, cv)
│   │   ├── workers/             # ARQ background task definitions & worker settings
│   │   └── main.py              # FastAPI Application entrypoint & lifespan
│   ├── tests/                   # Pytest test suite (health, screening, assessment)
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
├── frontend/                    # Next.js 16 (App Router) + TypeScript + React 19 + Tailwind CSS
│   ├── app/                     # App Router pages and layouts
│   │   ├── actions/             # Next.js Server Actions (jobs, candidates, applications, assessment, interview, etc.)
│   │   ├── api/                 # Next.js API route handlers (tts proxy, perf)
│   │   ├── (auth)/              # login, signup, forgot-password, onboarding
│   │   ├── (recruiter)/         # dashboard, jobs, candidates, applications, interviews, evaluations, analytics, ai-activity, settings
│   │   ├── apply/[job-slug]/    # Candidate public job application portal & CV upload
│   │   ├── assessment/[id]/     # Candidate 10-MCQ assessment portal (30s timer)
│   │   └── interview-room/[id]/ # Candidate AI Voice + Simli WebRTC interview room
│   ├── components/              # UI components (shadcn/radix, layout, feature-specific)
│   ├── features/                # Domain hooks and feature sub-components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities, Supabase SSR/client, API client (ai-service-client.ts), Auth, Ingestion
│   ├── types/                   # TypeScript interfaces & database definitions (database.types.ts)
│   └── package.json
├── supabase/                    # Supabase SQL Migrations & Database DDL
│   └── migrations/              # 7 SQL migrations (Master schema, Indexes, RLS, Storage, RPCs)
└── docs/                        # Project architectural and review documentation
```

## 2. Major Services
- **Frontend Web Application**: Next.js 16.3.1 (React 19, TypeScript, Tailwind CSS, TanStack React Query).
- **FastAPI AI Intelligence Engine**: Python 3.11+ async REST service (FastAPI 0.110+, Pydantic v2, SlowAPI, Tenacity).
- **Database & Auth & Storage**: Supabase (PostgreSQL 15+ with pgvector, Row Level Security, Supabase Auth, Supabase Storage for CVs and audio).
- **Background Worker & Job Queue**: ARQ (Async Redis Queue) for async CV screening, MCQ generation, and evaluation pipelines.
- **Cache & Rate Limiting Shared Storage**: Redis (used for SlowAPI rate limits, ARQ queue, and optional query/result caching).
- **Voice & Avatar Integration**: 
  - STT: OpenAI Whisper (`/interviews/stt`).
  - TTS: Google Text-to-Speech (`gTTS` wrapped in non-blocking `asyncio.to_thread`) / ElevenLabs compatible.
  - Avatar: Simli WebRTC client (`simli-client` NPM package) rendering into `<video>`/`<audio>` DOM elements with server-enforced max 5 turns and automated session teardown.

## 3. Active Routes (Frontend)
- `/` - Public Landing Page
- `/login`, `/signup`, `/forgot-password` - Authentication Pages
- `/onboarding/organization` - Organization Onboarding Setup
- `/dashboard` - Recruiter Dashboard (KPIs, active candidates pipeline, analytics RPC)
- `/jobs`, `/jobs/new`, `/jobs/[id]` - Job Management (Create, Edit, Publish, Close)
- `/candidates`, `/candidates/[id]` - Candidate Pipeline & Profile Inspector
- `/applications` - Applications Table with stage filters & score sorting
- `/interviews` - Interview Sessions overview
- `/evaluations` - Candidate Hiring Scorecards & Evaluation Breakdown
- `/analytics` - Recruitment Funnel & Pipeline Analytics
- `/ai-activity` - Real-time AI Event Audit Logs
- `/settings` - Organization & Account Settings
- `/apply/[job-slug]` - Public Candidate Application & CV Upload
- `/assessment/[application-id]` - Candidate Timed MCQ Assessment Room (10 MCQs, 30s per question)
- `/interview-room/[application-id]` - Live AI Adaptive Interview Room (Simli Avatar + Voice STT/TTS)

## 4. Active APIs (FastAPI Backend: `/api/v1`)
- **Health**: `GET /api/v1/health` (Checks DB, Redis, AI Provider, Memory, Uptime)
- **CV Screening**: `POST /api/v1/screening/screen-application` (CV text vs Job requirements multi-agent evaluation)
- **MCQ Assessment**: 
  - `POST /api/v1/assessments/generate` (Generate or fetch exactly 10 personalized MCQs)
  - `POST /api/v1/assessments/submit-answer` (Server-side timer validation & answer recording)
  - `POST /api/v1/assessments/finalize` (Calculate final assessment score & update application stage)
- **AI Interview**:
  - `POST /api/v1/interviews/initialize` (Create or recover interview session)
  - `POST /api/v1/interviews/next-question` (Fetch or dynamically generate next question up to 5 turns)
  - `POST /api/v1/interviews/evaluate-response` (LLM answer evaluation)
  - `POST /api/v1/interviews/tts` (Generate non-blocking audio narration)
  - `POST /api/v1/interviews/stt` (Whisper transcription of WebM audio upload)
  - `POST /api/v1/interviews/simli-token` (Generate secure Simli session token)
  - `POST /api/v1/interviews/degrade-avatar` (Update interview to avatar_degraded on WebRTC failure)
- **Evaluations**: `POST /api/v1/evaluations/generate` (Consolidate CV + MCQ + Interview scores into Final Scorecard)

## 5. Database Tables Actually Used
1. `profiles` - User profile linked to `auth.users`
2. `organizations` - Multi-tenant isolation entity
3. `organization_members` - RBAC user-to-org mappings
4. `jobs` - Job postings with pgvector embedding
5. `candidates` - Candidate contact records
6. `applications` - Recruitment pipeline state machine
7. `candidate_documents` - CVs, storage paths, extracted text & embeddings
8. `cv_screenings` - AI match score, scores breakdown, evidence, knockout logic
9. `assessments` - Candidate MCQ assessment sessions
10. `assessment_questions` - Exactly 10 generated MCQs per assessment
11. `assessment_answers` - Candidate choices, correctness, and time spent
12. `interviews` - Interview sessions with turn counter and overall score
13. `interview_questions` - Question history & adaptive follow-up prompts
14. `interview_responses` - Audio transcripts and LLM response evaluations
15. `final_evaluations` - Weighted final scorecard & hiring recommendation
16. `ai_activity_logs` - Structured event logs of all AI decisions

## 6. Redis Usages
- SlowAPI Rate Limiter storage (multi-worker coordination)
- ARQ (Async Redis Queue) background worker job queue & job result TTL storage
- Application caching layer (`app/core/cache.py`)

## 7. AI Provider Usages
- **Google Gemini** (`gemini-1.5-flash` / `gemini-1.5-pro` via `app/providers/gemini.py`)
- **OpenAI** (`gpt-4o-mini` / `text-embedding-3-small` / `whisper-1` via `app/providers/openai.py`)
- **gTTS** (Google Text-to-Speech) for voice generation
- **Simli API** for lipsynced avatar WebRTC video/audio stream

## 8. Background Workers
- ARQ Worker (`python -m app.workers.worker`):
  - `task_screen_cv`
  - `task_generate_assessment`
  - `task_generate_evaluation`
  - `cleanup_abandoned_interviews` (cron every 5 minutes)

## 9. Build and Test Commands
- **Frontend Build**: `npm --prefix frontend run build`
- **Frontend Lint**: `npm --prefix frontend run lint`
- **Backend Tests**: `pytest` inside `ai-service/`
- **Backend Server**: `uvicorn app.main:app --port 8000` inside `ai-service/`
- **ARQ Worker**: `python -m app.workers.worker` inside `ai-service/`
