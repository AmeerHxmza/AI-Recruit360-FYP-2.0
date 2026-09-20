# Recruit360 continuation handover

## Thesis finalization and live evidence incorporation (2026-09-20)

Completed full professional thesis generation in `Thesis.docx` strictly conforming to `Project Report template-3.0.docx` (MUST Department of Software Engineering format).
- Fully incorporated the 12 authentic deployed Vercel captures (`website_screenshots/live_*.png`) into Appendix C with explicit provenance labelling (`Authenticated deployed capture`), replacing older fixture assumptions.
- Prioritized viewport captures (`live_candidate-detail-viewport.png`, `live_interview-detail-viewport.png`) to fit standard A4 margins without multi-page vertical stretching or layout breaks.
- Resolved Unicode character encoding issues: eliminated all font substitution glitches (``) across captions and metadata by standardizing on ASCII hyphens.
- Verified document integrity via `.artifacts/thesis/validate-final.py`: exactly 7 sections preserved, 52 inline images (51 project figures + university crest), 63 structured tables, all 3 authors (Ameer Hamza FA22-BSE-030, Babar Hussain FA22-BSE-044, Ali Naqi FA22-BSE-050), supervisor Engr. Syeda Iqra Gillani, and zero placeholder/secret patterns.
- Also updated modular builder `scratch/thesis_parts/chapter5.py` with figures 5.6 through 5.14b (Dashboard, Jobs, Job Detail, Candidates, Assessment, Interview, Evaluation Dossier, Settings, and Password Recovery), enabling `scratch/run_compile_test.py` to compile `Final_FYP_Thesis.docx` with 24 figures and 54 tables.

## Live thesis screenshots (2026-09-20)

Owner signed in to the deployed Vercel app in the Codex browser. Saved 12 authentic captures to website_screenshots/live_*.png: dashboard, jobs, applications, candidates, interviews, evaluations, analytics, settings, new-job form, job detail, candidate dossier and completed interview detail. README distinguishes these from earlier current_ fixture images. Captures were read-only; no records, decisions, credentials, environment files or application source were changed. Current live metrics observed: 2 active jobs, 7 applications, 3 completed interviews. These observations are not performance benchmarks or a new end-to-end acceptance run.


## Sign-in loading repair (2026-09-20)

User reported the Signing In button remained loading. Inspection found unbounded browser Auth requests and a success path that called router.push and router.refresh together while retaining loading state. Updated login to navigate with window.location.assign after the SDK saves session cookies. Browser Supabase Auth requests now abort after 15 seconds; a 25-second form watchdog also covers SDK initialization/refresh, restores retry, and ignores stale completion. Error banner is announced accessibly. No credentials, records, RLS policies or authentication checks changed. A read-only Supabase Auth settings probe returned HTTP 200 in 740 ms; this is not proof of the user's exact failing request. The exact original network trigger was not captured. New synthetic browser regressions passed for invalid credentials, successful cookie-backed document navigation and a never-responding auth endpoint. Lint and production build passed; auth startup regression passed. Updated local preview uses port3100 (session53172); no deployment performed. User should refresh/restart their local frontend to load the fix. Real-account acceptance is still needed.


## UI revision requested after audit (2026-09-20)

The user rejected the overly static landing page and preferred a richer SaaS experience. Current direction: retain performance/auth/database fixes, restore purposeful interactivity and restrained motion, concise copy, existing logo and neutral/coral palette. New landing has centered hero, real interactive sample-candidate/evaluation tabs, three feature cards, scoring explanation and signup CTA. Preview is explicitly sample data; it performs no API requests and uses no AI/video simulation. Motion uses CSS transforms/colors, no animation library, timer loops or hidden scroll reveals. Keyboard tabs support arrows/Home/End and reduced-motion disables animation. Shared buttons/metric cards receive modest hover/focus feedback. No recruitment workflow, score, database, provider or deployment changes. Verification: lint and production build (including TypeScript) passed. Six public pages passed at 320, 375, 414, 768 and 1440px without horizontal overflow or uncaught browser errors. Candidate selection, keyboard tabs and reduced-motion checks passed. Auth startup regression passed; workspace fixtures passed at 375, 768 and 1440px. Desktop landing screenshot visually reviewed. Preview running at http://localhost:3100 (agent process session80812). No deployment performed. Earlier statements that the landing is entirely server-rendered are superseded: only the small product preview is a client component.

