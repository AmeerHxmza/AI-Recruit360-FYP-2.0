# AI-Recruit360 🚀
> **AI-Powered Recruitment Intelligence Platform**

AI-Recruit360 is an enterprise-grade AI-powered recruitment intelligence platform that analyzes jobs, candidates, resumes, evidence, adaptive AI interviews, and explainable recommendations.

---

## 🏛️ Project Architecture

```
AI-Recruit360/
├── frontend/                 # Next.js 16 (App Router) + TypeScript + Tailwind CSS
│   ├── app/                  # Next.js App Router pages & layout
│   ├── components/           # UI primitives & layout components
│   ├── features/             # Feature domain modules
│   ├── config/               # Design system tokens & constants
│   └── lib/                  # Utilities, API client, Supabase client
│
├── ai-service/               # Python FastAPI + ARQ Redis Worker
│   ├── app/                  # FastAPI router, AI providers, and services
│   │   ├── api/              # API endpoints (screening, assessments, interviews, evaluations)
│   │   ├── core/             # Configuration, Redis pool, Rate limiter, Logging
│   │   ├── providers/        # LLM providers (Gemini, OpenAI)
│   │   ├── services/         # Multi-agent pipelines & orchestrators
│   │   └── workers/          # ARQ background task workers (tasks.py, worker.py)
│   ├── requirements.txt      # Python dependencies
│   └── render.yaml           # Render deployment Blueprint
│
├── supabase/                 # Supabase PostgreSQL migrations & schemas
│   └── migrations/           # Master schema, RLS policies, performance indexes
│
└── render.yaml               # Root Blueprint for Render deployment
```

---

## 🛠️ Local Development Setup

### 1. Frontend (Next.js)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 2. Backend (FastAPI Web Service)

```bash
# Navigate to the ai-service directory
cd ai-service

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI development server
uvicorn app.main:app --reload --port 8000
```

### 3. Background Worker (ARQ + Upstash Redis)

```bash
# From the ai-service directory (with .venv active)
python -m arq app.workers.worker.WorkerSettings
```

---

## ☁️ Deployment Guide

### 1. Frontend → Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `NEXT_PUBLIC_AI_SERVICE_URL`: `https://your-backend.onrender.com/api/v1`
   - `AI_SERVICE_SECRET`: `your-internal-secret`
4. Click **Deploy**.

### 2. Backend & Worker → Render
1. Connect your repository to [Render](https://render.com) using the Blueprint (`render.yaml`).
2. It will provision:
   - **Web Service (`ai-recruit360-backend`)**: Runs FastAPI with Uvicorn (`uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`).
   - **Background Worker (`ai-recruit360-worker`)**: Runs ARQ worker (`python -m arq app.workers.worker.WorkerSettings`).
3. Set your environment secrets in Render:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `REDIS_URL` (Upstash Redis URI)
   - `GEMINI_API_KEY` / `OPENAI_API_KEY`
   - `ALLOWED_ORIGINS` (`https://your-app.vercel.app`)

---

## 🔒 Security & Performance
- **Zero Exposed Secrets**: Backend credentials and service-role keys stay isolated in server environments.
- **Rate-Limited Endpoints**: SlowAPI rate limiting backed by Upstash Redis.
- **Asynchronous AI Workers**: Heavy screening, assessments, and evaluations execute via ARQ workers with Supabase Realtime synchronization.
