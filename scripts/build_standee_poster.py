"""
build_standee_poster.py
Generates the official 2:5 aspect ratio standee poster for AI Recruit360 for OpenHouse 2026.
Dimensions: 20.0 inches x 50.0 inches (Exact 2:5 aspect ratio, standard roll-up standee banner).
Exports:
1. Standee-Poster-FYP.pptx (Editable Master Vector PowerPoint Standee)
2. Standee-Poster-FYP.pdf  (High-Resolution Print-Ready Vector PDF via PowerPoint COM)
3. Standee-Poster-FYP.png  (Ultra-High-Resolution 2400x6000 px raster image)
"""

import os
import sys
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import win32com.client

ROOT_DIR = Path(__file__).parent.parent
TARGET_PPTX = ROOT_DIR / "Standee-Poster-FYP.pptx"
TARGET_PDF = ROOT_DIR / "Standee-Poster-FYP.pdf"
TARGET_PNG = ROOT_DIR / "Standee-Poster-FYP.png"

ART_DIR = ROOT_DIR / ".artifacts" / "thesis"
SCREENS_DIR = ROOT_DIR / "website_screenshots"
BRAND_DIR = ROOT_DIR / "frontend" / "public" / "brand"

# Color Palette: Modern Tech Navy & Vibrant Accents
BG_DARK = RGBColor(10, 15, 29)          # #0A0F1D Deep Navy/Slate
CARD_BG = RGBColor(19, 29, 53)          # #131D35 Dark Surface Card
CARD_BG_ALT = RGBColor(14, 22, 40)      # #0E1628 Darker Card
CARD_BORDER = RGBColor(37, 56, 96)      # #253860 Subtle Blue Border
ACCENT_CYAN = RGBColor(56, 189, 248)    # #38BDF8 Sky Cyan
ACCENT_CORAL = RGBColor(255, 107, 107)  # #FF6B6B Warm Rose/Coral
ACCENT_EMERALD = RGBColor(52, 211, 153) # #34D399 Vibrant Green
ACCENT_AMBER = RGBColor(251, 191, 36)   # #FBBF24 Warm Gold
TEXT_WHITE = RGBColor(255, 255, 255)    # #FFFFFF Pure White
TEXT_OFFWHITE = RGBColor(241, 245, 249) # #F1F5F9 Cool White
TEXT_MUTED = RGBColor(148, 163, 184)    # #94A3B8 Cool Gray

# 2:5 Aspect Ratio Dimensions: 20.0" x 50.0"
SLIDE_WIDTH = Inches(20.0)
SLIDE_HEIGHT = Inches(50.0)

prs = Presentation()
prs.slide_width = SLIDE_WIDTH
prs.slide_height = SLIDE_HEIGHT
blank_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_layout)

# 1. Full Page Background
bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
bg.fill.solid()
bg.fill.fore_color.rgb = BG_DARK
bg.line.fill.background()

def add_card(s, left, top, width, height, bg_col=CARD_BG, border_col=CARD_BORDER, border_width=1.0):
    shape = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_col
    if border_col:
        shape.line.color.rgb = border_col
        shape.line.width = Pt(border_width)
    else:
        shape.line.fill.background()
    return shape

def add_pill_badge(s, left, top, width, height, text, bg_col, text_col=TEXT_WHITE, font_size=11.5):
    badge = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    badge.fill.solid()
    badge.fill.fore_color.rgb = bg_col
    badge.line.fill.background()
    tf = badge.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = text
    p.alignment = PP_ALIGN.CENTER
    p.font.name = 'Arial'
    p.font.size = Pt(font_size)
    p.font.bold = True
    p.font.color.rgb = text_col
    return badge

# ==========================================
# ZONE 1: ACADEMIC & INSTITUTIONAL HEADER (0.4" - 4.4")
# ==========================================
header_bg = add_card(slide, 0.7, 0.4, 18.6, 4.0, bg_col=CARD_BG, border_col=ACCENT_CYAN, border_width=1.5)