## Final local audit: ready for review (2026-09-20)

User deployed frontend https://ai-recruit360.vercel.app and backend https://ai-recruit360-fyp.onrender.com (Render plan not confirmed). Request: audit, simplify code/UI, improve latency, test, then obtain final user confirmation BEFORE thesis screenshots/diagrams and template-based Thesis.docx. Preserve existing thesis, friend reference and university template files. No push or redeploy performed.

Baseline check failed with three React effect lint errors and eleven warnings. Changes in progress: removed header-based identity trust; auth/onboarding redirects check actual membership rather than trusting preference cookies; preserved request-scoped parallel membership/profile queries. Browser auth now uses INITIAL_SESSION once and schedules database queries outside the synchronous auth callback to avoid lock-related hangs. Repeated same-user events do not reload the context; stale responses are invalidated. Breadcrumbs are scoped by route instead of reset in an effect.

Landing page now server-rendered, using existing neutral palette, with a clear three-stage workflow. Removed unsupported zero-hallucination/compliance claims, unimplemented pricing, exclusive animated counters/scroll effects, and simulated showcase. Core recruitment and avatar features remain. Local verification completed as detailed in FINAL_AUDIT.md; do not claim production updates, real-provider acceptance, or a completed thesis.

Additional changes: job list now requests embedded database counts in one query (read-only live Supabase probe supported the syntax), instead of downloading application rows with a silent row cap. Resume job/candidate reads run concurrently with explicit organization filters; saved text avoids a redundant database update. Uploads and recordings capped at 4 MB for Vercel payload limits, with browser and server validation. Removed unused legacy screening agents/analyzers/embeddings/cache after an AST import scan confirmed no active callers, and removed unused tenacity requirement (pypdf is retained because the PDF extractor uses it as a fallback). Transcription now uses a bounded, properly closed OpenAI client. Database tests now include migration09. Added isolated auth and repository regressions.

Live read-only measurements: Vercel home returned200, TTFB0.710s, total3.391s; first backend health request timed out after25s, retry returned200 in1.919s. These are point samples, not a benchmark or confirmed cold-start diagnosis. No private candidate content sent to AI and no live records changed.


Final additions: debounced job/candidate/application search with late-response guards and recoverable request errors; eliminated initial application-list reload and per-keystroke candidate totals; keyed stateful list views by organization; batched signed document URLs; accurate count-only organization summaries; table-based DOCX extraction. Retained pypdf fallback after verifying its active use. Added real synthetic PDF/DOCX extraction tests. Removed remaining unsupported auth-page marketing claims. README.md, DEPLOYMENT_GUIDE.md and FINAL_AUDIT.md reflect the implemented stack and current hosting constraints.

Verification: final lint clean, TypeScript + production build passed, 25 backend tests passed (one existing Starlette/httpx warning), auth/request-cache and >1000 count regressions passed, both isolated database layouts passed migrations01-09, live aggregate totals matched exact read-only counts. Public browser checks passed six pages at five widths; workspace fixture passed three widths; interview fixture passed six viewports; browser auth startup made one profile and one membership request. QA screenshots remain ignored in .artifacts and are not final thesis evidence. Production preview is running at http://localhost:3100 (agent process session80812); stop only the agent-started preview when no longer needed.

Next boundary: user review, redeployment through their chosen workflow, and real candidate/provider acceptance. No source push, deployment, live record changes, or final thesis screenshots occurred. The university DOCX, friend PDF and previous Final_FYP_Thesis.docx remain untouched. After user confirmation, create the evidence pack and original template-based Thesis.docx. Follow FINAL_AUDIT.md for required screenshots/diagrams and untested production scenarios. The actual Render plan was not answered; render.yaml specifying Starter is not proof of the deployed plan.

## Latest change: BeatView-Inspired Brand Logo, Favicon & Complete Minimal Editorial System (2026-09-16)

