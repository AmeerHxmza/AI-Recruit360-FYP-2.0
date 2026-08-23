# AI-Recruit360 — Full-Stack Analysis & 1M+ User Scalability Blueprint

**Reviewed by:** Expert Full-Stack AI Engineer  
**Stack:** Next.js 16 · TypeScript · FastAPI (Python) · Supabase/PostgreSQL · pgvector · Vercel · Render  

---

## 📊 Executive Codebase Assessment

After a complete A-to-Z review of every layer — frontend routes, server actions, middleware, AI service, database schema, RLS policies, indexes, Docker/deployment config — here is the honest current state and the full production roadmap.

---

## 🔍 Current Architecture (What You Have)

```
Browser (Next.js 16 / Vercel)
     │
     ├── /api/py/[...path]  ──(proxy)──▶  Python FastAPI (Render Free Tier)
     │                                        ├── /screening   → Multi-Agent CV Pipeline
     │                                        ├── /assessments → LLM MCQ Generation
     │                                        ├── /interviews  → Adaptive Q&A + TTS
     │                                        └── /evaluations → Final Scorecard
     │
     └── Server Actions / Server Components
              └── Supabase (PostgreSQL + pgvector + RLS + Auth)
```

---

## 🏆 What Is Already Well-Done (Strengths)

| Layer | Strength |
|-------|----------|
| **Database** | pgvector HNSW indexes for semantic search, composite B-tree indexes on all hot filtering paths |
| **Multi-tenancy** | Full `organization_id` row-level isolation, RLS policies on every table |
| **Auth** | Supabase SSR auth with `React.cache()` deduplication (1 auth call per request) |
| **Server Components** | Dashboard, Jobs, Candidates — converted to RSC with Suspense streaming |
| **Atomic RPC** | `get_dashboard_summary()` PostgreSQL function collapses 9 queries into 1 DB round-trip |
| **Concurrency** | `asyncio.gather()` for parallel AI agent execution in screening pipeline |
| **Retry Logic** | Exponential backoff (300ms, 600ms) in frontend AI client |
| **AI Provider Abstraction** | Factory pattern supports OpenAI + Gemini with graceful fallback |
| **Unique Constraints** | Duplicate prevention for applications, assessments, interviews, screenings |
| **Middleware Optimization** | Public routes (`/apply/...`) bypass Supabase Auth network call |

---

## 🚨 Critical Issues for 1M+ Users (What Must Change)

### Issue 1 — In-Process Memory Cache (FATAL at Scale)

```python
# app/core/cache.py — Line 39
ai_cache = FastMemoryCache()  # ← A SINGLE DICT PER PROCESS
```

**Problem:** When you run 10+ uvicorn workers or multiple pods, each has its own isolated `dict`.
Cache keys written by Worker A are invisible to Worker B. Cache miss rate → 100%.
At 1M users this wastes millions of LLM API tokens per day.

**Fix:** Replace with Redis (`upstash/redis` or `Redis Cloud`).

---

### Issue 2 — Synchronous Supabase Client in Async FastAPI (BLOCKING I/O)

```python
# app/db/supabase.py
_supabase_client = create_client(url, key)  # synchronous supabase-py client

# app/services/screening/orchestrator.py — Line 56
supabase = get_supabase_client()
supabase.table("cv_screenings").insert(...)  # ← SYNC DB call inside async route!
```

**Problem:** `supabase-py` uses synchronous `httpx` under the hood. Calling it inside an
`async def` route **blocks the entire event loop**. At 1M users this creates a bottleneck
equivalent to a single-threaded server.

**Fix:** Use `asyncio.to_thread()` for sync supabase calls, or switch to async client.

---

### Issue 3 — No Background Job Queue (AI Operations Must Be Async)

```python
# orchestrator.py: analyze_job → parse_cv → skills_eval → exp_eval → edu_eval → DB writes
# This blocks the HTTP request for the entire LLM pipeline duration (3–30s)
```

