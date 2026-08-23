"""
app/workers
───────────
ARQ background job workers for AI-intensive tasks.

Services:
  - task_screen_cv        — Multi-agent CV screening pipeline
  - task_generate_assessment — Personalized MCQ generation
  - task_generate_evaluation — Final candidate evaluation scorecard

Run with:
    python -m app.workers.worker
"""