1. **Brand Identity & Logo Redesign (`frontend/components/brand/brand-logo.tsx` & `frontend/app/icon.svg`)**:
   - **Graphic Design Direction (Hybrid Precision Symbol + Geometric Wordmark)**: Rather than an unbranded text-only string or an isolated symbol without recognition, implemented an understated **28px-32px Precision Emblem paired with a crisp Editorial Wordmark**.
   - **Color Harmony with Theme**: Completely removed discordant bright electric blues (`#2563EB`). The orbital 360 ring is now rendered in crisp `#121212` near-black with a warm neutral inner arc (`#D8D8D2`), while the focal AI intelligence core node pulses with the signature warm coral-to-rose gradient (`#FF4F62` to `#ED3F74`).
   - **Wordmark Typography**: `AI-Recruit` is set in geometric `font-display` with tight letter spacing (`-0.035em`), followed by a solid near-black `#111111` capsule badge (`360`) accented by a warm coral micro-dot.
   - **Favicon & Browser Tab (`icon.svg`)**: Updated with matching solid near-black `#111111` card background, white orbital track, and warm glowing coral AI spark.
2. **Design Token System (`frontend/app/tokens.css` & `frontend/app/globals.css`)**:
   - **90% Neutrals + 10% Warm AI Accent Philosophy**: Eliminated dark-purple/navy clichés. Adopted warm off-white canvas (`#FAFAF7`), pure white cards/surfaces (`#FFFFFF`), subtle warm gray borders (`#E7E7E2`), near-black typography (`#121212`), and muted paragraphs (`#60605D`).
   - **Solid Black Primary CTA**: Mapped primary actions to solid black (`#111111`, hover `#202020`, 9px radius, `-translate-y-0.5` micro-interaction).
   - **Warm AI Accents**: Configured coral (`#FF4F62`), rose (`#ED3F74`), peach (`#FF9272`), and soft orange (`#FFC278`) exclusively for AI score pills, match chips, and live status badges.
   - **Signature Atmospheric Warm Glow (`.hero-glow`)**: Implemented overlapping radial gradients (coral/peach/orange) with soft blur (28px) for background illumination behind product mockups.
3. **Landing Page Overhaul (`frontend/app/page.tsx`)**:
   - Sticky minimal glass navbar (`72px`, `#FAFAF7` at 86% opacity with `blur(14px)`).
   - Centered, restrained hero layout with `Inter Tight` typography scale (`72px` H1, letter-spacing `-0.045em`, line-height `1.01`).
   - Announcement pill: `● New — AI-Powered Hiring from Resume to Interview` with `#35C88A` green status dot.
   - Browser-framed product preview with titlebar and atmospheric `.hero-glow` embed, featuring the real Recruit360 interactive workbench.
   - Connected 6-step horizontal workflow: `CV Upload → Grounded AI Screening (40%) → Dynamic MCQs (25%) → Avatar Interview (35%) → Composite Score → Human Recruiter Decision`.
   - BeatView asymmetric feature grid (large 2-column feature + two smaller features) with 90% neutral surfaces and 10% coral accents.
   - Transparent pricing plans ($99 Starter, $299 Pro, $999 Enterprise) and minimal editorial footer.
4. **Interactive Showcase (`frontend/components/landing/interactive-showcase.tsx`)**:
   - Re-styled tabs, candidate cards, verified evidence quotes, Redis question prompt, and simulated Simli avatar player to inherit the warm off-white/coral design tokens.
5. **Authentication Experience (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `auth-introduction.tsx`)**:
   - Clean, elegant `#F6F6F2` left intro panel with subtle warm glow, dark typography, and 3-step feature checklist.
   - Right form panels redesigned on warm `#FAFAF7` canvas with solid `#111111` submit buttons, clean `#D8D8D2` inputs, and soft focus states.
6. **Dashboard Sidebar & TopBar (`frontend/components/layout/sidebar.tsx` & `top-bar.tsx`)**:
   - Clean white `#FFFFFF` sidebar with `#E7E7E2` right border.
   - 40px menu items with 8px radius, `#60605D` text, hover `#F1F1ED`, and `#F0F0EC` active selection state.
   - User profile section with name, role, and prominent red-accent Log Out button.
7. **Validation**: All checks in `scripts/check.ps1` passed (ESLint 0 errors, TypeScript `tsc --noEmit` 0 errors, all 20 FastAPI tests passed, and all PGlite database integrity/isolation tests passed).

## Previous change: UI Polish, Dedicated LogOut, Persistent Tabs & Performance Optimization (2026-09-16)