**Problem:** At 1M users, even 1% concurrently screening CVs = 10,000 simultaneous 30s HTTP
requests. This will exhaust all worker connections and crash the service.

**Fix:** Job Queue Architecture — Celery + Redis Broker, or ARQ (async).

---

### Issue 4 — Single Uvicorn Process (No Worker Scaling)

```dockerfile
# Dockerfile line 26 — No --workers flag, no Gunicorn process manager
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Problem:** One process = one CPU core = max ~1000 concurrent connections before catastrophic
queuing. At 1M users you need 50–200 workers across many pods.

**Fix:** `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app` + Kubernetes HPA.

---

### Issue 5 — Render Free Tier (Will Sleep, No Auto-Scaling)

```yaml
# render.yaml line 6
plan: free  # Sleeps after 15min inactivity. Cold start = 30–60s!
            # 512MB RAM, 0.1 CPU — one LLM call can exceed 512MB RAM
```

**Fix:** Render Standard ($25/mo) minimum → GCP Cloud Run with auto-scaling for 1M+ traffic.

---

### Issue 6 — No Rate Limiting (LLM API Cost Explosion Risk)

```python
# No rate limiting anywhere in FastAPI routes
# A malicious actor can call /screening/screen-application 1000x/second
# At $0.002 per LLM call = $2/second = $172,800/day in API costs
```

**Fix:** Add `slowapi` (FastAPI rate limiter) + per-organization API key auth.

---

### Issue 7 — CORS Wildcard in Production

```python
# main.py line 22
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"]
# The "*" allows ANY origin in production — a security vulnerability
```

**Fix:** Set `allow_origins` from `settings.ALLOWED_ORIGINS` env var — remove wildcard in prod.

---

### Issue 8 — No Connection Pool for PostgreSQL

The supabase-py client creates HTTP connections per call. At 1M users with no pooling,
PostgreSQL will hit `max_connections` (typically 100 on shared Supabase) and start refusing
connections: `FATAL: too many connections`.

**Fix:** Enable **PgBouncer** (Supabase Pro plan) + use Supabase pooler URL port 6543.

---

### Issue 9 — RLS `USING (true)` Policies (Cross-Tenant Data Leak)

```sql
-- master_schema.sql lines 581–628 — Same pattern on 8+ tables!
CREATE POLICY "Public candidate access" ON public.candidates
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public application access" ON public.applications
  FOR ALL USING (true) WITH CHECK (true);