# MUST Crest Logo
crest_img = ART_DIR / "university-logo.png"
if crest_img.exists():
    slide.shapes.add_picture(str(crest_img), Inches(1.0), Inches(0.7), width=Inches(2.5))

# Header Text Frame
tb_hdr = slide.shapes.add_textbox(Inches(3.8), Inches(0.55), Inches(15.2), Inches(3.7))
tf_hdr = tb_hdr.text_frame
tf_hdr.word_wrap = True

p_dept = tf_hdr.paragraphs[0]
p_dept.text = "DEPARTMENT OF SOFTWARE ENGINEERING"
p_dept.font.name = 'Arial'
p_dept.font.size = Pt(22)
p_dept.font.bold = True
p_dept.font.color.rgb = ACCENT_CYAN

p_fac = tf_hdr.add_paragraph()
p_fac.text = "Faculty of Engineering & Technology"
p_fac.font.name = 'Calibri'
p_fac.font.size = Pt(14.5)
p_fac.font.color.rgb = TEXT_OFFWHITE

p_uni = tf_hdr.add_paragraph()
p_uni.text = "MIRPUR UNIVERSITY OF SCIENCE AND TECHNOLOGY (MUST), MIRPUR AJK"
p_uni.font.name = 'Arial'
p_uni.font.size = Pt(15.5)
p_uni.font.bold = True
p_uni.font.color.rgb = ACCENT_AMBER
p_uni.space_after = Pt(6)

p_event = tf_hdr.add_paragraph()
p_event.text = "★ ANNUAL FINAL YEAR PROJECT OPEN HOUSE & INDUSTRIAL EXHIBITION 2026 ★"
p_event.font.name = 'Arial'
p_event.font.size = Pt(12.5)
p_event.font.bold = True
p_event.font.color.rgb = ACCENT_CORAL

# ==========================================
# ZONE 2: PROJECT TITLE, MISSION & VALUE PROPS (4.6" - 11.2")
# ==========================================
hero_card = add_card(slide, 0.7, 4.6, 18.6, 6.4, bg_col=CARD_BG, border_col=CARD_BORDER, border_width=1.0)

# Brand Logo Emblem
brand_img = BRAND_DIR / "logo.png"
if brand_img.exists():
    slide.shapes.add_picture(str(brand_img), Inches(1.0), Inches(4.8), height=Inches(0.95))

tb_title = slide.shapes.add_textbox(Inches(1.0), Inches(5.85), Inches(18.0), Inches(1.8))
tf_title = tb_title.text_frame
tf_title.word_wrap = True

p_t1 = tf_title.paragraphs[0]
p_t1.text = "AI-Assisted Recruitment & Candidate Evaluation System"
p_t1.font.name = 'Arial'
p_t1.font.size = Pt(25)
p_t1.font.bold = True
p_t1.font.color.rgb = ACCENT_CORAL

p_t2 = tf_title.add_paragraph()
p_t2.text = "Autonomous, Server-Authoritative Multi-Stage Evaluation Powered by WebRTC & Generative AI"
p_t2.font.name = 'Calibri'
p_t2.font.size = Pt(14)
p_t2.font.bold = True
p_t2.font.color.rgb = TEXT_MUTED

# Goal Card inside Hero
goal_card = add_card(slide, 1.0, 7.5, 18.0, 2.4, bg_col=CARD_BG_ALT, border_col=ACCENT_CYAN, border_width=1.0)
tb_goal = slide.shapes.add_textbox(Inches(1.2), Inches(7.6), Inches(17.6), Inches(2.2))
tf_goal = tb_goal.text_frame
tf_goal.word_wrap = True

p_gh = tf_goal.paragraphs[0]
p_gh.text = "🎯 PROJECT CORE GOAL & INDUSTRIAL MISSION:"
p_gh.font.name = 'Arial'
p_gh.font.size = Pt(12.5)
p_gh.font.bold = True
p_gh.font.color.rgb = ACCENT_CYAN
p_gh.space_after = Pt(3)