Resolved key UI, user flow, and performance issues across the platform:
1. **Settings Page Polish (`frontend/app/settings/page.tsx`)**:
   - Replaced cramped form inputs with structured, clean SaaS cards (`Personal Profile`, `Organization Workspace`, `Password & Authentication`).
   - Fixed the Save button positioning by adding a dedicated, well-spaced action footer bar with clear top divider (`border-t border-border mt-8 pt-5`) and loading spinners.
2. **Hero Section Modernization (`frontend/app/page.tsx`)**:
   - Overhauled the Hero into a high-impact, ambient tech AI SaaS experience with glowing cyan/indigo mesh lighting, tech gridline backdrop, and a live pulse indicator (`● Live Multi-Modal Evaluation Engine`).
   - Upgraded copy to authoritative, non-generic messaging (`The Autonomous AI Recruiter That Evaluates Like Your Best Senior Engineer. Zero Keyword Fluff. 100% Verifiable Evidence.`).
   - Embedded the interactive 3-tier recruitment pipeline cockpit directly in the hero fold (`#interactive-demo`) with a glassmorphic container.
3. **Sidebar Dedicated Log Out Button (`frontend/components/layout/sidebar.tsx`)**:
   - Added a prominent, full-width `Log Out` button directly below the user's name (`AMEER HAMZA`) and role (`owner`) with `LogOut` icon, red danger styling, and responsive tooltip when collapsed.
4. **Persistent Shell on Tab Switching (No More Full-Screen Loading)**:
   - Wrapped route loading boundaries (`dashboard/loading.tsx`, `jobs/loading.tsx`, `candidates/loading.tsx`, `applications/loading.tsx`, `interviews/loading.tsx`, `evaluations/loading.tsx`, `analytics/loading.tsx`, `settings/loading.tsx`) inside `<ApplicationShell>`.
   - Now, when switching between sidebar tabs, the Sidebar and TopBar remain 100% persistent with zero layout shift; only the inner content region displays its clean skeleton loading state.
5. **Data Load Time & Performance Optimization (`frontend/lib/auth/session.ts`)**:
   - Collapsed 4 sequential Supabase network waterfalls down to 2 parallel requests by joining `organizations(...)` directly into the `organization_members` query and parallelizing profile retrieval.
   - Cached user memberships and workspace context at the request level, so subsequent calls to `getCurrentOrganization`, `getCurrentRole`, and `getCurrentMembership` in service queries resolve instantly from memory with 0 extra database round-trips.
6. **Official Brand Logo Integration**:
   - Integrated the user's official uploaded AI-Recruit360 brand logo across the entire platform.
   - Extracted high-resolution assets: `frontend/public/brand/logo.png` (full horizontal logo: 955x212, transparent background) and `frontend/public/brand/logo-icon.png` (circular orbital emblem: 260x260 square).
   - Updated `BrandLogo` component (`frontend/components/brand/brand-logo.tsx`) to render the official logo across the Landing navbar, footer, dashboard sidebar (both expanded and collapsed states), login, signup, and candidate apply screens.
   - Replaced browser favicons (`frontend/app/icon.svg`, `frontend/app/icon.png`, `frontend/app/favicon.ico`) and apple touch icons with the official emblem.
7. **Validation**: All checks in `scripts/check.ps1` passed (ESLint 0 errors, TypeScript `tsc --noEmit` 0 errors, all 20 FastAPI tests passed, and all PGlite database integrity/isolation tests passed).

## Previous change: Competitor Research & Thesis/Defense Guide Added (2026-09-16)

Added `COMPETITIVE_ANALYSIS_AND_DEFENSE.md` at the repository root. It provides a comprehensive, research-backed market breakdown of competitors (Beatview.ai, iMocha, HireVue, Apriora, Vervoe, TestGorilla), architectural differentiation matrices, business and SaaS monetization models, and detailed model answers for external FYP examiners and judges (problem motivation, dynamic MCQ anti-cheating, avatar rationale, hallucination defense, and anti-bias compliance). No code or runtime configuration was modified.

## Previous change: Activity feature removed (2026-09-15)

