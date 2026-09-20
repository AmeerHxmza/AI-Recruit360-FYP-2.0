# Final project audit - 20 September 2026

## Design revision after initial review

The user preferred a richer SaaS experience to the initial static simplification. The landing now includes a focused interactive product preview with sample candidates, accessible evaluation tabs, CSS entrance/hover transitions, and reduced-motion support. New files are product-preview.tsx and scoped CSS modules; the removed legacy 550-line showcase and unsupported claims remain removed. Shared buttons and metric cards have restrained hover/focus feedback. Performance/auth/database changes remain intact. This section supersedes the initial static-only presentation direction.

## Scope and release status

Local code audit and improvements for AI-Recruit360, a BS Software Engineering FYP. The user supplied the Vercel frontend and Render backend URLs. Changes have **not been pushed or deployed**. Existing database records and the original project/reference thesis files were preserved.

The final thesis evidence pack is a separate, user-confirmed stage. Current screenshots are layout QA with public pages or synthetic data. They must not be presented as a complete real-user acceptance test.

## Findings and fixes

| Finding | Change | Why it matters |
| --- | --- | --- |
| Auth startup used both getSession and INITIAL_SESSION, each loading account context | One initial-session loader; synchronous callback schedules database work outside the auth lock | Avoids duplicate reads and a documented auth callback hang pattern |
| Server user identity could be inferred from request headers | Removed header shortcut; server verifies the Supabase user, with request-scoped deduplication | Client-controlled headers are not trusted as identity |
| Organization cookie treated as evidence of membership | Redirects check actual membership; data loaders continue fresh organization validation | A stale/preference cookie cannot substitute for authorization |
| Repeated profile/membership work within server rendering | Retained shared request-scoped bundle and parallel reads | Same-user context callers share one profile and membership query |
| Job totals downloaded application rows and counted them in JavaScript | Embedded PostgreSQL counts returned with jobs | One request; no truncation at the application-row response cap |
| Candidate and job summary totals downloaded records | Filtered embedded count queries | Smaller payloads; errors no longer appear as fabricated zero totals |
| Every search character could trigger server actions | 300ms debounce; request versions ignore late responses | Fewer calls; old responses do not overwrite a newer search |
| Application view reloaded immediately after receiving server data | Initial filter state uses the server result | Removes a redundant startup action |
| Candidate search reloaded unrelated global totals | Refresh totals after explicit refresh/deletion, not ordinary searching | Avoids a second server action per search |
| Stateful lists could survive organization switching | Client list keys include organization ID | Resets previous-workspace UI state |
| Document lists requested signed links separately | One batch signed-URL request | Reduces storage round trips |
| CV job and candidate reads ran sequentially | Parallel reads after loading the application, retaining organization filters | Removes one sequential database wait |
| Already-extracted resume text was written again | Reuse saved text without the redundant update | Avoids repeated extraction/storage work |
| DOCX extraction ignored table content | Extract paragraphs and tables in document order | Supports common table-based resume templates |
| Upload UI advertised 10/20 MB through Vercel | Consistent 4 MB frontend/backend checks and UI labels | Leaves room below Vercel's 4.5 MB request limit |
| Legacy DOC format advertised as supported | PDF and DOCX only | Matches available parsers |
| Speech transcription client had no explicit lifecycle/budget | Close client after each request; 45-second timeout, no automatic retries | Bounded failures and no abandoned connections |
| Invalid breadcrumb-reset effect | Route-scoped override state | Removes lint error and unnecessary render reset |
| Decorative JS/observers concealed content during startup | Server-rendered landing workflow; removed exclusive animation helpers/showcase | Less hydration work, no reveal delay |
| Unsupported claims and commercial plan descriptions | Removed zero-hallucination/compliance guarantees and unimplemented pricing | Product and thesis claims match the implementation |
| Dead screening implementation and cache | Removed verified-unused legacy modules | Smaller, clearer teaching/maintenance surface |
| Stale configuration/documentation | Removed unused keep-alive settings and nonexistent health proxy header; rewrote setup/deployment docs | Avoids implying behavior that does not exist |

### Removed source files

- `ai-service/app/services/screening/agents.py`
- `ai-service/app/services/screening/cv_analyzer.py`
- `ai-service/app/services/screening/job_analyzer.py`
- `ai-service/app/services/cv/embeddings.py`
- `ai-service/app/core/cache.py`
- `frontend/components/landing/interactive-showcase.tsx`
- `frontend/components/ui/animated-counter.tsx`
- `frontend/components/ui/scroll-progress.tsx`
- `frontend/components/ui/scroll-reveal.tsx`

An AST import scan found no active imports into the legacy backend group. The current screening orchestrator remains. Removed unused tenacity requirement and compatibility cosine helper; retained pypdf because it is used as a PDF fallback. Historical SQL/types remain to preserve database compatibility. File removal alone is not claimed to reduce request latency; request and rendering changes are the relevant optimizations.

## Validation evidence