p_gb = tf_goal.add_paragraph()
p_gb.text = "To solve the corporate 500+ applicant hiring bottleneck by replacing superficial keyword filtering with an autonomous, server-authoritative 3-stage candidate evaluation pipeline. The platform unites deterministic in-memory resume parsing, tamper-proof timed skills testing, and real-time conversational WebRTC avatar interviews to slash recruitment costs by 90.2% and accelerate time-to-hire by 78% with zero human bias."
p_gb.font.name = 'Calibri'
p_gb.font.size = Pt(12)
p_gb.font.color.rgb = TEXT_WHITE

# 3 Highlight Pills
add_pill_badge(slide, 1.0, 10.15, 5.7, 0.65, "⚡ 90.2% COST REDUCTION", RGBColor(28, 44, 76), ACCENT_CYAN, font_size=11.5)
add_pill_badge(slide, 7.15, 10.15, 5.7, 0.65, "🗣️ SUB-1.5s WebRTC AVATAR", RGBColor(40, 24, 36), ACCENT_CORAL, font_size=11.5)
add_pill_badge(slide, 13.3, 10.15, 5.7, 0.65, "🛡️ SERVER ANTI-CHEAT LOCKS", RGBColor(20, 44, 36), ACCENT_EMERALD, font_size=11.5)

# ==========================================
# ZONE 3: INDUSTRY PROBLEM VS RECRUIT360 (11.2" - 16.7")
# ==========================================
# Left Card: Industry Problem
prob_card = add_card(slide, 0.7, 11.2, 9.1, 5.3, bg_col=CARD_BG, border_col=RGBColor(239, 68, 68), border_width=1.0)
tb_p = slide.shapes.add_textbox(Inches(0.9), Inches(11.35), Inches(8.7), Inches(5.0))
tf_p = tb_p.text_frame
tf_p.word_wrap = True

pp_h = tf_p.paragraphs[0]
pp_h.text = "⚠️ THE INDUSTRY BOTTLENECK (LEGACY ATS)"
pp_h.font.name = 'Arial'
pp_h.font.size = Pt(13)
pp_h.font.bold = True
pp_h.font.color.rgb = RGBColor(239, 68, 68)
pp_h.space_after = Pt(6)

prob_items = [
    ("500+ Applicants per Requisition", "Overwhelmed recruiters spend < 7 seconds per CV, triggering severe decision fatigue and talent misplacement."),
    ("Superficial Keyword Scanning", "Legacy ATS ranks resumes by raw keyword counts, rewarding keyword-stuffing hacks rather than genuine competency."),
    ("Widespread Assessment Cheating", "Client-side timers and unmonitored browser tests invite rampant cheating and proxy candidate exam fraud."),
    ("Impersonal Asynchronous Video", "One-way webcam monologues cause 60%+ candidate drop-off and lack dynamic conversational follow-up questions."),
    ("Subjective Unconscious Bias", "Inconsistent human review allows demographic, gender, and pedigree biases to distort candidate evaluations.")
]
for title, desc in prob_items:
    p = tf_p.add_paragraph()
    p.text = f"• {title}: "
    p.font.name = 'Arial'
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = TEXT_OFFWHITE
    run = p.add_run()
    run.text = desc
    run.font.name = 'Calibri'
    run.font.bold = False
    run.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(3)

# Right Card: Recruit360 Solution
sol_card = add_card(slide, 10.2, 11.2, 9.1, 5.3, bg_col=CARD_BG, border_col=ACCENT_EMERALD, border_width=1.0)
tb_s = slide.shapes.add_textbox(Inches(10.4), Inches(11.35), Inches(8.7), Inches(5.0))
tf_s = tb_s.text_frame
tf_s.word_wrap = True

ps_h = tf_s.paragraphs[0]
ps_h.text = "✅ THE RECRUIT360 SOLUTION (MODERN AI)"
ps_h.font.name = 'Arial'
ps_h.font.size = Pt(13)
ps_h.font.bold = True
ps_h.font.color.rgb = ACCENT_EMERALD
ps_h.space_after = Pt(6)