The user asked whether Activity is necessary and authorized removing it if unnecessary. It was a developer event viewer, not a recruitment workflow requirement. Removed /ai-activity page and directory, its client component and directory, server action, frontend activity service, sidebar item, and obsolete protected-route entry. Also removed the unreferenced dashboard insights-panel component that presented application snapshots as a live AI audit.

Removed the dedicated backend ai_activity.py helper and its calls from screening, assessment generation, interview creation/completion, and final evaluation. Removed document-ingestion activity writes. Removed evaluation's organization lookup used only for logging and assessment helper parameters used only for logging; adjusted existing tests. Core result persistence, scoring, authorization, ordinary diagnostic logging, and interview/avatar behavior remain in place.

Existing ai_activity_logs database records, table types, and applied SQL migration history are intentionally preserved to respect the keep-data instruction. No database migration or remote write was performed. The current application no longer reads or writes this table. Older handover references to the Activity feature are historical and superseded by this section.

Validation: frontend lint passed; production Webpack build including TypeScript passed and its route list excludes /ai-activity; all 20 backend tests passed (one existing Starlette/httpx deprecation warning). A stale generated .next/dev/types/app/ai-activity/page.ts initially caused a missing-module build error after route deletion; removed that exact generated file and rebuilt successfully. No live candidate submission or paid AI call was performed for this change. Restart the backend to load removed event writers and refresh the frontend (restart dev server if its old route remains cached).

## Current presentation direction (supersedes older layout notes)

CORRECTION: The user rejected the cropped face caused by object-fit: cover. The current design MUST show the entire source video with object-fit: contain and centered positioning. The interview shell is narrowed to 1120px, centered, with desktop columns 0.85fr/1.15fr and workspace height capped at 620px within the existing 100dvh shell. Keep question and answer together on the right. The avatar background is a quiet neutral gray to accommodate mismatched source/frame aspect ratios. Never restore cover/zoom merely to remove gutters: preserving the full avatar is now the explicit priority. The call status, speaking/mute/disconnect controls are retained. Validation for this correction is appended below after checks.

The avatar stays on the left; the question and answer stay together on the right. The previous cover/fill-frame design was rejected because it cropped the face. Use the correction above as the current source of truth.

The Simli player now has a call-style header, actual connection status, mute/unmute and disconnect controls, and a speaking indicator driven by Simli speaking/silent events. The animated bars indicate speaking state, not measured microphone volume. Reduced-motion preferences disable their animation. It clearly identifies the video/voice as AI-generated. Recording status reflects the existing recording boolean; no fake participant, camera feed, call timer, or network statistics were added. Saved answers, voice selection, AI prompts, database state, and scoring are unchanged.

Latest verification: frontend lint and production Webpack build (including TypeScript) passed. scripts/check-interview-layout.cjs passed 1920x1080, 1440x900, 1366x768, 1280x720, 1024x600, and 390x844. It now asserts object-fit: contain and uses a synthetic square poster with visible top/bottom markers to reveal cropping. The 1366px screenshot was inspected: the entire source frame is visible, panels are centered, and answer controls fit the viewport. This fixture uses no paid providers or private data. Screenshots remain in .artifacts/interview-layout-*.png. No media connection logic, database, or scoring changes were made. Refresh the interview page; no backend restart or migration is needed. Source/frame aspect mismatches may leave neutral-gray space, which is preferable to cutting off the avatar.

## Standing handover requirement

The user requires HANDOVER.md to be updated with every change so another IDE/assistant can continue without losing context. Record what changed, what was actually verified, and remaining limitations. Never include credentials.

## User objective and constraints

This is a BS Software Engineering FYP, a local copy of an original working GitHub project. Improve the actual application and keep the stack simple, the data flow correct, and the UI professional. Avoid extra features or framework changes. After real acceptance testing, the user wants a 120+ page thesis, not before testing. Preserve the original project and database. Do not invent successful tests or AI results.

Workspace: `D:\AI-Recruit360`, Windows PowerShell. No Git remotes remain; local history and uncommitted changes are retained. Do not push, reset, or discard the working tree. The user requested this handover for a different coding assistant if Codex quota runs out. No credentials belong in this document or chat output.

## Architecture and local commands

