# AI-Recruit360 — AI Architecture & Multi-Agent Flow

```text
CANDIDATE APPLICATION
         │
         ▼
Uploaded Resume / CV Text
         │
         ▼
[ Fast Python Document Extractor ] (pypdf / python-docx)
         │
         ▼
[ Agent 1: Job Requirement Analyzer ]
         │
         ▼
[ Agent 2: Structured CV Parser ]
         │
         ▼
[ Multi-Agent Matching Engine ]
  ├── Agent 3: Skills Agent (40%)
  ├── Agent 4: Experience Agent (30%)
  ├── Agent 5: Education Agent (15%)
  ├── Agent 6: Evidence Agent (15%)
  └── Agent 7: Decision Agent
         │
         ▼
Pass Threshold Check (CV_PASS_THRESHOLD = 70.0%)
 ┌───────┴───────┐
 │               │
 NOT QUALIFIED   QUALIFIED
 │               │
 ▼               ▼
Knockout       [ Personalized MCQ Generator ]
Rejection         │  (Exactly 10 Candidate + Job MCQs)
                  ▼
               [ Assessment Engine ]
                  │  (30s visual countdown & server validation)
                  ▼
               Passed Assessment (≥60%)
                  │
                  ▼
               [ Adaptive AI Voice/Text Interview ]
                  │
                  ▼
               [ Final Candidate Evaluator ]
                  │  (CV 40% + MCQ 25% + Interview 35%)
                  ▼
               [ Supabase PostgreSQL Storage ]
                  │
                  ▼
               Recruiter Workspace Scorecard
```
