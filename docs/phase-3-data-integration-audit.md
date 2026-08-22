# Phase 3 Data Integration Audit — AI-Recruit360

## 1. Executive Summary

This document performs a complete audit of all frontend routes, services, server actions, and data sources across the **AI-Recruit360** codebase to guide the Phase 3 connection of the application to live Supabase tables.

---

## 2. Route Audit Matrix

| Route | Page File | Current Data Source | Target Supabase Table(s) | Read/Write Requirement | Integration Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Static Marketing Components | None (Static) | Read Only | **N/A (Marketing)** |
| `/login` | `app/login/page.tsx` | Supabase Auth Form | `auth.users`, `profiles` | Read / Write | **Connected** |
| `/signup` | `app/signup/page.tsx` | Supabase Auth Form | `auth.users`, `profiles`, `organizations` | Read / Write | **Connected** |
| `/onboarding/organization` | `app/onboarding/organization/page.tsx` | Organization RPC | `organizations`, `organization_members` | Write | **Connected** |
| `/apply/[job-slug]` | `app/apply/[job-slug]/page.tsx` | `jobs.ts`, `applications.ts` | `jobs`, `candidates`, `applications`, `candidate_documents`, `assessments`, `interviews` | Public Read / Write | **Pending Connection** |
| `/dashboard` | `app/dashboard/page.tsx` | `dashboard-service.ts` | `jobs`, `candidates`, `applications`, `interviews`, `cv_screenings` | Org Read | **Pending Connection** |
| `/jobs` | `app/jobs/page.tsx` | `job-service.ts` | `jobs`, `applications` | Org Read / Write | **Pending Connection** |
| `/jobs/new` | `app/jobs/new/page.tsx` | `createJobAction` | `jobs` | Org Write | **Pending Connection** |
| `/jobs/[id]` | `app/jobs/[id]/page.tsx` | `job-service.ts` | `jobs`, `applications` | Org Read / Write | **Pending Connection** |
| `/candidates` | `app/candidates/page.tsx` | `candidate-service.ts` | `candidates`, `applications`, `cv_screenings` | Org Read / Write | **Pending Connection** |
| `/candidates/[id]` | `app/candidates/[id]/page.tsx` | `candidate-service.ts` | `candidates`, `applications`, `candidate_documents`, `cv_screenings`, `assessments`, `interviews`, `final_evaluations` | Org Read / Write | **Pending Connection** |
| `/applications` | `app/applications/page.tsx` | `application-service.ts` | `applications`, `candidates`, `jobs` | Org Read / Write | **Pending Connection** |
| `/interviews` | `app/interviews/page.tsx` | `interview-service.ts` | `interviews`, `applications`, `candidates`, `jobs` | Org Read / Write | **Pending Connection** |
| `/interviews/[id]` | `app/interviews/[id]/page.tsx` | `interview-service.ts` | `interviews`, `interview_questions`, `interview_responses` | Org Read / Write | **Pending Connection** |
| `/evaluations` | `app/evaluations/page.tsx` | `evaluation-service.ts` | `final_evaluations`, `applications`, `candidates`, `jobs` | Org Read / Write | **Pending Connection** |
| `/ai-activity` | `app/ai-activity/page.tsx` | `ai-activity-service.ts` | `ai_activity_logs` | Org Read | **Pending Connection** |
| `/analytics` | `app/analytics/page.tsx` | Mock/Analytics Service | `jobs`, `applications`, `cv_screenings`, `assessments`, `interviews` | Org Read | **Pending Connection** |

---

## 3. Data Cleanup & Zero State Requirements

1. **Recruiter Workspace Views**: Replace all hardcoded candidate names (e.g. `Sarah Khan`, `Sophia Chen`), fake 94% scores, and fabricated pipeline metrics with live Supabase database queries.
2. **Zero States**: When database tables contain 0 rows (e.g., brand new organization workspace), render clean enterprise zero states:
   - Dashboard: All metric cards show `0`, funnel shows `0`, recent applications table shows `"No candidates applied yet"`.
   - Candidates: `empty-candidates.png` with `"No candidate profiles found"`.
   - Analytics: `"No recruitment analytics data available yet"`.
   - AI Activity: `"No AI activity events recorded yet"`.
   - Evaluations: `"Pending Evaluation"`.