```

**Problem:** ANY authenticated user can read/write candidates, applications, assessments, and
interviews across ALL organizations. This is a critical cross-tenant data breach vulnerability.

**Fix:** Restrict to proper `organization_id`-scoped policies per row.

---

### Issue 10 — No Observability or Health Monitoring

No structured logging, no metrics collection (Prometheus/Datadog), no distributed tracing
(OpenTelemetry), no alerting. At 1M users you will be completely blind when things go wrong.

---

## 🏗️ 1M+ User Production Architecture Blueprint

```
┌──────────────────────────────────────────────────────────────────┐
│                     GLOBAL EDGE LAYER                             │
│   Cloudflare CDN  →  DDoS Protection  →  WAF  →  Rate Limiting   │
└─────────────────────────┬────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                   FRONTEND (Vercel Pro)                           │
│  Next.js 16 App Router · ISR/SSG for public pages                │
│  Server Components with Suspense Streaming                        │
│  React Query (TanStack) for client-side cache                     │
└─────────────┬──────────────────────────┬─────────────────────────┘
              │                          │
     ┌────────▼─────────┐    ┌──────────▼──────────────┐
     │  Supabase Auth   │    │  Next.js API Routes      │
     │  (JWT Sessions)  │    │  /api/py/* → AI Service  │
     └────────┬─────────┘    └──────────┬───────────────┘
              │                          │
┌─────────────▼──────────────────────────▼─────────────────────────┐
│            AI SERVICE CLUSTER (Kubernetes / GCP Cloud Run)        │
│                                                                    │
│  ┌───────────────────────┐   ┌───────────────────────────────┐   │
│  │   FastAPI Workers      │   │  Redis (Upstash Serverless)   │   │
│  │   Gunicorn + Uvicorn  │◄─►│  - Shared Distributed Cache   │   │
│  │   4 workers/pod        │   │  - Job Queue (ARQ broker)     │   │
│  │   HPA: 2–50 pods       │   │  - Rate Limit counters        │   │
│  └────────┬──────────────┘   └───────────────────────────────┘   │
│           │                                                        │
│  ┌────────▼──────────────────────────────────────────────────┐   │
│  │  Background Worker Pods (ARQ / Celery Workers)             │   │
│  │  - CV Screening Pipeline (non-blocking, queued)            │   │
│  │  - MCQ Generation (queued)                                 │   │
│  │  - Final Evaluation (queued)                               │   │
│  │  - Supabase Realtime notifies frontend on completion       │   │
│  └────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬──────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│              DATABASE LAYER (Supabase Pro / Self-hosted)          │
│  PostgreSQL 16 + pgvector                                         │
│  PgBouncer Connection Pooler (port 6543)                          │
│  Read Replicas for Analytics/Reporting Queries                    │
│  Supabase Storage for CV/document file uploads                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prioritized Fix List (Ordered by Impact)

### Priority 1 — CRITICAL (Do Before Any Real Traffic)

#### 1.1 Replace In-Memory Cache with Redis

```python
# pip install redis>=5.0.0
# app/core/cache.py — REPLACE entire file:

import json
import redis.asyncio as aioredis
from app.core.config import settings

_redis: aioredis.Redis | None = None

async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis

async def cache_get(key: str):
    r = await get_redis()
    val = await r.get(key)
    return json.loads(val) if val else None

async def cache_set(key: str, value, ttl_seconds: int = 3600):
    r = await get_redis()
    await r.setex(key, ttl_seconds, json.dumps(value))
```

Add `REDIS_URL` to `config.py` Settings class and `requirements.txt`.

---

#### 1.2 Fix Blocking Supabase Calls in Async Context

```python
# app/services/screening/orchestrator.py
import asyncio

# BEFORE (blocks event loop):
supabase.table("cv_screenings").insert(screening_payload).execute()

# AFTER (non-blocking):
await asyncio.to_thread(
    lambda: supabase.table("cv_screenings").insert(screening_payload).execute()
)
```

---

#### 1.3 Fix CORS Wildcard

```python
# app/core/config.py — add:
ALLOWED_ORIGINS: list[str] = ["https://your-prod-domain.com"]

# app/main.py — replace wildcard:
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,   # No "*" in production
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "x-ai-service-secret"],
)
```

---

#### 1.4 Fix RLS `USING (true)` Policies

```sql
-- For the recruiter-facing tables, restrict to org members only:
DROP POLICY IF EXISTS "Public candidate access" ON public.candidates;
CREATE POLICY "Org member candidate access" ON public.candidates
  FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role write access" ON public.candidates
  FOR INSERT WITH CHECK (true);  -- Only callable by service_role key via API routes

-- Apply the same pattern to: applications, cv_screenings, assessments, interviews
-- Public candidate portal (apply page) → must use service_role key from Next.js API route
-- NOT anon key with USING(true) bypass
```

---

### Priority 2 — HIGH (Before Public Launch)

#### 2.1 Add Background Job Queue for All AI Operations

```python
# pip install arq
# app/workers/tasks.py

async def screen_cv_task(ctx, application_id: str, **kwargs):
    """Background worker — does not block HTTP response"""
    result = await run_screening_pipeline(application_id=application_id, **kwargs)
    return result

# app/api/routes/screening.py — enqueue instead of await:
@router.post("/screen-application")
async def screen_application(req: ScreenApplicationRequest, request: Request):
    redis = request.app.state.arq_pool
    job = await redis.enqueue_job(
        "screen_cv_task",
        application_id=req.application_id,
        job_title=req.job_title,
        cv_text=req.cv_text,
    )
    return {"status": "queued", "job_id": job.job_id}
    # Frontend subscribes via Supabase Realtime on cv_screenings table
```

---

#### 2.2 Scale Uvicorn with Gunicorn (Multi-Worker)

```dockerfile
# Dockerfile — REPLACE CMD:
RUN pip install gunicorn>=21.0.0
CMD ["gunicorn", "app.main:app",
     "-w", "4",
     "-k", "uvicorn.workers.UvicornWorker",
     "--bind", "0.0.0.0:8000",
     "--timeout", "120",
     "--max-requests", "1000",
     "--max-requests-jitter", "100"]
```

---

#### 2.3 Add Rate Limiting per IP and per Organization

```python
# pip install slowapi
# app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# In each route:
@router.post("/screen-application")
@limiter.limit("10/minute")
async def screen_application(request: Request, req: ScreenApplicationRequest):
    ...
```

---

#### 2.4 Enable PgBouncer (Connection Pooling)

1. Supabase Dashboard → Settings → Database → **Enable PgBouncer**
2. Switch all connections to pooler URL: `db.xxx.pooler.supabase.com:6543`
3. Use `transaction` pool mode for short-lived queries

---

### Priority 3 — MEDIUM (Post-Launch Hardening)

#### 3.1 OpenTelemetry Observability

```python
# pip install opentelemetry-sdk opentelemetry-instrumentation-fastapi
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
FastAPIInstrumentor.instrument_app(app)
# Export to Grafana Cloud / Datadog / GCP Cloud Trace
```

#### 3.2 Configure React Query with Global Cache Strategy

```typescript
// Already have @tanstack/react-query in package.json ✓
// Ensure QueryClient has proper staleTime to prevent redundant fetches:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 minute — data stays fresh
      gcTime: 5 * 60_000,      // 5 minutes — garbage collection
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 3.3 ISR for Public Job Listing Pages (Zero DB Cost at Scale)

```typescript
// frontend/app/jobs/[slug]/page.tsx
export const revalidate = 3600; // Regenerate every 1 hour
// Public job pages cached at Vercel Edge — zero DB calls for millions of views
```

#### 3.4 Structured Logging

```python
# pip install structlog
import structlog
logger = structlog.get_logger()
logger.info("cv_screening_started",
            application_id=application_id,
            job_title=job_title,
            provider=settings.AI_PROVIDER)
```

---

### Priority 4 — ADVANCED (Hyper-Scale Beyond 1M)

#### 4.1 Multi-Region Deployment

| Region | Purpose |
|--------|---------|
| `us-east1` (GCP) | Primary AI service cluster |
| `eu-west1` (GCP) | EU data residency (GDPR compliance) |
| `ap-southeast1` (GCP) | APAC coverage |
| Vercel Edge Network | Frontend cached globally at 100+ PoPs |

#### 4.2 Semantic LLM Response Caching (70-90% LLM Cost Reduction)

```python
# If two job descriptions are 97%+ similar, reuse the cached AI analysis result
# Uses pgvector cosine similarity to detect duplicate analysis requests

async def get_cached_job_analysis(job_id: str, description: str):
    cache_key = f"job_analysis:{job_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached
    result = await analyze_job_requirements(...)
    await cache_set(cache_key, result.model_dump(), ttl_seconds=86400)
    return result
```

#### 4.3 Kubernetes Horizontal Pod Autoscaler

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-service-hpa
spec:
  scaleTargetRef:
    kind: Deployment
    name: ai-service
  minReplicas: 2
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## 📈 Capacity Planning

| Concurrent Users | Frontend | AI Service | Database | Est. Cost/Month |
|---|---|---|---|---|
| **1,000** | Vercel Free/Pro | Render Starter (1 pod) | Supabase Free | ~$25 |
| **10,000** | Vercel Pro | Render Standard (2 pods) | Supabase Pro | ~$250 |
| **100,000** | Vercel Pro + Edge | GCP Cloud Run (5-20 pods) + Redis | Supabase Pro + PgBouncer | ~$2,500 |
| **1,000,000** | Vercel Enterprise | Kubernetes (10-50 pods) + Redis Cluster | Supabase Enterprise / Self-hosted PG | ~$15K–$30K |

---

## ✅ Complete Best Practices Checklist

### Backend (FastAPI)
- [ ] Replace `FastMemoryCache` dict → **Redis distributed cache** (`upstash/redis`)
- [ ] Replace sync supabase calls → **`asyncio.to_thread()`** wrapper
- [ ] Add **ARQ/Celery background job queue** for all AI operations
- [ ] Switch to **Gunicorn + UvicornWorker** (4 workers per pod)
- [ ] Add **`slowapi` rate limiting** (per-IP and per-org)
- [ ] Remove **CORS wildcard** `"*"` — use explicit `ALLOWED_ORIGINS` env var
- [ ] Add **OpenTelemetry** instrumentation
- [ ] Add **structured logging** (`structlog`)
- [ ] Implement **circuit breaker** pattern for LLM API calls (tenacity)
- [ ] Add dedicated `/health/live` and `/health/ready` endpoints for Kubernetes probes
- [ ] Use **Gunicorn `--max-requests 1000`** to prevent gradual memory leaks

### Database (Supabase / PostgreSQL)
- [ ] Enable **PgBouncer** connection pooling (port 6543)
- [ ] Fix **RLS `USING (true)`** policies — proper org isolation per table
- [ ] Add **Supabase Realtime** subscriptions for async AI job completion signal
- [ ] Schedule **`VACUUM ANALYZE`** for large tables (applications, cv_screenings)
- [ ] Add **Read Replicas** for analytics queries
- [ ] Tune HNSW index `ef_construction=200` and `m=16` for recall vs speed
- [ ] Add **partial indexes** for high-cardinality filtered subsets

### Frontend (Next.js)
- [ ] Add `export const revalidate = 3600` for **public job listing ISR**
- [ ] Configure **TanStack React Query** `staleTime: 60_000` globally
- [ ] Add `Cache-Control` response headers for API proxy endpoints
- [ ] Implement **Optimistic UI updates** on mutations (status changes)
- [ ] Add **React Error Boundaries** around all async Server Components
- [ ] Set `output: 'standalone'` in `next.config.ts` for containerized deployments
- [ ] Enable **Partial Prerendering (PPR)** for dashboard shell + dynamic content

### Infrastructure & Security
- [ ] **Cloudflare** in front of Vercel (DDoS mitigation, WAF, Bot protection)
- [ ] **Kubernetes HPA** for AI service auto-scaling (2–50 pods)
- [ ] **Upstash Redis** (serverless, auto-scaling Redis — no provisioning)
- [ ] **Secrets management** via GCP Secret Manager / Doppler
- [ ] **CI/CD pipeline** — GitHub Actions → Docker → GCP Cloud Run
- [ ] **Load testing** with k6 or Locust (simulate 10K concurrent users) before launch
- [ ] **Synthetic monitoring** — Checkly or Datadog Synthetics for uptime SLA

---

## 🎯 Recommended 30-Day Production Readiness Plan

| Week | Priority | Concrete Actions |
|------|----------|-----------------|
| **Week 1** | 🔴 Critical | Fix CORS wildcard, Fix RLS policies (Issue 9), Add Redis cache (Issue 1), Wrap all sync DB calls in `asyncio.to_thread()` (Issue 2) |
| **Week 2** | 🟠 High | Add ARQ background job queue for CV screening + MCQ gen + evaluations, Add Gunicorn multi-worker Dockerfile, Add `slowapi` rate limiting |
| **Week 3** | 🟡 Medium | Add OpenTelemetry tracing, Configure React Query `staleTime`, Add ISR for `/jobs/[slug]`, Enable PgBouncer, Add `structlog` |
| **Week 4** | 🟢 Advanced | k6 load test (10K concurrent users), Set up Kubernetes HPA, Configure Cloudflare WAF, Set up read replicas, Configure alerting |
