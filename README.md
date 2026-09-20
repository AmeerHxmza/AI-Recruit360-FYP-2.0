# AI-Recruit360

A BS Software Engineering final-year project for AI-assisted recruitment. Recruiters publish jobs, review applications, and make hiring decisions. Candidates submit a resume, complete an eligible skills assessment, and answer structured interview questions.

## Implemented workflow

1. **Application:** an active job link accepts contact details and a PDF/DOCX resume (up to 4 MB). Private storage and an atomic database function preserve retry-safe submissions.
2. **CV screening:** the backend extracts text when needed and requests one structured AI evaluation against the job criteria. It stores scores, resume excerpts, and reasoning. The configured pass threshold is 70% by default. AI excerpts are not a guarantee of factual accuracy.
3. **Assessment:** ten role/profile-related MCQs. PostgreSQL enforces question ownership, order, deadlines, answer immutability, and finalization. Candidates must meet the configured pass threshold to advance.
4. **Interview:** five structured questions. Candidates type answers or record up to three minutes within a 4 MB limit, review the transcript, then submit. Simli provides optional avatar playback with a configured face; OpenAI speech uses the configured voice (default `nova`).
5. **Evaluation:** a deterministic weighted score combines CV (40%), assessment (25%), and interview (35%) results. Recruiters review the evidence and control the final hiring decision.

The active implementation uses structured AI calls. It does not use a vector database, LangGraph, a task queue, or a zero-hallucination verification engine. The optional Gemini adapter is selected through configuration; it is not an automatic fallback. The Activity log UI and its writers have been removed; historical database tables remain to preserve data.

## Architecture and folders

| Location | Responsibility |
| --- | --- |
| `frontend/` | Next.js 16, React, TypeScript, Tailwind 4; pages, server actions, authenticated Supabase access |
| `ai-service/` | FastAPI, Pydantic, OpenAI integration, document extraction and AI workflow |
| `supabase/migrations/` | PostgreSQL schema, RLS, atomic workflow functions, indexes |
| `scripts/` | Local regression, database and browser checks |
| `HANDOVER.md` | Change history, current state and continuation instructions |
| `FINAL_AUDIT.md` | Final audit evidence, limitations and acceptance checklist |

Recruiter browser → Next.js server actions → Supabase (authenticated RLS).
Candidate browser → Next.js candidate-session checks → private database operations / FastAPI.
FastAPI → Supabase and configured AI provider. Simli playback connects from the browser using a short-lived server-issued token.

Candidate sessions use signed, HttpOnly, 24-hour cookies. Backend routes require a server-only shared bearer secret. Database service credentials and AI keys must never use the `NEXT_PUBLIC_` prefix.

## Local setup

Use Node.js supported by Next.js 16 and Python 3.12. Keep npm dependencies inside `frontend` and the Python environment inside `ai-service`.

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
```

Fill in the local environment file without committing credentials. If it already exists, edit it instead of overwriting it.

```powershell
cd ..\ai-service
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Configure `ai-service/.env` using its example. Start each service in a separate terminal:

```powershell
# From frontend
npm run dev
```

```powershell
# From ai-service
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Next.js uses Webpack for compatibility with this Windows environment. The Simli 3.0.2 package case-sensitivity workaround is intentional for Linux deployments. Run one backend worker; concurrency locks and rate limits are process-local.

For realistic frontend timing, use a production build instead of the development compiler:

```powershell
cd frontend
npm run build
npm run start -- --port 3100
```

## Database

Follow [supabase/README.md](supabase/README.md). Apply only pending migrations. Never rerun the initial schema or reset an existing database to fix an error. Migration09 adds indexes; the September20 audit tested it locally but did not change the hosted database.

## Verification

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check.ps1 -Build
```

This runs lint, TypeScript, backend unit/regression tests, auth regressions, two isolated PostgreSQL migration/workflow suites, and the production build. Database tests use synthetic records in memory, not the hosted database or paid AI providers.

With the production frontend running at `http://localhost:3100`:

```powershell
node scripts/check-ui.mjs
node scripts/check-dashboard.cjs
node scripts/check-interview-layout.cjs
node scripts/check-auth-browser.cjs
```

These browser tests use Microsoft Edge. Layout screenshots under `.artifacts` are QA fixtures, not final thesis evidence. Auth browser checks use intercepted synthetic data.

## Hosting and limitations

Frontend: https://ai-recruit360.vercel.app/
Backend: https://ai-recruit360-fyp.onrender.com/

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for environment settings, upload limits, timeouts, and cold-start considerations. Local edits do not change these deployments until redeployed.

AI output needs human review. Scanned/image-only resumes need OCR, which is not implemented. The system has no automatic data-retention policy. A free backend may sleep; AI generation and network round trips have variable latency. Automated tests do not establish production load capacity or model accuracy.

## Thesis preparation

Preserve `Project Report template-3.0.docx`, `GlucoSense_AI_Thesis_Final.pdf`, and the existing `Final_FYP_Thesis.docx`. The final thesis will use the university template, original project-specific prose, verified sources, actual implementation details, and measured test results. Reference-project material is a structural example, not text to copy. Final screen captures, diagrams, and `Thesis.docx` follow the user's acceptance of the updated project.