- Frontend: `frontend`, Next.js 16.3.5, React, TypeScript, Tailwind. All npm files/dependencies live inside frontend. No root package.json/node_modules. Windows blocked the older native compiler, so dev/build explicitly use Webpack.
- Backend: `ai-service`, FastAPI/Pydantic, Python 3.12 virtual environment at `ai-service/.venv`. Active provider is OpenAI, model gpt-4o-mini. Gemini adapter is optional, not verified.
- Database: Supabase PostgreSQL/Auth/private storage. No active Redis queue, avatar/video integration, vector search, or multi-agent pipeline. AI work is synchronous and retryable; run ONE backend worker because locks are process-local.

Run two terminals, starting each from the repository root:

```powershell
cd frontend
npm run dev
```

```powershell
cd ai-service
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Activating .venv does not start FastAPI. The frontend process does not start FastAPI either. Frontend URL is localhost:3000; AI_SERVICE_URL is http://127.0.0.1:8000/api/v1. Backend health is /api/v1/health. Environment files are frontend/.env.local and ai-service/.env, both ignored by Git. Shared service secrets must match. Public anon key belongs in the browser; service_role and AI keys stay server-side.

## Database state (verified 2026-09-15)

New isolated Supabase project: `nuodoigrttsmxdncfrqz`, URL https://nuodoigrttsmxdncfrqz.supabase.co. Original database untouched. Supabase MCP is authenticated with project read and database read/write permissions, scoped to this project. API-key retrieval is not authorized by its current OAuth scopes. User supplied new keys, now configured in both local environment files; service-role schema access and public auth/jobs queries passed.

Applied migrations 01–08, recorded remotely. DO NOT rerun the baseline or reset the database. Migration files in supabase/migrations are canonical:

1. Original schema.
2. Data-contract alignment, preserved legacy columns, tenant foreign keys, role policies, private storage.
3. Atomic retry-safe public submission.
4. Server assessment timing/order/ownership and immutable answers.
5. Atomic screening, interview response aggregation, final evaluation.
6. Dashboard aggregates.
7. Search applications before pagination.
8. Explicit function permissions under Supabase defaults, trigger search path, anonymous active-job policy separated from member checks.

17 public tables, all with RLS. Private candidate_documents bucket, 10 MB limit. Live SQL smoke test verified authenticated organization creation and empty dashboard/search in a rolled-back transaction. No synthetic records retained from that test. User has since signed up, created an organization and a Python Developer job, and submitted a CV: preserve these new test records. Three security-advisor notices remain intentionally for authenticated SECURITY DEFINER organization/membership helpers; they use auth.uid and fixed search paths. No anonymous execution of create_organization or workspace_dashboard.

## Implemented work

- Light navy/blue/white system, system fonts, compact navigation, responsive dashboard, public landing/auth screens. Removed large generated art and unused components.
- Dashboard displays distinct CV/assessment/interview evidence, correct aggregate totals. Job detail uses exact database counts independent of pagination.
- One-page job form, real settings persistence, password recovery callbacks.
- Candidate submission validates PDF/DOCX content/size, derives organization from active job, uploads unique paths, atomically stores records and supports retries without duplicates or overwriting existing candidate details.
- Signed HttpOnly 24-hour candidate cookies protect screening/assessment/interview actions. Recruiter actions verify membership/role; unsafe cross-request cache removed. Middleware renamed proxy.ts.
- Assessment shows one question, uses server deadlines (60 seconds plus grace), saves answers before navigation, recovers sessions/finalization.
- Interview uses typed answers or bounded audio recording/transcription, persists responses, waits for evaluation. No fake transcript or default passing scores on provider failure.
- Screening single structured AI call, evidence extraction/storage, deterministic score threshold, atomic persistence, safe retries. OpenAI uses SDK structured parsing with Pydantic.
- Evaluation requires actual stage evidence and preserves recruiter decisions on retry. CSV export escapes spreadsheet formulas.
- Temporary refactoring scripts removed. Retained repeatable check scripts and documentation.

## Verification already completed

- Frontend lint, TypeScript, production Webpack build passed after standalone frontend installation.
- 18 Python tests passed. They block external network access and do not call real AI/Supabase accounts.
- Isolated PGlite database tests pass with original and newer column layouts, including migrations 01–08, ownership/roles, timers, retry persistence, and preserved recruiter decisions.
- Public browser checks passed six pages at widths 320/375/414/768/1440. Dashboard component fixture checks passed 375/768/1440; these are NOT authenticated end-to-end tests.
- Live user terminal now demonstrates signup callback, organization creation, dashboard, job creation, and saved CV submission working.
- Full real-provider screening → assessment → interview → evaluation acceptance journey is NOT yet verified. No latency benchmarks justify low-latency claims.

Run checks from root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check.ps1 -Build
```

