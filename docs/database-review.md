# AI-Recruit360 — Database & Backend Architecture Review

This document provides an engineering review of the production database contract, backend service architecture, multi-tenancy model, security policies, and migration safety for **AI-Recruit360**.

---

## 1. Database Architecture Summary

The AI-Recruit360 backend is built on a 16-table PostgreSQL schema in Supabase:

- **Identity & Organization Core**: `profiles`, `organizations`, `organization_members`
- **Recruitment Positions & Applicants**: `jobs`, `candidates`, `applications`
- **Document Metadata**: `candidate_documents` (linked to Supabase Storage `candidate-documents`)
- **AI Analysis & Verbatim Citation**: `ai_candidate_analyses`, `ai_analysis_evidences`
- **Interview & Question Management**: `interviews`, `interview_questions`, `interview_responses`
- **Evaluations & Criteria**: `evaluations`, `evaluation_criteria_scores`
- **Telemetry & Security Audit**: `ai_activity_logs`, `security_audit_logs`

---

## 2. Multi-Tenant Strategy

- Every business entity is bound to an `organization_id`.
- Tenant isolation is enforced at the database level using Row Level Security (RLS) policies evaluated against `auth.uid()`.
- Organization membership is managed through `organization_members(organization_id, user_id, role)`.
- Application-level session context (`lib/auth/session.ts`) resolves organization access strictly via server-side membership validation, never trusting client URL parameters.

---

## 3. Entity Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1 auto-trigger)
public.profiles
    ↓ (1:N)
public.organization_members
    ↓ (N:1)
public.organizations
    ↓ (1:N)
[ jobs | candidates ]
    ↓ (N:N bridge via applications)
public.applications
    ↓ (1:N)
[ candidate_documents | ai_candidate_analyses | interviews | evaluations ]
```

---

## 4. RLS Strategy

- **Security Functions**: Helper functions `public.is_org_member(_org_id)` and `public.get_user_org_role(_org_id)` are defined with `SECURITY DEFINER`, `SET search_path = public, pg_temp`, and restricted execute permissions (`GRANT TO authenticated`, `REVOKE FROM anon, public`).
- **Atomic Bootstrap**: Organization creation uses `public.create_organization(_name, _slug)` RPC to atomically create the organization and assign `owner` role. Client direct `INSERT` on `organizations` and `organization_members` is restricted.
- **Child Entity RLS**: `interview_questions`, `interview_responses`, and `evaluation_criteria_scores` enforce parent-chain organization membership via subqueries.

---

## 5. Role Model (RBAC)

The application enforces a 5-tier role hierarchy (`owner`, `admin`, `recruiter`, `interviewer`, `viewer`):
- `owner` / `admin`: Full workspace management, member role control, audit log access.
- `recruiter`: Full candidate, job, application, document, and interview pipeline control.
- `interviewer`: Assigned interview viewing, response recording, and evaluation submission.
- `viewer`: Read-only access to permitted tenant resources.

---

## 6. Storage Security

- **Bucket**: `candidate-documents` (Private, 20MB limit, restricted MIME types).
- **Path Pattern**: `{organization_id}/{candidate_id}/{filename}`.
- **Validation**: Read & Upload policies verify both `organization_id` membership AND that `(storage.foldername(name))[2]::uuid` (`candidate_id`) belongs to that organization.
- **Immutability**: No `UPDATE` policy exists. Candidate document files are immutable.

---

## 7. Cross-Tenant Protection

- Parent-child relationships enforce **Composite Foreign Keys**:
  - `applications`: `FOREIGN KEY (job_id, organization_id) REFERENCES jobs(id, organization_id)`
  - `applications`: `FOREIGN KEY (candidate_id, organization_id) REFERENCES candidates(id, organization_id)`
  - `candidate_documents`: `FOREIGN KEY (candidate_id, organization_id) REFERENCES candidates(id, organization_id)`
  - `ai_candidate_analyses`: `FOREIGN KEY (application_id, organization_id) REFERENCES applications(id, organization_id)`
  - `interviews`: `FOREIGN KEY (application_id, organization_id) REFERENCES applications(id, organization_id)`
  - `evaluations`: `FOREIGN KEY (application_id, organization_id) REFERENCES applications(id, organization_id)`
- PostgreSQL rejects cross-tenant references automatically before any data write.

---

## 8. Potential Migration Concerns

1. **Migration Execution Sequence**: Always run `20260820000000_schema_initialization.sql` before `20260820000001_rls_and_security.sql`.
2. **Search Path**: All triggers and helper functions explicitly set `search_path = public, pg_temp` to prevent search path injection attacks.
3. **Storage Bucket Dependency**: Storage policies depend on `storage.objects` and `storage.buckets` tables existing in Supabase.

---

## 9. Recommended Future Improvements

1. **TypeScript Type Auto-Generation**: Run `npx supabase gen types typescript` when connected to live Supabase instance to auto-update `@/types/database.types.ts`.
2. **Materialized Views for Analytics**: When candidate application volume scales, add materialized views for funnel performance analytics.

---

## 10. Explicit Statement of What Was NOT Changed

- **NO UI Redesign**: No existing UI layout or design tokens were altered.
- **NO Fake/Mock Data**: No fake jobs, candidates, or applications were populated in code.
- **NO AI Implementation**: No LLMs, embeddings, vector search, or RAG pipelines were implemented in this step.
- **NO Broken Auth**: Existing Supabase Auth signup, login, session refresh, middleware protection, and logout remained 100% untouched and fully functional.
