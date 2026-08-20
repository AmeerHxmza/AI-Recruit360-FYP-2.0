# AI-Recruit360 — Database Architecture & Data Model

This document establishes the production PostgreSQL/Supabase multi-tenant data architecture for **AI-Recruit360**, establishing entity relationships, security models (RLS), document storage metadata, future AI data compatibility, and database migrations.

---

## 1. Architectural Overview

AI-Recruit360 is engineered as a **multi-tenant SaaS platform** for AI-powered candidate evaluation.

The core data hierarchy strictly enforces multi-tenancy:

```
auth.users (Supabase Auth)
    ↓
public.profiles
    ↓
public.organization_members
    ↓
public.organizations (Tenants)
    ↓
[ Organization-Owned Resources ]
 (jobs, candidates, applications, documents, interviews, evaluations, AI activity)
```

### Core Security & Multi-Tenancy Principles:
- **Tenant Isolation & Composite Keys**: Every entity includes `organization_id`. Related tables enforce composite foreign keys (e.g., `(job_id, organization_id)`), guaranteeing that a candidate or application from Organization A can never be attached to a job from Organization B.
- **Atomic Bootstrap RPC**: Organization creation uses a hardened `create_organization()` database RPC function that atomically creates the organization and assigns the creator the `owner` role.
- **Database-Level RLS**: Row Level Security (RLS) policies enforce data isolation directly in PostgreSQL. Frontend state, URL parameters, or client filters are never trusted for security boundaries.
- **Hardened Helper Functions**: Helper functions (`is_org_member()`, `get_user_org_role()`) use an explicit `SET search_path = public, pg_temp` and schema-qualified references, with execute rights limited to `authenticated`.
- **Immutable Storage**: Documents uploaded to Supabase Storage are immutable. Reading and uploading validate that the candidate ID in the path actually belongs to the user's organization.
- **Separation of Identity**: `auth.users` owns authentication identity. Application metadata resides in `public.profiles`, populated via an `AFTER INSERT ON auth.users` trigger.
- **Decoupled AI Outputs**: AI match scores, reasoning, and evidence citations are stored separately from raw candidate profile data.

---

## 2. Entity Relationship Diagram (ERD)

```
                       +-------------------+
                       |    auth.users     |
                       +-------------------+
                                 | 1
                                 |
                                 | 1 (auto-trigger)
                       +-------------------+
                       |  public.profiles  |
                       +-------------------+
                                 | 1
                                 |
                                 | N
                  +------------------------------+
                  | public.organization_members  |
                  +------------------------------+
                                 | N
                                 |
                                 | 1 (Atomic RPC: create_organization)
                      +----------------------+
                      | public.organizations |
                      +----------------------+
                                 | 1
         +-----------------------+-----------------------+
         | 1 (Composite FK)      | 1 (Composite FK)      | 1
         v N                     v N                     v N
  +-------------+         +----------------+     +-------------------+
  | public.jobs |         |   candidates   |     |  ai_activity_logs |
  +-------------+         +----------------+     +-------------------+
         | 1                     | 1                     |
         | (Composite FK)        | (Composite FK)        | 1
         +-----------+-----------+                       |
                     | N                                 v N
           +------------------+                 +---------------------+
           |   applications   |                 | candidate_documents |
           +------------------+                 +---------------------+
                     | 1                                 | 1
         +-----------+-----------+                       |
         | 1 (Composite FK)      | 1 (Composite FK)      | N (Composite FK)
         v N                     v N                     v 1 (optional)
  +--------------+        +--------------+      +-----------------------+
  |  interviews  |        | evaluations  |      | ai_candidate_analyses |
  +--------------+        +--------------+      +-----------------------+
         | 1                     | 1                     | 1
         v N                     v N                     v N
+--------------------+ +--------------------+ +-------------------------+
|interview_questions | | evaluation_criteria| |   ai_analysis_evidences |
+--------------------+ +--------------------+ +-------------------------+
         | 1
         v N
+--------------------+
|interview_responses |
+--------------------+
```

---

## 3. Detailed Entity Specifications