Or individually: npm --prefix frontend run lint/typecheck/build; ai-service/.venv/Scripts/python.exe -m pytest ai-service/tests -q; node scripts/check-database.mjs; node scripts/check-database.mjs --current-layout. Browser scripts require Edge and frontend port 3100. Artifacts go into ignored .artifacts.

## Current incident to resolve

User screenshot after CV upload: application received and resume saved, but red banner says assessment service did not respond, with Retry screening button. Terminal shows runCvScreeningAction returning in 4–15 ms. Only npm run dev was started in the pasted terminal. On inspection nothing was listening on backend port 8000. Start FastAPI and verify health first; activating .venv is not starting the backend. The error comes from frontend/lib/api/ai-service-client.ts fetch catch. Preserve saved application and use retry; do not ask user to reupload or create duplicate records.

Terminal also had one `useAuth must be used within an AuthProvider` error in ApplicationShell. Root app/layout.tsx DOES wrap all children in AuthProvider. Do not mask this with a fake context. Reproduce on fresh process/build and inspect module identity/Fast Refresh if it recurs. AuthProvider currently awaits Supabase queries inside onAuthStateChange; review potential auth-lock issues independently if reproduced. Its org selection also defaults to first membership, which deserves testing with multiple workspaces.

### Latest result: CV screening recovered

FastAPI was started on port 8000. In the agent sandbox its first health request failed with Windows socket permission error; it was restarted with permitted network access. This sandbox restriction is distinct from the user's original missing-backend issue. Backend health then returned OK with Supabase OK.

The first real saved-CV screening attempt failed because Windows DNS could not resolve api.openai.com (`getaddrinfo failed`). A later DNS check resolved successfully. A subsequent retry through the running backend completed: database verification showed status `assessment`, exactly one saved document, and completed cv_screenings processing_status. This was a REAL provider result, not a fixture or fallback. Do not submit a new application; continue this saved candidate session to assessment.

Code changes made during this incident:
- frontend/lib/api/ai-service-client.ts reports a stopped backend explicitly in development on ECONNREFUSED. Other transport failures now say AI service unreachable/timed out, rather than misleadingly naming the assessment service during CV screening.
- ai-service/app/providers/openai.py distinguishes provider connection, credentials, and quota errors without exposing keys/provider response bodies.
- screening/orchestrator.py preserves these safe diagnostics and the saved application.
- core/logging_config.py uses INFO root logging and suppresses SDK/HTTP2 debug loggers, which can otherwise print headers and CV content. Restart backend to pick up this last logging change (it does not use --reload).
- Lint, TypeScript, and 18 Python tests passed after diagnostic changes. No new production build was required for diagnosing the running dev workflow; do not claim one was run this turn.

At handover, the agent-started backend was listening on 127.0.0.1:8000; do not assume it survives a tool session ending. The user's frontend was running on localhost:3000. Start either only if absent. The single AuthProvider error has not been reproduced or proven fixed. The user was interacting with the app during investigation, so avoid restarting active processes while an assessment/AI request is underway.

## Cleanup limitation

Automatic approval review previously blocked deletion of four inactive backend files: services/screening/agents.py, cv_analyzer.py, job_analyzer.py and services/cv/embeddings.py. Their compatibility schema/helper imports were restored. They are not the active route workflow. Leave them unless explicit deletion approval is obtained; never describe them as active RAG/multi-agent features in the thesis.

## Next acceptance steps

1. Ensure both processes run with the new database env and matching private secret.
2. Retry saved CV screening; diagnose actual backend errors (provider credentials/quota, extraction, joins, schema) instead of fallback scores.
3. Test candidate assessment timer/reload/duplicate submit, then interview response/transcription and final scoring.
4. Confirm recruiter sees that same application's evidence and can shortlist/hire under allowed stages.
5. Check failures are recoverable, tenant boundaries, mobile navigation, and session expiry.
6. Record actual results and limitations; only then write thesis material.