sol_items = [
    ("In-Memory Stream Parsing (380ms)", "PDF/DOCX resumes parsed dynamically with strict Pydantic JSON schemas, eliminating AI hallucination."),
    ("Server-Authoritative Anti-Cheat", "PostgreSQL database expires_at locks + DOM telemetry track window blur, tab switching, and paste events."),
    ("Live Conversational AI Avatar", "Simli WebRTC video avatar + Deepgram streaming STT (240ms) creates lifelike, real-time two-way dialogue."),
    ("Multi-Dimensional Composite Triage", "Mathematically grounded 30/30/40 scoring algorithm provides transparent, auditable recruiter decision support."),
    ("Demographic Shielding & Dignity", "Automated redaction of photos and personal identifiers guarantees objective merit-based hiring.")
]
for title, desc in sol_items:
    p = tf_s.add_paragraph()
    p.text = f"• {title}: "
    p.font.name = 'Arial'
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = TEXT_OFFWHITE
    run = p.add_run()
    run.text = desc
    run.font.name = 'Calibri'
    run.font.bold = False
    run.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(3)

# ==========================================
# ZONE 4: 3-STAGE PIPELINE & COMPOSITE SCORING (16.7" - 26.3")
# ==========================================
pipe_card = add_card(slide, 0.7, 16.7, 18.6, 9.4, bg_col=CARD_BG, border_col=ACCENT_CYAN, border_width=1.0)

tb_pipe_title = slide.shapes.add_textbox(Inches(1.0), Inches(16.85), Inches(18.0), Inches(0.6))
tf_pt = tb_pipe_title.text_frame
p_pt = tf_pt.paragraphs[0]
p_pt.text = "CORE ENGINEERING: THREE-STAGE EVALUATION PIPELINE"
p_pt.font.name = 'Arial'
p_pt.font.size = Pt(14)
p_pt.font.bold = True
p_pt.font.color.rgb = ACCENT_CYAN

# 3 Stage Columns
stages = [
    ("STAGE 1: CV SCREENING", "WEIGHT: 30%", ACCENT_CYAN, 1.0, [
        ("In-Memory Extraction", "Parses raw PDF/DOCX byte streams in 380ms with zero disk writes."),
        ("Pydantic Schema Lock", "Enforces rigid JSON typing: score, skills, strengths, and weaknesses."),
        ("Semantic Matching", "Evaluates contextual project accomplishments over keyword counts."),
        ("Deterministic Output", "Guaranteed zero hallucination in recruiter scorecard generation."),
        ("Warm SLA Benchmark", "2.14s end-to-end inference latency.")
    ]),
    ("STAGE 2: SKILLS ASSESSMENT", "WEIGHT: 30%", ACCENT_EMERALD, 7.15, [
        ("Server-Enforced Timer", "Hard expires_at lock in PostgreSQL defeats client clock tampering."),
        ("Telemetry Tracking", "Monitors window blur, tab switching, and clipboard copy-paste events."),
        ("Hidden Answer Keys", "Option keys reside purely in server memory, preventing console inspection."),
        ("Idempotent Grading", "Single DB transaction prevents duplicate submissions and race conditions."),
        ("Fast Execution SLA", "410ms automated grading response.")
    ]),
    ("STAGE 3: MULTIMODAL INTERVIEW", "WEIGHT: 40%", ACCENT_CORAL, 13.3, [
        ("Simli WebRTC Avatar", "Real-time photorealistic visual interviewer with sub-second lip-sync."),
        ("Deepgram Nova-2 STT", "WebSocket bidirectional audio streaming yields 240ms transcription."),
        ("ElevenLabs Neural Audio", "Low-latency streaming voice creates natural conversational cadence."),
        ("Adaptive Probing", "Fast-inference LLM dynamically generates contextual follow-up probes."),
        ("Total Turnaround SLA", "1.41s glass-to-glass conversational latency.")
    ])
]

