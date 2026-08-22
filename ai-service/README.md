# AI-Recruit360 — Python AI Service (FastAPI Engine)

The **AI-Recruit360 Python AI Service** is a high-performance FastAPI microservice responsible for the core artificial intelligence intelligence layer of AI-Recruit360.

---

## 1. Core Architecture

```text
                  Next.js Frontend (Port 3000)
                             │
                             │ HTTPS / REST
                             ▼
                 FastAPI AI Engine (Port 8000)
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
Document Extractor     Multi-Agent CV       Personalized MCQ
(PDF/DOCX/TXT)           Screening               Engine
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
                     Supabase PostgreSQL
```

---

## 2. API Endpoints

### Health Check
- `GET /api/v1/health`

### CV Screening & Document Processing
- `POST /api/v1/screening/analyze-job`
- `POST /api/v1/screening/screen-application`
- `POST /api/v1/screening/extract-cv`

### Personalized MCQ Engine
- `POST /api/v1/assessments/generate`
- `POST /api/v1/assessments/submit-answer`
- `POST /api/v1/assessments/finalize`

### Adaptive AI Interview
- `POST /api/v1/interviews/initialize`
- `POST /api/v1/interviews/next-question`
- `POST /api/v1/interviews/evaluate-response`

### Final Candidate Evaluation
- `POST /api/v1/evaluations/generate`

---

## 3. Quick Start (Independent Execution)

```bash
cd ai-service

# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment settings
cp .env.example .env

# 5. Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```

FastAPI interactive documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
