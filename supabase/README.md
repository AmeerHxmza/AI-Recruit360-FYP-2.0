# Database migrations

For this isolated copy's new Supabase project, follow [NEW_PROJECT.md](NEW_PROJECT.md). Both local project URLs have been updated; the new project nuodoigrttsmxdncfrqz now has migrations 01?08 applied. Local API keys are configured and the API schema connection is verified.

The connected Supabase database has been inspected through read-only schema metadata. No remote data or database policies have been changed by this update.

## Existing project: preserve data

Use a database backup/copy for the first migration run. In the Supabase SQL editor, execute **pending migrations 02 through 09, in numerical order**. Do not run `01_schema.sql` against the existing project and do not reset the database. Each file is transactional; if a file fails, its changes roll back. Stop and inspect the reported constraint/schema difference before proceeding.

- **02:** Align the old/new column layouts, preserve legacy evidence, and replace the FYP tables' policies with explicit organization/role rules. Existing rows remain; legacy columns are retained. Foreign-key constraints use `NOT VALID` so historical inconsistencies are not silently deleted. New writes are checked.
- **03:** Atomically submit candidate, application, and document records, with a retry key.
- **04:** Enforce assessment ownership, order, server time, immutable answers, and finalization.
- **05:** Atomically save screening, interview responses, and final evaluations with their stage transitions.
- **06:** Return dashboard aggregates without the PostgREST row limit truncating totals.
- **07:** Search applications before pagination.
- **08:** Restrict function permissions explicitly under Supabase defaults and fix the update trigger search path.
- **09:** Add membership and workflow lookup indexes. Verify the live migration history before applying; September20 checks ran this in memory only.

These migrations intentionally change FYP table access policies. Owners/admins/recruiters can manage recruitment records; viewers/interviewers can read their workspace. Candidate workflow writes go through the private server functions. No migration truncates tables or deletes candidate/application records.

## Empty Supabase project

Run `01_schema.sql`, followed by `02` through `09`. The initial schema depends on Supabase-managed auth/storage schemas. Do not run it directly on a plain PostgreSQL installation without that infrastructure.

## Verification

From the repository root, `node scripts/check-database.mjs` verifies the original schema layout. Add `--current-layout` to exercise the renamed layout found in the connected project. These tests use synthetic data in memory and never connect to your Supabase instance.

After migration, refresh the Supabase API schema cache if needed (`NOTIFY pgrst, 'reload schema';`), restart the local frontend/AI service, and test signup, organization creation, job publishing, candidate submission, the timed assessment, the interview, and recruiter review.