for title, weight, col, l_pos, pts in stages:
    card = add_card(slide, l_pos, 17.55, 5.7, 6.2, bg_col=CARD_BG_ALT, border_col=col, border_width=1.0)
    add_pill_badge(slide, l_pos + 0.2, 17.75, 5.3, 0.45, f"{title} | {weight}", CARD_BG, col, font_size=10.5)
    
    tb_st = slide.shapes.add_textbox(Inches(l_pos + 0.2), Inches(18.35), Inches(5.3), Inches(5.3))
    tf_st = tb_st.text_frame
    tf_st.word_wrap = True
    for idx, (st_t, st_d) in enumerate(pts):
        p = tf_st.paragraphs[0] if idx == 0 else tf_st.add_paragraph()
        p.text = f"• {st_t}: "
        p.font.name = 'Arial'
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = col
        run = p.add_run()
        run.text = st_d
        run.font.name = 'Calibri'
        run.font.bold = False
        run.font.color.rgb = TEXT_OFFWHITE
        p.space_after = Pt(4)

# Formula Card at bottom of Zone 4
formula_card = add_card(slide, 1.0, 24.0, 18.0, 1.9, bg_col=CARD_BG, border_col=ACCENT_AMBER, border_width=1.0)
tb_form = slide.shapes.add_textbox(Inches(1.2), Inches(24.1), Inches(17.6), Inches(1.7))
tf_form = tb_form.text_frame
tf_form.word_wrap = True

pf_h = tf_form.paragraphs[0]
pf_h.text = "📐 MULTI-DIMENSIONAL COMPOSITE SCORING FUNCTION & TRIAGE MATRIX"
pf_h.font.name = 'Arial'
pf_h.font.size = Pt(11.5)
pf_h.font.bold = True
pf_h.font.color.rgb = ACCENT_AMBER

pf_eq = tf_form.add_paragraph()
pf_eq.text = "Score_composite = (0.30 × S_screening) + (0.30 × S_assessment) + (0.40 × S_interview)"
pf_eq.font.name = 'Arial'
pf_eq.font.size = Pt(14)
pf_eq.font.bold = True
pf_eq.font.color.rgb = ACCENT_CYAN

pf_tr = tf_form.add_paragraph()
pf_tr.text = "• [Score ≥ 75: Automatic Shortlist]  |  • [60 ≤ Score < 75: Recruiter Review Queue]  |  • [Score < 60: Dignified Regret Feedback]"
pf_tr.font.name = 'Calibri'
pf_tr.font.size = Pt(11)
pf_tr.font.bold = True
pf_tr.font.color.rgb = TEXT_OFFWHITE

# ==========================================
# ZONE 5: LIVE DEPLOYED SYSTEM SHOWCASE (26.3" - 37.1")
# ==========================================
show_card = add_card(slide, 0.7, 26.3, 18.6, 10.6, bg_col=CARD_BG, border_col=CARD_BORDER, border_width=1.0)

tb_sh_title = slide.shapes.add_textbox(Inches(1.0), Inches(26.45), Inches(18.0), Inches(0.6))
tf_sht = tb_sh_title.text_frame
p_sht = tf_sht.paragraphs[0]
p_sht.text = "LIVE DEPLOYED SYSTEM DEMONSTRATION"
p_sht.font.name = 'Arial'
p_sht.font.size = Pt(14)
p_sht.font.bold = True
p_sht.font.color.rgb = ACCENT_CYAN

# Left Screenshot: AI Interview Room
card_sh_l = add_card(slide, 1.0, 27.15, 8.8, 9.5, bg_col=CARD_BG_ALT, border_col=ACCENT_CORAL, border_width=1.0)
add_pill_badge(slide, 1.2, 27.35, 8.4, 0.45, "CANDIDATE INTERACTIVE AVATAR INTERVIEW", CARD_BG, ACCENT_CORAL, font_size=10.5)

inter_img = SCREENS_DIR / "current_interview-layout-1440.png"
if inter_img.exists():
    slide.shapes.add_picture(str(inter_img), Inches(1.2), Inches(27.95), width=Inches(8.4))