### 3.1 Organization & User Model

#### `public.profiles`
App-level profile data populated automatically on signup via trigger `tr_on_auth_user_created_profile`.
- `id` (UUID, PK): References `auth.users(id)` ON DELETE CASCADE.
- `full_name` (TEXT, NOT NULL): Display name of the recruiter/interviewer.
- `avatar_url` (TEXT): Public URL to profile avatar.
- `job_title` (TEXT): Title inside organization (e.g. "Recruitment Specialist").
- `created_at`, `updated_at` (TIMESTAMPTZ).

#### `public.organizations`
Tenant account representing a company or agency.
- `id` (UUID, PK): System identifier.
- `name` (TEXT, NOT NULL): Company name (e.g. "NeuralScale Inc.").
- `slug` (TEXT, NOT NULL, UNIQUE): URL slug for organization workspace.
- `created_by` (UUID): References `auth.users(id)` ON DELETE SET NULL DEFAULT `auth.uid()`.
- `created_at`, `updated_at` (TIMESTAMPTZ).

#### `public.organization_members`
Join table establishing multi-tenant access control and roles.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `user_id` (UUID, NOT NULL): References `auth.users(id)` ON DELETE CASCADE.
- `role` (TEXT, NOT NULL): `owner`, `admin`, `recruiter`, `interviewer`, `viewer`.
- `created_at` (TIMESTAMPTZ).
- *Constraint*: `UNIQUE(organization_id, user_id)`

---

### 3.2 Recruitment Positions & Candidates

#### `public.jobs`
Recruitment job positions created within an organization.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `title` (TEXT, NOT NULL): Position title (e.g. "Senior AI/ML Engineer").
- `department` (TEXT, NOT NULL): E.g. "Engineering".
- `location` (TEXT, NOT NULL): E.g. "San Francisco, CA".
- `employment_type` (TEXT, NOT NULL): `full_time`, `part_time`, `contract`, `internship`.
- `workplace_type` (TEXT, NOT NULL): `on_site`, `hybrid`, `remote`.
- `description` (TEXT): Full job description text.
- `requirements` (TEXT): Technical skills & qualifications required.
- `status` (TEXT, NOT NULL): `draft`, `active`, `paused`, `closed`.
- `created_by` (UUID): References `auth.users(id)` DEFAULT `auth.uid()`.
- `created_at`, `updated_at`, `closed_at` (TIMESTAMPTZ).
- *Constraint*: `UNIQUE (id, organization_id)` — Enables composite foreign key enforcement.

#### `public.candidates`
Candidate records owned by an organization. Candidates exist independently of specific jobs.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `full_name` (TEXT, NOT NULL): Candidate full name.
- `email` (TEXT, NOT NULL): Primary contact email.
- `phone`, `location`, `headline`, `summary` (TEXT).
- `linkedin_url`, `portfolio_url` (TEXT).
- `created_at`, `updated_at` (TIMESTAMPTZ).
- *Constraint*: `UNIQUE(organization_id, email)` — Prevents duplicate candidate profiles within the same organization.
- *Constraint*: `UNIQUE (id, organization_id)` — Enables composite foreign key enforcement.

