"""
build_defense_guide_pdf.py
Generates the comprehensive, beautifully styled FYP Defense Master Guide as both DOCX and PDF:
- AI-Recruit360-FYP-Defense-Master-Guide.docx
- AI-Recruit360-FYP-Defense-Master-Guide.pdf
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import os
import win32com.client

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_table_borders(table, color="C0C7D0", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    for b in tblPr.findall(qn('w:tblBorders')):
        tblPr.remove(b)
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_defense_guide():
    doc = docx.Document()
    
    # Page setup
    sec = doc.sections[0]
    sec.page_width = Inches(8.27) # A4
    sec.page_height = Inches(11.69)
    sec.left_margin = Inches(1.0)
    sec.right_margin = Inches(1.0)
    sec.top_margin = Inches(1.0)
    sec.bottom_margin = Inches(1.0)

    # Styles helper
    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(22)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(16)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.bold = False
        r.font.color.rgb = RGBColor(71, 85, 105) # Slate 600
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Arial"
            r_pre.font.size = Pt(10)
            r_pre.font.bold = True
            r_pre.font.color.rgb = RGBColor(15, 23, 42)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_callout(title, text, color_hex="F1F5F9", border_color="3B82F6"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        c = tbl.rows[0].cells[0]
        c.width = Inches(6.27)
        set_cell_margins(c, top=80, bottom=80, left=120, right=120)
        set_cell_shading(c, color_hex)
        tcPr = c._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'  <w:top w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'  <w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        p = c.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"{title}: ")
        r_title.font.name = "Arial"
        r_title.font.size = Pt(10)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(15, 23, 42)
        r_txt = p.add_run(text)
        r_txt.font.name = "Arial"
        r_txt.font.size = Pt(9.5)
        r_txt.font.color.rgb = RGBColor(30, 41, 59)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ── HEADER & TITLE ────────────────────────────────────────────────────────
    add_title("AI RECRUIT360: FYP DEFENSE MASTER GUIDE")
    add_subtitle("Comprehensive Technical Architecture, Code Mapping & External Examiner Q&A Handbook\nDepartment of Software Engineering | Mirpur University of Science and Technology (MUST)")

    add_callout(
        "HOW TO USE THIS HANDBOOK",
        "This guide gives you 100% mastery over your project architecture, algorithms, database operations, and code locations. "
        "When an examiner asks a challenging question, stay calm, reference the architectural design decisions outlined below, "
        "and cite the exact files and lines of code. This demonstrates that your system is rigorously engineered, highly defensible, and fully understood.",
        color_hex="EFF6FF", border_color="2563EB"
    )

    # ── SECTION 1: HIGH LEVEL ARCHITECTURE ────────────────────────────────────
    add_h1("1. High-Level Architectural Flow & Technology Stack")
    add_p("AI Recruit360 is a cloud-native, multi-tenant automated talent acquisition platform structured across three decoupled layers:")
    add_p("• Frontend Layer: Next.js 14 (App Router, React Server Components, TypeScript, Tailwind CSS) deployed on Vercel Edge.")
    add_p("• AI Microservice Layer: Python 3.12 with FastAPI (Asynchronous ASGI runtime, Uvicorn, Pydantic v2 validation) containerized with Docker.")
    add_p("• Database & Storage Layer: Supabase Cloud (Managed PostgreSQL 15, PgBouncer connection pooler on port 6543, S3-compatible Object Storage) hosted in AWS Frankfurt (eu-central-1).")
    add_p("• Multimodal AI Foundations: OpenAI GPT-4o-mini (Screening & Rubrics), OpenAI Whisper-1 (Speech-to-Text), OpenAI TTS Nova (Text-to-Speech), and Simli (Real-Time WebRTC Neural Video Avatar).")

    # Architecture summary table
    table_stack = doc.add_table(rows=5, cols=4)
    table_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_stack)
    headers = ["Component", "Technology / Service", "Primary Role", "Code Location"]
    for i, h in enumerate(headers):
        cell = table_stack.rows[0].cells[i]
        cell.text = h
        set_cell_shading(cell, "1E3A8A")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    stack_data = [
        ("Web Portal & Server Actions", "Next.js 14, TypeScript", "SSR, Auth Cookies, Job/Applicant UI, Candidate Examination Portals", "frontend/"),
        ("AI Microservice Engine", "FastAPI, Python 3.12", "CV Parsing, Prompt Engineering, Structured LLM Scoring, Interview Evaluation", "ai-service/"),
        ("Relational Database", "PostgreSQL 15 on Supabase", "3NF Schema, Row Level Security (RLS), ACID transactions, Audit Logs", "supabase/migrations/"),
        ("Object Storage", "Supabase Storage", "Private encrypted bucket (candidate_documents) for uploaded PDF/DOCX resumes", "candidate_documents bucket")
    ]

    for r_idx, row_vals in enumerate(stack_data):
        row = table_stack.rows[r_idx + 1]
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            cell.text = val
            set_cell_shading(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ── SECTION 2: CV EXTRACTION & RESUME SCREENING ────────────────────────────
    add_h1("2. Resume Extraction, Storage, and AI Screening Mechanics")
    
    add_h2("Q1: Exactly how is the resume extracted from uploaded files?")
    add_p("The document extraction is handled by an asynchronous multi-tiered parsing engine located in:", bold_prefix="Exact Code Path: ")
    add_p("ai-service/app/services/cv/extractor.py (functions: extract_text_from_bytes, extract_text_from_pdf, extract_text_from_docx)")
    add_p("• PDF Parsing: Uses PyMuPDF (fitz) to open the document stream directly from memory buffer (io.BytesIO). PyMuPDF maintains the logical reading order even in complex two-column resume templates. If PyMuPDF encounters a corrupt stream, it falls back to pypdf. If fewer than 50 characters are detected (indicating a scanned image), it triggers Tesseract OCR fallback.")
    add_p("• DOCX Parsing: Uses python-docx via iter_inner_content(). Crucially, because modern resume templates place work history and technical skills inside invisible table cells, our parser iterates through BOTH standard paragraphs and table rows/cells, joining text with ' | ' delimiters to ensure zero data loss.")
    add_p("• Text Sanitization: Strips non-printable binary artifacts, normalizes Unicode whitespace, and truncates to 24,000 tokens to fit safely within the LLM context window.")

    add_h2("Q2: Where is the resume saved? In the database or storage?")
    add_p("We follow cloud software architecture best practices by separating BLOB (Binary Large Object) storage from relational metadata:", bold_prefix="Software Architecture Answer: ")
    add_p("1. The binary file (PDF/DOCX) is uploaded to Supabase Storage in the private bucket 'candidate_documents' under a secure path [application_id]/[file_name]. It is never stored directly inside a PostgreSQL table to prevent database bloating.")
    add_p("2. The database stores the pointer and extracted text in the candidate_documents table: id (UUID), application_id (FK), file_name (TEXT), storage_path (TEXT), file_type (MIME type), and extracted_text (sanitized text stream).")
    add_p("Code Reference: frontend/app/actions/applications.ts (submitApplication) and ai-service/app/repositories/application_repo.py (get_candidate_cv_data).")

    add_h2("Q3 (THE BIG QUESTION): Are you using embeddings for CV-Job comparison? Which Vector DB?")
    add_callout(
        "CRUCIAL EXAMINER TRAP & WINNING DEFENSE",
        "Many examiners expect students to say 'we used LangChain, embeddings, and Pinecone'. "
        "Here is why you should proudly state you DELIBERATELY avoided pure vector embeddings for candidate screening, "
        "and why your approach is significantly more sophisticated, accurate, and defensible:",
        color_hex="FEF3C7", border_color="D97706"
    )
    add_p("Say this with confidence:", bold_prefix="Exact Defense Answer to External Examiner: ")
    add_p("\"Sir/Madam, we deliberately chose NOT to rely on vector embeddings and cosine similarity for resume screening, and here is the exact software engineering and mathematical justification:\"")
    add_p("1. The Fatal Flaw of Vector Embeddings in Recruitment: Vector embeddings (like text-embedding-3 or SentenceTransformers) compress an entire document into a single high-dimensional point in mathematical space. Comparing a resume and job description using cosine similarity only measures vocabulary overlap. For example, if a job requires '5+ years Python, AWS, and PostgreSQL; NO PHP', a candidate with '5 years PHP, 1 year Python' will score a 0.85+ cosine similarity simply because both documents contain web engineering terms. Vector distance cannot enforce boolean prerequisites, cannot evaluate years of seniority, and cannot verify authentic competence.")
    add_p("2. Complete Lack of Explainability: Cosine distance returns a single opaque float (e.g., 0.78). It cannot explain WHY the candidate scored 0.78, cannot cite what skills are missing, and cannot provide legal auditability required by modern employment regulations (such as the EU AI Act).")
    add_p("3. Our Superior Solution — Direct Deep Reasoning with Strict Pydantic Schema Enforcement: Instead of an opaque vector distance, our pipeline (ai-service/app/services/screening/orchestrator.py) passes both the full job requisition and the candidate's sanitized CV text into OpenAI GPT-4o-mini using strict JSON Schema Enforcement (Pydantic v2 ScreeningDecisionResult). The model performs true multi-dimensional causal evaluation across four criteria:")
    add_p("   • Technical Skill Alignment (40% weight): Validates programming languages, libraries, and frameworks.")
    add_p("   • Experience Level & Seniority (30% weight): Verifies years of professional tenure and project scope.")
    add_p("   • Educational & Foundational Background (15% weight): Validates degrees and certifications.")
    add_p("   • Soft Skills & Articulation (15% weight): Analyzes communication clarity and leadership.")
    add_p("4. Verifiable Text Evidence: The model is forced to return exact quoted excerpts from the candidate's resume proving where each skill was exhibited. This gives recruiters complete auditability with zero black-box obscurity.")
    add_p("5. Vector DB Role: If asked about Vector DBs, mention: 'Supabase PostgreSQL has native pgvector support installed. While pgvector is suitable for coarse semantic search across 100,000+ candidate archives in large databases (Phase 2), for precise evaluation of an applicant against a published requisition, structured LLM reasoning with schema enforcement is demonstrably superior.'")

    # ── SECTION 3: DATABASE ARCHITECTURE & ACCESS ──────────────────────────────
    add_h1("3. Database Architecture, Multi-Tenancy & Data Access")
    
    add_h2("Q4: Where is the database hosted, and how is it accessed from Frontend and Backend?")
    add_p("• Physical Location: Supabase Cloud running PostgreSQL 15, deployed in the AWS Frankfurt (eu-central-1) region.")
    add_p("• Connection Management: The platform uses PgBouncer connection pooling on port 6543 to manage concurrent database transactions without exhausting PostgreSQL thread pools.")
    add_p("• Frontend Access (Next.js 14): Next.js interacts with Supabase using @supabase/ssr inside Server Components and Server Actions (frontend/lib/supabase/server.ts). It passes the user's session JWT token stored in secure, HttpOnly, SameSite cookies. Row-Level Security (RLS) policies are automatically enforced.")
    add_p("• Backend Access (FastAPI): The AI microservice accesses Supabase via the official supabase-py SDK (ai-service/app/db/supabase.py). Because supabase-py is synchronous internally, we implemented an asynchronous wrapper run_sync() using asyncio.to_thread() to ensure database I/O calls never block the FastAPI event loop.")

    add_h2("Q5: How is multi-tenancy and data security enforced?")
    add_p("• Kernel-Level Row Level Security (RLS): Multi-tenancy is NOT handled in application code with fragile 'WHERE org_id = ...' clauses. Instead, it is enforced directly within the PostgreSQL kernel via Row-Level Security policies. Every table has an organization_id column, and RLS policies verify that auth.uid() exists in the organization_members table with active permissions.")
    add_p("• Role-Based Access Control (RBAC): The organization_members table enforces 5 distinct roles: Owner, Admin, Recruiter, Interviewer, and Viewer. If an Interviewer or Viewer attempts to mutate a job or delete records, PostgreSQL immediately raises an HTTP 403 Forbidden.")
    add_p("• Audit Trail: All security-critical actions (candidate status overrides, deletions, role updates) are recorded in the security_audit_logs table with actor UUID, IP address, and timestamp.")

    # ── SECTION 4: ANTI-CHEAT ASSESSMENT & AI INTERVIEW ───────────────────────
    add_h1("4. Anti-Cheat Assessment & Real-Time AI Avatar Interview")

    add_h2("Q6: How does the Server-Authoritative Anti-Cheat Assessment work?")
    add_p("Commercial testing tools often rely on client-side JavaScript timers (setInterval), which candidates can pause by freezing the browser DOM or modifying localStorage. AI Recruit360 eliminates this vulnerability completely:", bold_prefix="Anti-Cheat Architecture: ")
    add_p("1. Dynamic Question Generation: When an assessment starts, OpenAI GPT-4o-mini generates 10 unique, non-trivial multiple choice questions customized to the job requisition (ai-service/app/services/assessment/generator.py).")
    add_p("2. Server-Authoritative Clock: When Question N is served to the candidate, the server records started_at = NOW() in the PostgreSQL database.")
    add_p("3. Strict Server-Side Validation: When the candidate submits an answer, the server computes (submission_time - started_at). If the duration exceeds 50 seconds (45s window + 5s network grace), the answer is automatically invalidated with 0 marks.")
    add_p("4. State Immutability: Once submitted, the answer is permanently recorded in the assessment_answers table with correct_index comparison. The candidate cannot go back, retry, or tamper with previous answers.")

    add_h2("Q7: How does the AI Avatar Interview work? What models and protocols are used?")
    add_p("The interview room (frontend/app/interview-room/[application-id]/page.tsx) synchronizes a real-time, low-latency multimodal pipeline across four technologies:")
    add_p("• Video Avatar Gateway: Simli WebRTC streaming API. Simli receives synthetic audio streams from our backend and renders a lip-synchronized, 720p 30fps photo-realistic neural video avatar directly in the candidate's browser viewport.")
    add_p("• Neural Voice Synthesis (TTS): OpenAI TTS-1 (voice: nova) generates natural human prosody with conversational breathing and pacing (ai-service/app/services/interview/tts.py).")
    add_p("• Speech Recognition (STT): The candidate's audio is captured via the browser MediaStream API at 16kHz mono PCM and streamed to OpenAI Whisper (whisper-1) over secure WebSockets (ai-service/app/services/interview/stt.py).")
    add_p("• Candidate Verification & Accessibility: A live transcript appears in the candidate's review panel. The candidate can verify or edit technical terms before submitting. If the candidate has no microphone, the system provides a seamless 'Text Mode' fallback (WCAG 2.1 AA compliance).")
    add_p("• Rubric Scoring: Submitted answers are evaluated by OpenAI GPT-4o-mini against a 4-dimensional rubric: Technical Correctness (40%), Completeness (30%), Depth of Explanation (20%), and Articulation (10%). Results are stored in interview_responses.")

    # ── SECTION 5: COMPOSITE EVALUATION & HUMAN-IN-THE-LOOP ───────────────────
    add_h1("5. Multi-Stage Composite Evaluation & Human-in-the-Loop")

    add_h2("Q8: How is the final hiring decision made? Does AI make the final hire/reject decision?")
    add_p("NO. AI Recruit360 is strictly designed as an Evidence-Based Decision Support System, adhering to international ethical AI standards (such as the EU AI Act).", bold_prefix="Ethical Design Mandate: ")
    add_p("• Composite Formula: The system calculates a weighted composite score across all three evaluation tiers:")
    add_p("  Composite Score = (0.30 * Resume Match) + (0.30 * Assessment Score) + (0.40 * Interview Score)")
    add_p("• Stored in Database: Persisted in final_evaluations alongside sub-scores and qualitative rationales.")
    add_p("• Human-in-the-Loop Oversight: The AI produces an advisory recommendation ('Strong Hire', 'Hire', 'Review', 'Reject'). The platform is programmatically prohibited from executing automated candidate rejections. The human recruiter reviews the candidate dossier (resume quotes, MCQ timestamps, interview transcripts) and retains 100% final hiring authority.")

    # ── SECTION 6: CODE REPOSITORY MAP ─────────────────────────────────────────
    add_h1("6. Comprehensive File and Code Repository Map")
    add_p("Use this exact directory index to quickly locate any functionality in your codebase during the defense:")

    code_map_table = doc.add_table(rows=11, cols=3)
    code_map_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(code_map_table)
    
    headers_cm = ["Functional Area", "Primary Code Files", "Key Methods / Classes"]
    for i, h in enumerate(headers_cm):
        cell = code_map_table.rows[0].cells[i]
        cell.text = h
        set_cell_shading(cell, "1E3A8A")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

    code_data = [
        ("Resume Text Extraction", "ai-service/app/services/cv/extractor.py", "extract_text_from_bytes(), extract_text_from_pdf(), extract_text_from_docx()"),
        ("AI Resume Screening", "ai-service/app/services/screening/orchestrator.py", "run_screening_pipeline(), ScreeningDecisionResult Pydantic schema"),
        ("Assessment Generation", "ai-service/app/services/assessment/generator.py", "generate_assessment_questions(), AssessmentQuestion schema"),
        ("Assessment Scoring", "ai-service/app/services/assessment/scorer.py", "score_assessment(), server-authoritative timestamp verification"),
        ("Interview Speech (TTS)", "ai-service/app/services/interview/tts.py", "generate_speech_audio() with OpenAI TTS-1 (nova)"),
        ("Interview Speech (STT)", "ai-service/app/services/interview/stt.py", "transcribe_audio_stream() with OpenAI Whisper (whisper-1)"),
        ("Interview Rubric Evaluation", "ai-service/app/services/interview/response_evaluator.py", "evaluate_candidate_response() with 4-dimensional rubric"),
        ("Composite Scoring", "ai-service/app/services/evaluation/evaluator.py", "calculate_composite_score() [30% CV + 30% Test + 40% Voice]"),
        ("Database Client & Pooler", "ai-service/app/db/supabase.py", "get_supabase_client(), run_sync() (async thread pool wrapper)"),
        ("Application Actions & UI", "frontend/app/actions/applications.ts\nfrontend/lib/services/application-service.ts", "submitApplication(), getApplicationDetails(), triageCandidate()")
    ]

    for r_idx, (area, files, methods) in enumerate(code_data):
        row = code_map_table.rows[r_idx + 1]
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([area, files, methods]):
            cell = row.cells[c_idx]
            cell.text = val
            set_cell_shading(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ── SECTION 7: TOP 10 EXAMINER QUESTIONS & WINNING ANSWERS ────────────────
    add_h1("7. Top 10 Rapid-Fire Examiner Defense Questions & Answers")

    qa_list = [
        ("Examiner: Why did you use Next.js 14 and FastAPI instead of a single Django or Node.js monolithic app?",
         "Answer: Separation of concerns. Next.js 14 Excel in Server-Side Rendering (SSR), edge routing, and responsive frontend UI, while Python FastAPI is the industry standard for asynchronous machine learning orchestration, PyMuPDF document parsing, and AI model streaming. Coupling them via lightweight RESTful endpoints ensures decoupled scaling and independent deployments."),

        ("Examiner: What happens if the network drops while a candidate is uploading their 9 MB resume?",
         "Answer: The upload process is protected by database idempotency and multi-part upload recovery. If an interruption occurs, the candidate's draft application record remains in 'applied' status without corrupting the database. When the candidate retries, the backend detects the existing (job_id, email) record and resumes the session without duplicate rows."),

        ("Examiner: How do you prevent candidates from cheating during the technical assessment?",
         "Answer: We use a multi-layered approach: (1) Dynamic Question Generation ensures each requisition has customized, non-static questions. (2) Server-Authoritative Timing: Timers are enforced on the PostgreSQL database server (started_at timestamp), not in client JavaScript. If submitted after 50s, it receives 0 marks. (3) Irreversible submission: Once answered, results are immutably written to assessment_answers."),

        ("Examiner: Can an AI model hallucinate candidate skills during screening?",
         "Answer: Yes, LLMs can hallucinate if unconstrained. To eliminate this risk, our screening engine uses Pydantic v2 schemas and prompt-level constraint engineering that forces the model to cite verbatim source quotes from the resume for every claimed skill match. If no quote exists, the skill match is rejected. Furthermore, structured retries are performed at low temperature (0.1)."),

        ("Examiner: How do you handle candidates with regional accents or speech impediments during the avatar interview?",
         "Answer: We implement three accessibility safeguards: (1) OpenAI Whisper foundation model handles diverse global accents with low Word Error Rates (<8%). (2) Candidates see a real-time review panel where they can manually edit or correct any misrecognized technical terminology before final submission. (3) WCAG 2.1 AA compliant Text Input Mode allows typing answers if audio input is unavailable."),

        ("Examiner: Why did you choose Supabase instead of self-hosted PostgreSQL?",
         "Answer: Supabase provides an enterprise-grade managed PostgreSQL 15 environment with integrated Row-Level Security (RLS), real-time WebSockets, automated Write-Ahead Logging (WAL) daily backups, and built-in PgBouncer connection pooling, reducing DevOps overhead while guaranteeing enterprise-grade ACID reliability."),

        ("Examiner: What is the computational cost of running this platform?",
         "Answer: As demonstrated in our Chapter 7 economic analysis, fixed baseline infrastructure (Vercel Pro, Render Standard, Supabase Pro) costs ~$71/month. The variable cost per candidate across the full 3-stage funnel (CV screening + 10 MCQs + 5 avatar interview questions) is only $0.151 USD, representing a 97% cost reduction compared to traditional recruitment agency fees."),

        ("Examiner: What are the United Nations SDGs mapped to this project?",
         "Answer: AI Recruit360 directly addresses five UN Sustainable Development Goals: SDG 8 (Decent Work & Economic Growth via objective competency hiring), SDG 9 (Industry, Innovation & Infrastructure via modern multimodal architecture), SDG 10 (Reduced Inequalities by stripping demographic PII during initial screening), SDG 16 (Peace, Justice & Strong Institutions via immutable audit logs), and SDG 4 (Quality Education by validating technical competencies)."),

        ("Examiner: How does your composite evaluation weight different stages?",
         "Answer: We utilize a research-backed weighted formula: 30% Resume Match (document qualifications), 30% Server-Timed Technical Assessment (objective problem solving), and 40% Conversational Interview (depth of explanation, technical articulation, and problem breakdown)."),

        ("Examiner: What is the main future enhancement planned for AI Recruit360?",
         "Answer: Implementing self-hosted open-weight LLMs (Llama 3 8B / Mistral 7B) using vLLM for completely air-gapped enterprise deployments, adding containerized WebAssembly coding sandboxes (Pyodide) for live in-browser coding tests, and supporting multilingual interviewing in Urdu and Arabic.")
    ]

    for q, a in qa_list:
        add_h2(q)
        add_p(a)

    # Save DOCX
    docx_path = os.path.abspath("AI-Recruit360-FYP-Defense-Master-Guide.docx")
    pdf_path = os.path.abspath("AI-Recruit360-FYP-Defense-Master-Guide.pdf")
    
    print(f"Saving DOCX to {docx_path}...")
    doc.save(docx_path)
    print("DOCX successfully saved!")

    # Export to PDF via Word COM
    print(f"Exporting to PDF via Word COM: {pdf_path}...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    try:
        doc_w = word.Documents.Open(docx_path, ConfirmConversions=False, ReadOnly=False, AddToRecentFiles=False)
        # 17 = wdFormatPDF
        doc_w.SaveAs(pdf_path, FileFormat=17)
        doc_w.Close(False)
        print(f"PDF successfully exported to {pdf_path}!")
    except Exception as e:
        print(f"Error exporting PDF: {e}")
    finally:
        word.Quit()

if __name__ == "__main__":
    build_defense_guide()
