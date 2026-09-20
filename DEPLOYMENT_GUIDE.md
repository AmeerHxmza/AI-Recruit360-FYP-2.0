# Vercel and Render deployment

## Current endpoints

- Frontend: https://ai-recruit360.vercel.app/
- Backend: https://ai-recruit360-fyp.onrender.com/
- Readiness: `/api/v1/health` (includes a database request).
- Liveness: `/api/v1/health/live` (process only).

No deployment is performed by the local audit. `render.yaml` specifies Starter but does not prove the running instance uses that plan. Confirm the actual plan and region in the Render dashboard.

## Vercel frontend

Set the project root to `frontend`. Use its existing install/build scripts and lockfile. Required environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://ai-recruit360.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private server credential |
| `AI_SERVICE_URL` | `https://ai-recruit360-fyp.onrender.com/api/v1` |
| `AI_SERVICE_SHARED_SECRET` | Same strong secret as backend |
| `CANDIDATE_SESSION_SECRET` | Strong private signing key, at least 32 characters |
| `SIMLI_API_KEY`, `SIMLI_FACE_ID` | Private avatar configuration |

Configure the production origin and auth callback/reset URLs in Supabase Auth. Rebuild when public environment variables change.

The frontend caps resume and audio uploads at **4 MB**, leaving overhead below Vercel's documented **4.5 MB function payload limit**. Raising Next.js `bodySizeLimit` does not raise the hosting limit. Existing larger stored files remain intact. [Vercel function limits](https://vercel.com/docs/functions/limitations)

AI server actions can wait up to 90 seconds. Confirm the deployed function duration supports this budget. Render wake-up and provider processing both consume it; an expired frontend request does not necessarily cancel an already-running backend operation. Retry-safe persistence is essential. [Vercel duration configuration](https://vercel.com/docs/functions/configuring-functions/duration)

## Render backend

Root: `ai-service`. Build: `pip install -r requirements.txt`.
Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`.
Use Python3.12, `ENVIRONMENT=production`, and explicit frontend origins.

Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_SERVICE_SHARED_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o-mini`, and `OPENAI_TTS_VOICE=nova`. Keep the frontend/backend shared secret identical. The avatar face does not choose the speech voice automatically.

Use only one instance/worker for the current in-process concurrency locks and rate limiter. Horizontal scaling requires shared coordination; it is outside this FYP's current design.

## Latency expectations

Render documents that free web services sleep after15 idle minutes and typically take about a minute to wake. If the deployed service is free, code cleanup cannot eliminate that delay. An always-on service removes this particular cause; no plan is changed by this update. [Render free service limitations](https://render.com/docs/free#spinning-down-on-idle)

Choose nearby regions for Vercel compute, Render and Supabase where practical. Verify actual account settings before changing them. Use production builds for measurements and distinguish cold requests, warm requests, database reads, and AI generation. Do not report a single health request as end-to-end application performance.

## Safe release order

1. Review the local production build and automated test results.
2. Confirm the database's migration history. Apply only pending migrations with a backup; never reset existing data.
3. Deploy backend and frontend code through the user's selected deployment workflow.
4. Verify signup/login, workspace switching, job publishing, candidate upload, screening, timed assessment, typed/recorded interview, avatar playback, and recruiter decisions using designated test records.
5. Record cold/warm timings and check browser/server errors.
6. Obtain final acceptance, then capture thesis evidence from the accepted version.

No credentials belong in screenshots, source control or thesis material.