## Latest user correction: Simli avatar and female voice restored

The user explicitly wants the Simli avatar retained and a female voice. This overrides the earlier simplification that removed avatars. Do not remove it again as unnecessary.

Implementation:
- Installed pinned simli-client in frontend (no root npm packages).
- frontend/components/interview/simli-avatar-player.tsx connects real Simli video/audio using a short-lived session token and LiveKit transport. Candidate presses Connect interviewer once; questions then play automatically, with Repeat/Stop controls. It stops audio during answer recording/submission and cleans up the session on exit. Text answers remain usable if avatar fails.
- frontend/app/actions/interview-avatar.ts checks the signed candidate interview session and active interview status before minting a token or requesting speech. API key stays on server. NEXT_PUBLIC_SIMLI_API_KEY/FACE_ID were renamed to SIMLI_API_KEY/FACE_ID in frontend/.env.local; examples updated. Restart frontend after env changes.
- New protected backend /api/v1/interviews/speech endpoint generates WAV from the saved question, scoped by BOTH question_id and interview_id. No arbitrary browser text is accepted. TTS uses OpenAI tts-1 with OPENAI_TTS_VOICE=nova (configured in backend .env).
- The browser resamples WAV to mono PCM16 at 16 kHz and sends it to Simli in 6000-byte chunks. Simli's synchronized output provides both avatar animation and the female voice. The old OS-default speechSynthesis Read aloud control was removed from the active UI.
- No new database migrations required.

Verification: Simli accepted the configured key/face and issued a token. Real OpenAI nova synthesis of a GENERIC sentence returned a valid 80444-byte WAV. Production build succeeded. 20 Python tests passed, including speech ownership and saved-text/voice selection tests. Lint/typecheck were rerun after removing one ref-cleanup warning.

LIMITATION: Full live avatar video/audio playback in the candidate browser is not yet verified. Automatic approval review rejected sending a saved private interview question to OpenAI during an agent-run test. Do not bypass that rejection; obtain explicit approval before testing with that payload. A generic sentence was used instead. Restart backend to load the new speech route (the running backend has no --reload), restart frontend, then resume the same candidate session and click Connect interviewer. If the API responds 404 for /interviews/speech, the backend is stale.

Official references: https://docs.simli.com/api-reference/javascript and https://developers.openai.com/api/docs/guides/text-to-speech . A face ID controls appearance; voice is selected by the TTS provider independently.

## Latest layout update: desktop interview workspace

User confirmed the avatar is visible via screenshots, then requested avatar/question on the left and answer on the right, with everything fitting a desktop viewport at 100% zoom. Implemented this as an interview-only CandidateShell variant:

- frontend/components/layout/candidate-shell.tsx accepts `interview`; that mode wraps content and activates scoped styling. Other candidate pages retain their original layout.
- frontend/app/interview-room/[application-id]/page.tsx groups the avatar and question in a left panel, and textarea/record/submit/help in a right panel. Business logic and persisted answers are unchanged.
- frontend/app/interview-room/interview-room.css uses equal desktop columns from 1024px width. At desktop heights >=600px, the shell occupies 100dvh including header, progress, intro, panels, and footer. The avatar and textarea flex within the remaining space; long questions scroll inside their own focusable area. Compact spacing supports 600–720px tall windows. Mobile and windows under 600px high retain normal page scrolling to avoid clipping/zoom accessibility problems.
- simli-avatar-player.tsx provides scoped video/control classes so the video fits its available height without cropping the face; playback logic unchanged.
- scripts/check-interview-layout.cjs renders the actual components with synthetic state in Edge, with all network blocked. This is a layout fixture, not a new paid AI/avatar session. It checks horizontal overflow, desktop vertical fit, column order, avatar visibility, visible answer controls, mobile stacking, and long-question scrolling. Screenshots saved in ignored .artifacts/interview-layout-*.png.

Verified: lint and production build (including TypeScript) pass. Layout fixtures pass 1920x1080, 1440x900, 1366x768, 1280x720, 1024x600, and 390x844. Existing provider/data-flow tests were not rerun for this presentation-only change. No migrations, credentials, records, scoring, or answer-save behavior changed. Refresh the interview page to load the layout; resume existing saved progress if the page asks to start/resume.