tb_sh_ld = slide.shapes.add_textbox(Inches(1.2), Inches(33.3), Inches(8.4), Inches(3.2))
tf_sh_ld = tb_sh_ld.text_frame
tf_sh_ld.word_wrap = True
p_sh_l = tf_sh_ld.paragraphs[0]
p_sh_l.text = "• Live WebRTC Avatar Interface: Real-time talking interviewer rendered with dynamic mouth synchronization and active audio visualizer."
p_sh_l.font.name = 'Calibri'
p_sh_l.font.size = Pt(10.5)
p_sh_l.font.color.rgb = TEXT_OFFWHITE
p_sh_l.space_after = Pt(3)

p_sh_l2 = tf_sh_ld.add_paragraph()
p_sh_l2.text = "• Sub-1.5s Conversational Turnaround: Deepgram Nova-2 transcribes incoming audio in 240ms; ElevenLabs neural TTS streams dynamic response audio without awkward latency."
p_sh_l2.font.name = 'Calibri'
p_sh_l2.font.size = Pt(10)
p_sh_l2.font.color.rgb = TEXT_MUTED

# Right Screenshot: Recruiter Dossier & Dashboard
card_sh_r = add_card(slide, 10.2, 27.15, 8.8, 9.5, bg_col=CARD_BG_ALT, border_col=ACCENT_CYAN, border_width=1.0)
add_pill_badge(slide, 10.4, 27.35, 8.4, 0.45, "RECRUITER COMMAND CENTER & CANDIDATE DOSSIER", CARD_BG, ACCENT_CYAN, font_size=10.5)

doss_img = SCREENS_DIR / "live_candidate-detail-viewport.png"
if not doss_img.exists():
    doss_img = SCREENS_DIR / "live_dashboard.png"

if doss_img.exists():
    slide.shapes.add_picture(str(doss_img), Inches(10.4), Inches(27.95), width=Inches(8.4))

tb_sh_rd = slide.shapes.add_textbox(Inches(10.4), Inches(33.3), Inches(8.4), Inches(3.2))
tf_sh_rd = tb_sh_rd.text_frame
tf_sh_rd.word_wrap = True
p_sh_r = tf_sh_rd.paragraphs[0]
p_sh_r.text = "• 360-Degree Evaluation Dossier: Full scorecard drilldown displaying resume evidence, skill breakdown, and audio interview transcripts with verbatim quotes."
p_sh_r.font.name = 'Calibri'
p_sh_r.font.size = Pt(10.5)
p_sh_r.font.color.rgb = TEXT_OFFWHITE
p_sh_r.space_after = Pt(3)

p_sh_r2 = tf_sh_rd.add_paragraph()
p_sh_r2.text = "• Human-in-the-Loop Governance: AI generates transparent recommendations, leaving final hiring decisions to human recruiters with full score override and audit logging."
p_sh_r2.font.name = 'Calibri'
p_sh_r2.font.size = Pt(10)
p_sh_r2.font.color.rgb = TEXT_MUTED

# ==========================================
# ZONE 6: EMPIRICAL BENCHMARKS & COST (37.1" - 43.1")
# ==========================================
metric_card = add_card(slide, 0.7, 37.1, 18.6, 5.8, bg_col=CARD_BG, border_col=CARD_BORDER, border_width=1.0)

tb_m_title = slide.shapes.add_textbox(Inches(1.0), Inches(37.25), Inches(18.0), Inches(0.5))
tf_mt = tb_m_title.text_frame
p_mt = tf_mt.paragraphs[0]
p_mt.text = "EMPIRICAL BENCHMARKS & INDUSTRIAL COST EFFICIENCY"
p_mt.font.name = 'Arial'
p_mt.font.size = Pt(13.5)
p_mt.font.bold = True
p_mt.font.color.rgb = ACCENT_CYAN