#### `public.applications`
Bridge table representing a candidate applying to a specific job position.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `job_id` (UUID, NOT NULL).
- `candidate_id` (UUID, NOT NULL).
- `status` (TEXT, NOT NULL): `applied`, `screening`, `interview`, `evaluation`, `shortlisted`, `rejected`, `hired`.
- `source` (TEXT, NOT NULL): E.g. "direct", "linkedin", "referral".
- `applied_at`, `updated_at` (TIMESTAMPTZ).
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (job_id, organization_id) REFERENCES public.jobs(id, organization_id) ON DELETE CASCADE`
  - `FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE`
  - `UNIQUE (job_id, candidate_id)` — Enforces single active application per candidate per job position.
  - `UNIQUE (id, organization_id)` — Enables composite foreign key enforcement.

---

### 3.3 Candidate Documents & Storage Metadata

#### `public.candidate_documents`
Metadata records for files stored securely in Supabase Storage (`candidate-documents` bucket).
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `candidate_id` (UUID, NOT NULL).
- `application_id` (UUID).
- `file_name` (TEXT, NOT NULL): E.g. "Sophia_Chen_Resume.pdf".
- `file_type` (TEXT, NOT NULL): MIME type (e.g. "application/pdf").
- `storage_path` (TEXT, NOT NULL, UNIQUE): Storage object path (`{org_id}/{candidate_id}/{filename}`).
- `file_size` (BIGINT, NOT NULL): Bytes.
- `document_type` (TEXT, NOT NULL): `resume`, `cover_letter`, `portfolio`, `assessment`, `other`.
- `processing_status` (TEXT, NOT NULL): `uploaded`, `processing`, `processed`, `failed`.
- `extracted_text` (TEXT): Full raw text extracted during OCR/parsing pipeline.
- `parser_version` (TEXT): Parser model version string.
- `uploaded_at`, `processed_at` (TIMESTAMPTZ).
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE`
  - `FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE SET NULL`
  - `UNIQUE (id, organization_id)` — Enables composite foreign key enforcement.

---

### 3.4 AI Analysis & Evidence Traceability

#### `public.ai_candidate_analyses`
AI-generated evaluation matrix output for an application.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `application_id` (UUID, NOT NULL).
- `match_score` (INT): Overall alignment score (0 to 100).
- `skills_alignment` (JSONB): Structured skill matrix breakdown.
- `experience_alignment` (JSONB): Experience level analysis.
- `education_alignment` (JSONB): Educational requirement check.
- `reasoning` (TEXT): Comprehensive AI reasoning summary text.
- `recommendation` (TEXT): `strong_match`, `potential_match`, `low_alignment`, `needs_review`.
- `model_info` (JSONB): LLM provider, version, and prompt token metadata.
- `created_at`, `updated_at` (TIMESTAMPTZ).
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE`
  - `UNIQUE (id, organization_id)`

#### `public.ai_analysis_evidences`
Granular citations linking AI match scores back to verified candidate document excerpts.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `analysis_id` (UUID, NOT NULL).
- `source_document_id` (UUID).
- `evidence_type` (TEXT, NOT NULL): E.g. "resume_excerpt", "skill_claim", "experience_duration".
- `source_reference` (TEXT): E.g. "Page 1, Section: Technical Skills".
- `content` (TEXT, NOT NULL): Verbatim extracted snippet from candidate resume/document.
- `relevance_score` (FLOAT): Relevance confidence (0.0 to 1.0).
- `created_at` (TIMESTAMPTZ).
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (analysis_id, organization_id) REFERENCES public.ai_candidate_analyses(id, organization_id) ON DELETE CASCADE`
  - `FOREIGN KEY (source_document_id, organization_id) REFERENCES public.candidate_documents(id, organization_id) ON DELETE SET NULL`

---

### 3.5 Interview & Evaluation Domain