| Check | Result |
| --- | --- |
| Frontend ESLint | Passed, no warnings on final lint run |
| TypeScript and production Webpack build | Passed |
| Backend pytest | 25 passed; one existing Starlette/httpx deprecation warning |
| Server auth regression | Verified user required, forged identity rejected, wrong organization rejected, request context deduplicated |
| Stale organization-cookie regression | Redirect uses actual membership |
| Aggregate mapping regression | Counts above1000 preserved in a single job query |
| Browser auth startup | Exactly one profile and one membership request with synthetic intercepted session/data; no page errors |
| Isolated database tests | Migrations01-09 pass on both legacy and renamed schema layouts |
| Database workflow tests | Atomic submissions, duplicate retries, preserved resume evidence, question order/ownership/time limits, finalization, interview answer retries, recruiter decision preservation, tenant isolation and role restrictions |
| Live database aggregate probe | Read-only totals matched exact HEAD counts; no records changed |
| Public browser checks | Home, login, signup, forgot-password, reset-password, privacy at320/375/414/768/1440 widths; no horizontal overflow or uncaught page errors |
| Workspace layout fixture |375/768/1440 widths passed with synthetic data |
| Interview layout fixture |1920x1080,1440x900,1366x768,1280x720,1024x600,390x844 passed; full avatar frame retained |
| Extraction tests | Real generated text-PDF, table-only DOCX and empty-PDF failure path |

Commands and scripts are documented in README.md. Tests did not submit private candidate information to AI providers. Layout fixtures do not verify real Simli connectivity or microphone permissions.

## Measured deployed behavior

Read-only samples from this machine against the existing deployment:

- Frontend `/`: HTTP200, first byte0.710 seconds, full response3.391 seconds.
- Backend `/api/v1/health`: first request timed out after25 seconds with no response; subsequent request returnedHTTP200 in1.919 seconds.

These are individual observations, not percentile measurements or before/after results. The backend pattern is consistent with a cold start but does not prove it. The Render plan remains unconfirmed. Health includes a Supabase read, so it is not a pure server-execution measurement. Changes remain local; do not attribute these deployed measurements to the updated code.

## Remaining acceptance work

Before approving the final evidence capture:

1. Review the new local production UI at localhost:3100.
2. Redeploy the reviewed changes using the chosen Vercel/Render workflow and verify environment variables, regions, plan, function duration, and pending migration history.
3. In a designated test workspace, verify signup/login/password reset, organization creation/switching, profile settings, job draft/publish/pause, link sharing, CV upload, screening recovery, all assessment questions and pass/fail transitions.
4. Complete typed and recorded interviews; verify microphone permissions, transcription review, configured female voice, Simli connection/repeat/mute/disconnect, and full-frame desktop/mobile layout.
5. Confirm final score persistence, recruiter shortlist/reject actions, candidate/profile documents, search/filter/pagination, and unauthorized access denial.
6. Measure cold and warm navigation plus each AI stage using repeated samples. Record actual timings and error counts. Do not fill a thesis performance table with invented values.

No production load test, model accuracy/fairness benchmark, paid-provider end-to-end run, or independent penetration test has been performed in this audit. Existing tests passing do not establish that every production condition works perfectly.

## Thesis and evidence plan (after user confirmation)

Use the provided Word template as the authority for chapter order, styles, front matter, numbering and formatting. The friend's GlucoSense thesis is a structural reference only; do not reuse its prose, results, citations or screenshots as this project's evidence. Preserve the previous thesis file and create a new `Thesis.docx`.

Capture every implemented route/state needed for the report: public/auth, onboarding, dashboard, jobs and job detail/create, applications, candidates/detail/documents, interviews/detail, evaluations, analytics, settings, apply, assessment, interview room, completion and representative recovery/error states. Use consented or synthetic records. Hide credentials, tokens and unrelated personal information.

Create database schema/table figures from verified structure, an ERD, system/context and deployment diagrams, actor/use-case diagrams, activity diagrams for application-screening-assessment-interview-review, sequence diagrams for critical requests, and a test/evidence traceability matrix. Keep diagram source files so the report can be revised.

Prepare original implementation-grounded prose, cited related work, requirements, design, implementation, tests, measured results, limitations and future work. Follow the requested120+ page target through substantive material, not duplicated filler. Verify the DOCX by rendering and inspecting pages. Similarity scores and marks cannot be guaranteed.

### UI revision validation (2026-09-20)

Lint and production build passed. Six public routes passed at five viewport widths (320–1440px), with no horizontal overflow or uncaught browser errors. Interactive candidate selection, keyboard tab navigation and reduced-motion checks passed. Auth startup and three workspace fixture viewport checks passed. Desktop landing screenshot visually reviewed. These are local checks; the revised UI has not been deployed.

### Sign-in recovery repair (2026-09-20)

Bound browser Auth requests to 15 seconds and sign-in initialization to 25 seconds, with retryable UI and stale-result guards. Successful sign-in uses a fresh cookie-backed document navigation instead of simultaneous push/refresh. Lint, production build, auth startup regression and three new compiled-browser sign-in scenarios (invalid, successful, stalled) passed. Supabase Auth settings returned 200 in a read-only probe; the original user request failure was not captured and real-account acceptance remains pending. No deployment or data modifications.