# 4 Stat Cards
stats = [
    ("90.2%", "COST REDUCTION", "$146.31/mo for 500 applicants vs $1,500/mo enterprise ATS", ACCENT_CORAL, 1.0),
    ("1.41s", "AVATAR TURNAROUND", "Total glass-to-glass conversational turnaround latency", ACCENT_CYAN, 5.42),
    ("100%", "TEST PASS RATE", "32 automated unit, integration & RLS penetration tests passing", ACCENT_EMERALD, 9.85),
    ("ZERO", "DATA LEAKAGE", "PostgreSQL Row-Level Security isolates multi-tenant data", ACCENT_AMBER, 14.28)
]

for val, label, sub, col, l_pos in stats:
    sc = add_card(slide, l_pos, 37.85, 4.25, 3.7, bg_col=CARD_BG_ALT, border_col=col, border_width=1.0)
    tb_s = slide.shapes.add_textbox(Inches(l_pos + 0.1), Inches(38.0), Inches(4.05), Inches(3.4))
    tfs = tb_s.text_frame
    tfs.word_wrap = True
    
    ps_v = tfs.paragraphs[0]
    ps_v.text = val
    ps_v.font.name = 'Arial'
    ps_v.font.size = Pt(32)
    ps_v.font.bold = True
    ps_v.font.color.rgb = col
    ps_v.alignment = PP_ALIGN.CENTER
    
    ps_l = tfs.add_paragraph()
    ps_l.text = label
    ps_l.font.name = 'Arial'
    ps_l.font.size = Pt(10.5)
    ps_l.font.bold = True
    ps_l.font.color.rgb = TEXT_WHITE
    ps_l.alignment = PP_ALIGN.CENTER
    ps_l.space_after = Pt(4)
    
    ps_s = tfs.add_paragraph()
    ps_s.text = sub
    ps_s.font.name = 'Calibri'
    ps_s.font.size = Pt(10)
    ps_s.font.color.rgb = TEXT_MUTED
    ps_s.alignment = PP_ALIGN.CENTER

# Tech Stack Pill Ribbon
add_pill_badge(slide, 1.0, 41.8, 18.0, 0.9, 
    "STACK: Next.js 14 App Router  •  FastAPI Microservices  •  Supabase PostgreSQL + RLS  •  Simli WebRTC  •  Deepgram Nova-2  •  ElevenLabs  •  Docker & Vercel Edge",
    CARD_BG_ALT, ACCENT_CYAN, font_size=10.5)

# ==========================================
# ZONE 7: TEAM, SUPERVISOR & LIVE ACCESS FOOTER (43.1" - 49.5")
# ==========================================
footer_card = add_card(slide, 0.7, 43.1, 18.6, 6.4, bg_col=CARD_BG, border_col=ACCENT_AMBER, border_width=1.5)

# Column 1: Project Authors
tb_team = slide.shapes.add_textbox(Inches(1.0), Inches(43.35), Inches(6.4), Inches(5.9))
tf_team = tb_team.text_frame
tf_team.word_wrap = True

pt_h = tf_team.paragraphs[0]
pt_h.text = "👥 PROJECT AUTHORS (BS SE):"
pt_h.font.name = 'Arial'
pt_h.font.size = Pt(12.5)
pt_h.font.bold = True
pt_h.font.color.rgb = ACCENT_CYAN
pt_h.space_after = Pt(6)

members = [
    ("Ameer Hamza", "FA22-BSE-030", "Team Lead & Full-Stack Architect"),
    ("Babar Hussain", "FA22-BSE-044", "AI & Multimodal Systems Lead"),
    ("Ali Naqi", "FA22-BSE-050", "Security, Assessment & QA Lead")
]
for name, roll, role in members:
    p = tf_team.add_paragraph()
    p.text = f"• {name} "
    p.font.name = 'Arial'
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    r1 = p.add_run()
    r1.text = f"({roll})\n"
    r1.font.bold = True
    r1.font.color.rgb = ACCENT_CORAL
    r2 = p.add_run()
    r2.text = f"   Role: {role}"
    r2.font.name = 'Calibri'
    r2.font.size = Pt(10)
    r2.font.bold = False
    r2.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(7)