#### `public.interviews`
Interview sessions scheduled for an application.
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `application_id` (UUID, NOT NULL).
- `scheduled_at` (TIMESTAMPTZ, NOT NULL).
- `duration_minutes` (INT, DEFAULT 45).
- `status` (TEXT, NOT NULL): `scheduled`, `in_progress`, `completed`, `cancelled`.
- `interview_type` (TEXT, NOT NULL): `ai_adaptive`, `technical`, `behavioral`, `screening`.
- `created_by` (UUID): References `auth.users(id)` DEFAULT `auth.uid()`.
- `created_at`, `updated_at` (TIMESTAMPTZ).
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE`
  - `UNIQUE (id, organization_id)`

#### `public.interview_questions` & `public.interview_responses`
Structured question management and response tracking.
- `interview_questions`: `id`, `interview_id`, `question_text`, `category`, `question_order`, `created_at`.
- `interview_responses`: `id`, `question_id`, `response_text`, `audio_storage_path`, `duration_seconds`, `created_at`.

#### `public.evaluations` & `public.evaluation_criteria_scores`
Human & AI evaluation feedback records.
- `evaluations`: `id`, `organization_id`, `application_id`, `interview_id`, `evaluator_id`, `status` (`pending`, `in_review`, `completed`), `overall_score` (0-100), `recommendation` (`strong_hire`, `hire`, `no_hire`, `strong_no_hire`), `notes`, `created_at`, `updated_at`.
- *Cross-Tenant Constraints*:
  - `FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE`
  - `FOREIGN KEY (interview_id, organization_id) REFERENCES public.interviews(id, organization_id) ON DELETE SET NULL`
  - `UNIQUE (id, organization_id)`
- `evaluation_criteria_scores`: `id`, `evaluation_id`, `criteria_name` (e.g. "Technical Depth"), `score` (1-5 rating), `notes`.

---

### 3.6 Activity Logs & Security Audit Domain

#### `public.ai_activity_logs`
Product AI event stream feeds (drives the `/ai-activity` frontend workspace page).
- `id` (UUID, PK).
- `organization_id` (UUID, NOT NULL): References `public.organizations(id)` ON DELETE CASCADE.
- `user_id` (UUID): References `auth.users(id)` DEFAULT `auth.uid()`.
- `event_type` (TEXT, NOT NULL): `resume_analysis`, `evidence_retrieval`, `candidate_matching`, `interview_evaluation`.
- `entity_type` (TEXT): `candidate`, `application`, `interview`.
- `entity_id` (UUID).
- `status` (TEXT, NOT NULL): `success`, `warning`, `error`, `in_progress`.
- `metadata` (JSONB).
- `created_at` (TIMESTAMPTZ).
- *Security*: Client `INSERT` disabled. Written by server backend.

#### `public.security_audit_logs`
Security-sensitive audit log for compliance (login, role adjustments, data exports).
- `id` (UUID, PK).
- `organization_id`, `user_id` (UUID).
- `action` (TEXT, NOT NULL): E.g. `user_login`, `role_changed`, `org_created`.
- `ip_address`, `user_agent` (TEXT).
- `details` (JSONB).
- `created_at` (TIMESTAMPTZ).
- *Security*: Client `INSERT` disabled. Restricted `SELECT` to `owner` and `admin`.

---

## 4. Role-Based Access Control (RBAC) Matrix

Row Level Security (RLS) policies evaluate user roles stored in `organization_members`:

| Resource | `viewer` | `interviewer` | `recruiter` | `admin` | `owner` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Organization Settings** | Read-Only | Read-Only | Read-Only | Full Access | Full Access |
| **Organization Members** | View Members | View Members | View Members | Manage Members | Manage Members |
| **Jobs** | Read-Only | Read-Only | Create/Edit | Create/Edit | Full Access |
| **Candidates** | Read-Only | Read-Only | Create/Edit | Create/Edit | Full Access |
| **Applications** | Read-Only | Read-Only | Create/Edit | Create/Edit | Full Access |
| **Documents (Resumes)** | View | View | Upload/Delete | Upload/Delete | Full Access |
| **Interviews** | Read-Only | Manage Assigned | Create/Manage | Create/Manage | Full Access |
| **Evaluations** | Read-Only | Submit Feedback | Submit Feedback | Full Access | Full Access |
| **AI Activity Logs** | Read-Only | Read-Only | Read-Only | Read-Only | Read-Only |
| **Security Audit Logs** | No Access | No Access | No Access | Read-Only | Full Access |

---

## 5. Hardened Row Level Security (RLS) Helper Functions & RPCs

```sql
-- Helper: Is authenticated user an active member of organization?
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF _org_id IS NULL OR auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM anon, public;

-- Helper: Retrieve user role in organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  _role TEXT;
BEGIN
  IF _org_id IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO _role
  FROM public.organization_members
  WHERE organization_id = _org_id
    AND user_id = auth.uid();
  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_user_org_role(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_org_role(UUID) FROM anon, public;

-- Atomic Organization Creation RPC
CREATE OR REPLACE FUNCTION public.create_organization(_name TEXT, _slug TEXT)
RETURNS public.organizations AS $$
DECLARE
  _org public.organizations;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create an organization.';
  END IF;

  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (trim(_name), lower(trim(_slug)), _user_id)
  RETURNING * INTO _org;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org.id, _user_id, 'owner');

  RETURN _org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) FROM anon, public;
