# Set up this isolated project copy

This folder has no Git remote. Both local environment files now point to https://nuodoigrttsmxdncfrqz.supabase.co; the supplied API keys are configured locally. The original GitHub repository and Supabase database have not been changed.

1. Stop any running frontend and AI service terminals so they release the previous environment configuration.
2. In https://supabase.com/dashboard, create a new project named `recruit360-fyp-sandbox` in your own organization. Choose a suitable available region and save the database password privately.
3. In the **new project's** SQL Editor, run `migrations/01_schema.sql`, then `02` through `08`, individually and in numerical order. This is an empty database, so `01` is required. Stop if a file fails and inspect its error before continuing.
4. Find the new project URL and API keys in the dashboard. The existing environment variable names accept the legacy `anon` and `service_role` keys. Enter them locally, not in chat:

   | Local file | Variable | New project value |
   | --- | --- | --- |
   | `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `frontend/.env.local` | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `ai-service/.env` | `SUPABASE_URL` | Same project URL |
   | `ai-service/.env` | `SUPABASE_SERVICE_ROLE_KEY` | Same service_role key |

   Keep the existing AI provider key, shared service secret, and candidate session secret. Never put the service_role key in a `NEXT_PUBLIC_` variable.

5. In Supabase Authentication URL Configuration, set the Site URL to `http://localhost:3000` and allow these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/reset-password`
6. From the repository root, run `node scripts/check-live-schema.mjs`. It checks schema metadata without changing records.
7. Restart both services using the root README instructions. Sign up with a new test account and create a workspace. Accounts and records from the original database will not appear in this new project.

## Verified initialization (2026-09-15)

Project `nuodoigrttsmxdncfrqz` was verified empty, then migrations 01?08 were applied through Supabase MCP. Do not rerun those migrations on this project.

- 17 application tables, all with row-level security enabled.
- Private candidate_documents bucket with a 10 MB file limit.
- Authenticated workspace creation, empty dashboard, and application search verified in a rolled-back transaction; no test records retained.
- Migration 08 explicitly removes inherited anonymous function permissions and fixes the update trigger's search path.
- The security advisor retains three intentional authenticated SECURITY DEFINER notices for workspace creation and membership helpers. These functions check the current user and use a fixed search path. See https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.

The supplied API keys have been configured in both ignored local environment files. Service-role API schema access has been verified. Remaining: check authentication redirect settings, restart both services, and sign up with a new test account.