# Column 2: Supervision & University
tb_inst = slide.shapes.add_textbox(Inches(7.6), Inches(43.35), Inches(7.0), Inches(5.9))
tf_inst = tb_inst.text_frame
tf_inst.word_wrap = True

pi_h = tf_inst.paragraphs[0]
pi_h.text = "🏛️ ACADEMIC SUPERVISION & DEPT:"
pi_h.font.name = 'Arial'
pi_h.font.size = Pt(12.5)
pi_h.font.bold = True
pi_h.font.color.rgb = ACCENT_AMBER
pi_h.space_after = Pt(6)

inst_details = [
    ("Project Supervisor", "Engr. Syeda Iqra Gillani", "Lecturer, Department of Software Engineering"),
    ("Department", "Department of Software Engineering", "Faculty of Engineering & Technology"),
    ("Institution", "Mirpur University of Science and Technology", "(MUST), Mirpur AJK Pakistan"),
    ("Academic Session", "Session 2022 - 2026", "Final Year Capstone Project Defense")
]
for lbl, val, sub in inst_details:
    p = tf_inst.add_paragraph()
    p.text = f"• {lbl}: "
    p.font.name = 'Arial'
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_OFFWHITE
    r = p.add_run()
    r.text = f"{val}\n"
    r.font.bold = True
    r.font.color.rgb = ACCENT_AMBER if "Supervisor" in lbl else TEXT_WHITE
    r2 = p.add_run()
    r2.text = f"   {sub}"
    r2.font.name = 'Calibri'
    r2.font.size = Pt(10)
    r2.font.bold = False
    r2.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(5)

# Column 3: Live Application Access & QR Code
qr_img = ART_DIR / "project-qr.png"
if qr_img.exists():
    slide.shapes.add_picture(str(qr_img), Inches(15.2), Inches(43.8), width=Inches(3.6))

tb_qr = slide.shapes.add_textbox(Inches(14.8), Inches(47.6), Inches(4.3), Inches(1.5))
tf_qr = tb_qr.text_frame
tf_qr.word_wrap = True
pq = tf_qr.paragraphs[0]
pq.text = "SCAN TO EXPERIENCE LIVE DEMO"
pq.font.name = 'Arial'
pq.font.size = Pt(10.5)
pq.font.bold = True
pq.font.color.rgb = ACCENT_CYAN
pq.alignment = PP_ALIGN.CENTER

pq2 = tf_qr.add_paragraph()
pq2.text = "https://ai-recruit360.vercel.app"
pq2.font.name = 'Calibri'
pq2.font.size = Pt(9.5)
pq2.font.color.rgb = TEXT_OFFWHITE
pq2.alignment = PP_ALIGN.CENTER

# Save PowerPoint Presentation
prs.save(str(TARGET_PPTX))
print(f"Successfully generated Master Standee Poster PPTX: {TARGET_PPTX}")

# Export to PDF and High-Resolution PNG using PowerPoint COM
try:
    print("Exporting Standee Poster to High-Resolution PDF and PNG via PowerPoint COM...")
    ppt_app = win32com.client.Dispatch("PowerPoint.Application")
    pres = ppt_app.Presentations.Open(str(TARGET_PPTX.resolve()), WithWindow=False)
    
    # 32 = ppSaveAsPDF
    pres.SaveAs(str(TARGET_PDF.resolve()), 32)
    print(f"Successfully exported print-ready PDF: {TARGET_PDF}")
    
    # Export slide 1 to 2400 x 6000 px PNG (High-DPI 2:5 Aspect Ratio)
    pres.Slides[1].Export(str(TARGET_PNG.resolve()), "PNG", 2400, 6000)
    print(f"Successfully exported 2400x6000 px PNG: {TARGET_PNG}")
    
    pres.Close()
    ppt_app.Quit()
    print("All exports completed successfully!")
except Exception as e:
    print(f"Error during PowerPoint COM export: {e}")
    sys.exit(1)
