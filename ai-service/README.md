# Recruit360 AI service

See the [root setup guide](../README.md) for environment and database preparation.

Run `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` from this directory using the virtual environment. Run one worker. The private routes are under `/api/v1`; they require `Authorization: Bearer <AI_SERVICE_SHARED_SECRET>` even in development.

The active screening route calls `services/screening/orchestrator.py`. Assessment generation returns validated questions; scoring is enforced by PostgreSQL. Interview responses and final evaluations are persisted using transactional functions. AI failures raise retryable errors and never create substitute scores or transcripts.

`GET /api/v1/health/live` checks the process. `/health` and `/health/ready` check database connectivity. Provider access and workflow migrations need the separate acceptance test described in the root guide.

Run `python -m pytest -q` here. The tests do not contact the configured Supabase or AI accounts.