```

---

## 6. Storage Security & Immutable Document Policies

Recruitment documents (PDFs, DOCX files) are stored in the private `candidate-documents` bucket:
- **Bucket ID**: `candidate-documents` (Public: `FALSE`, File Limit: `20MB`).
- **Object Path Pattern**: `{organization_id}/{candidate_id}/{filename}`.
- **Validation**: Read and upload policies verify both `organization_id` membership AND that `candidate_id` actually belongs to `organization_id`.
- **Immutability**: No `UPDATE` policy is defined on `storage.objects`. Candidate documents are immutable. Uploading a revised document requires deleting the object or uploading a new file path.

---

## 7. Retention & Deletion Behavior Matrix

| Parent Table | Child Table | Foreign Key Action | Rationale |
| :--- | :--- | :--- | :--- |
| `organizations` | All Org Resources | `ON DELETE CASCADE` | Deleting an organization removes all associated tenant data. |
| `jobs` | `applications` | `ON DELETE CASCADE` | Job position deletion removes candidate application records for that job. |
| `candidates` | `applications` | `ON DELETE CASCADE` | Removing a candidate profile cleans up their applications. |
| `applications` | `ai_candidate_analyses` | `ON DELETE CASCADE` | AI analysis belongs strictly to the specific application lifecycle. |
| `applications` | `candidate_documents` | `ON DELETE SET NULL` | Deleting an application preserves candidate resumes on the main candidate record. |
| `candidate_documents` | `ai_analysis_evidences` | `ON DELETE SET NULL` | Removing a document clears source evidence links without destroying overall AI analysis history. |
| `auth.users` | `jobs.created_by` / `interviews.created_by` | `ON DELETE SET NULL` | Removing a team member preserves historical jobs and scheduled interviews. |

---

## 8. Indexing & Query Optimization

High-cardinality foreign keys and filter fields are indexed:
1. `idx_org_members_user_org` ON `organization_members(user_id, organization_id)`
2. `idx_jobs_org_status` ON `jobs(organization_id, status)`
3. `idx_candidates_org_email` ON `candidates(organization_id, email)`
4. `idx_applications_org_job` ON `applications(organization_id, job_id)`
5. `idx_applications_status` ON `applications(organization_id, status)`
6. `idx_documents_candidate` ON `candidate_documents(organization_id, candidate_id)`
7. `idx_ai_analysis_app` ON `ai_candidate_analyses(organization_id, application_id)`
8. `idx_interviews_app_scheduled` ON `interviews(organization_id, application_id, scheduled_at)`
9. `idx_evaluations_app` ON `evaluations(organization_id, application_id)`
10. `idx_ai_activity_org_created` ON `ai_activity_logs(organization_id, created_at DESC)`

---

## 9. Migration Strategy & Reproducibility

Migration SQL files are versioned in `supabase/migrations/`:
- [`20260820000000_schema_initialization.sql`](file:///d:/FinalYearProject%282026%29/AI-Recruit360/supabase/migrations/20260820000000_schema_initialization.sql): Table DDLs, composite FK constraints, checks, indexes, and profile auto-trigger.
- [`20260820000001_rls_and_security.sql`](file:///d:/FinalYearProject%282026%29/AI-Recruit360/supabase/migrations/20260820000001_rls_and_security.sql): Hardened security functions, atomic bootstrap RPC `create_organization()`, child resource RLS, and immutable storage security policies.

To apply migrations to your Supabase project:
```bash
npx supabase db push
```

---

## 10. TypeScript Type Generation Plan

To generate TypeScript types directly from your Supabase database schema:

```bash
npx supabase gen types typescript --project-id hkybdnbrrdjkrotwftrn > frontend/lib/supabase/database.types.ts
```

Frontend Supabase clients will import `Database` from `@/lib/supabase/database.types.ts` to ensure end-to-end type safety for all database queries.
