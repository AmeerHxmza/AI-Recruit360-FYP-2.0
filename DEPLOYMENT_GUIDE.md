# Deployment notes

This FYP is configured for local use. Complete the [local setup and acceptance test](README.md) before deployment.

The optional `render.yaml` describes the FastAPI service only. Nothing is deployed automatically by the local update. Run one worker; introducing multiple processes requires shared concurrency/rate-limit coordination.

For a hosted frontend, configure the public Supabase URL/anon key, private service-role key, private AI service URL (ending in `/api/v1`), shared secret, and candidate session secret. Set the same shared secret on FastAPI. Configure the actual frontend origin in Supabase Auth redirect settings and backend allowed origins. Use HTTPS so candidate cookies are secure.

The hosting platform must allow an AI request to run for up to 90 seconds. A short serverless timeout is incompatible with the current synchronous FYP flow. Keep environment secrets out of source control. Apply only pending database migrations and preserve existing records.
