"""
build_standee_poster_v2.py
Generates the official 2:5 aspect ratio standee poster for AI Recruit360 for OpenHouse 2026.
Directly replicates the professional graphic designer style, color theme, card layout,
and visual hierarchy of the MUST Department reference standee.
Dimensions: 20.0 inches x 50.0 inches (2:5 aspect ratio, standard 2ft x 5ft roll-up banner).
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
from PIL import Image

ROOT_DIR = Path(__file__).parent.parent
TARGET_PPTX = ROOT_DIR / "Standee-Poster-FYP.pptx"
TARGET_PDF = ROOT_DIR / "Standee-Poster-FYP.pdf"
TARGET_PNG = ROOT_DIR / "Standee-Poster-FYP.png"

ART_DIR = ROOT_DIR / ".artifacts" / "thesis"
SCREENS_DIR = ROOT_DIR / "website_screenshots"
BRAND_DIR = ROOT_DIR / "frontend" / "public" / "brand"

# Color Palette inspired by the reference poster & Recruit360 website tokens:
PAGE_BG = RGBColor(241, 245, 249)        # #F1F5F9 Soft Crisp Slate Background
CARD_BG = RGBColor(255, 255, 255)        # #FFFFFF Pure White Cards
CARD_BORDER = RGBColor(203, 213, 225)    # #CBD5E1 Light Slate Border
HEADER_NAVY = RGBColor(11, 25, 44)       # #0B192C Deep Royal Navy
HEADER_BLUE = RGBColor(2, 132, 199)      # #0284C7 Sky/Cyan Accent
PILL_BLUE = RGBColor(29, 78, 216)        # #1D4ED8 Royal Blue for Section Headers
PILL_LIGHT = RGBColor(238, 242, 255)     # #EEF2FF Soft Indigo Tint
ACCENT_CORAL = RGBColor(239, 68, 68)     # #EF4444 Warm Coral / Red Alert
ACCENT_EMERALD = RGBColor(16, 185, 129)  # #10B981 Vibrant Green
ACCENT_AMBER = RGBColor(245, 158, 11)    # #F59E0B Warm Amber / Gold
TEXT_DARK = RGBColor(15, 23, 42)         # #0F172A Primary Dark Text
TEXT_BODY = RGBColor(51, 65, 85)         # #334155 Secondary Dark Text
TEXT_MUTED = RGBColor(100, 116, 139)     # #64748B Muted Gray
TEXT_WHITE = RGBColor(255, 255, 255)     # #FFFFFF Pure White

SLIDE_WIDTH = Inches(20.0)
SLIDE_HEIGHT = Inches(50.0)

prs = Presentation()
prs.slide_width = SLIDE_WIDTH
prs.slide_height = SLIDE_HEIGHT
blank_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_layout)

# 1. Canvas Background (Soft Crisp Light Slate)
bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
bg.fill.solid()
bg.fill.fore_color.rgb = PAGE_BG
bg.line.fill.background()

def add_card(s, left, top, width, height, bg_col=CARD_BG, border_col=CARD_BORDER, border_width=1.0):
    shape = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_col
    if border_col:
        shape.line.color.rgb = border_col
        shape.line.width = Pt(border_width)
    else:
        shape.line.fill.background()
    return shape

def add_header_pill(s, left, top, width, height, icon_and_title, bg_col=PILL_BLUE):
    pill = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    pill.fill.solid()
    pill.fill.fore_color.rgb = bg_col
    pill.line.fill.background()
    tf = pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = icon_and_title
    p.font.name = 'Arial'
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    return pill

# ==========================================
# 1. TOP HERO HEADER (0.0" to 8.2")
# ==========================================
# Rich Royal Navy Background Banner
header_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_WIDTH, Inches(8.2))
header_shape.fill.solid()
header_shape.fill.fore_color.rgb = HEADER_NAVY
header_shape.line.fill.background()

# Top cyan accent line
top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_WIDTH, Inches(0.12))
top_bar.fill.solid()
top_bar.fill.fore_color.rgb = HEADER_BLUE
top_bar.line.fill.background()

# Device Frame Left: Candidate Avatar Session
dev_l = add_card(slide, 0.7, 0.9, 3.4, 4.8, bg_col=RGBColor(15, 23, 42), border_col=HEADER_BLUE, border_width=1.5)
avatar_img = SCREENS_DIR / "current_interview-layout-1440.png"
if avatar_img.exists():
    try:
        im = Image.open(avatar_img)
        im_crop = im.crop((120, 160, 680, 720))
        crop_path = ROOT_DIR / ".artifacts" / "thesis" / "avatar_header_preview.png"
        im_crop.save(crop_path)
        slide.shapes.add_picture(str(crop_path), Inches(0.85), Inches(1.05), width=Inches(3.1))
    except Exception as e:
        print(f"Header left image error: {e}")

# Device Frame Right: Recruiter Evaluation Dossier
dev_r = add_card(slide, 15.3, 0.9, 4.0, 4.8, bg_col=RGBColor(15, 23, 42), border_col=HEADER_BLUE, border_width=1.5)
dash_img = SCREENS_DIR / "live_candidate-detail-viewport.png"
if not dash_img.exists():
    dash_img = SCREENS_DIR / "live_dashboard.png"
if dash_img.exists():
    try:
        im_d = Image.open(dash_img)
        im_d_crop = im_d.crop((400, 50, 1250, 680))
        d_crop_path = ROOT_DIR / ".artifacts" / "thesis" / "dash_header_preview.png"
        im_d_crop.save(d_crop_path)
        slide.shapes.add_picture(str(d_crop_path), Inches(15.45), Inches(1.05), width=Inches(3.7))
    except Exception as e:
        print(f"Header right image error: {e}")

# Center Title & Tagline in Header
tb_hero = slide.shapes.add_textbox(Inches(4.3), Inches(0.5), Inches(10.8), Inches(5.9))
tf_hero = tb_hero.text_frame
tf_hero.word_wrap = True

# Main Project Name: ai_recruit360
p_hero_title = tf_hero.paragraphs[0]
p_hero_title.text = "ai_recruit360"
p_hero_title.font.name = 'Arial'
p_hero_title.font.size = Pt(44)
p_hero_title.font.bold = True
p_hero_title.font.color.rgb = TEXT_WHITE
p_hero_title.alignment = PP_ALIGN.CENTER
run_dot = p_hero_title.add_run()
run_dot.text = " ."
run_dot.font.color.rgb = ACCENT_CORAL

# Subtitle / Mission Tagline
p_hero_sub = tf_hero.add_paragraph()
p_hero_sub.text = "AI-assisted resume screening, anti-cheat skills assessment, and multimodal conversational avatar interviews."
p_hero_sub.font.name = 'Calibri'
p_hero_sub.font.size = Pt(13.5)
p_hero_sub.font.bold = True
p_hero_sub.font.color.rgb = RGBColor(226, 232, 240)
p_hero_sub.alignment = PP_ALIGN.CENTER
p_hero_sub.space_before = Pt(4)
p_hero_sub.space_after = Pt(8)

# Session Info
p_hero_sess = tf_hero.add_paragraph()
p_hero_sess.text = "BSc Final Year Project (Session 2022-2026)"
p_hero_sess.font.name = 'Calibri'
p_hero_sess.font.size = Pt(13)
p_hero_sess.font.color.rgb = HEADER_BLUE
p_hero_sess.alignment = PP_ALIGN.CENTER
p_hero_sess.space_after = Pt(10)

# Department Blue Ribbon Banner (Matching Reference)
dept_ribbon = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(6.8), SLIDE_WIDTH, Inches(1.4))
dept_ribbon.fill.solid()
dept_ribbon.fill.fore_color.rgb = PILL_BLUE
dept_ribbon.line.fill.background()

tb_dept_r = slide.shapes.add_textbox(0, Inches(6.85), SLIDE_WIDTH, Inches(1.3))
tf_dr = tb_dept_r.text_frame
tf_dr.word_wrap = True

p_dr1 = tf_dr.paragraphs[0]
p_dr1.text = "DEPARTMENT OF SOFTWARE ENGINEERING"
p_dr1.font.name = 'Arial'
p_dr1.font.size = Pt(18)
p_dr1.font.bold = True
p_dr1.font.color.rgb = TEXT_WHITE
p_dr1.alignment = PP_ALIGN.CENTER

p_dr2 = tf_dr.add_paragraph()
p_dr2.text = "Mirpur University of Science and Technology (MUST), Mirpur-10250"
p_dr2.font.name = 'Calibri'
p_dr2.font.size = Pt(13)
p_dr2.font.color.rgb = RGBColor(224, 231, 255)
p_dr2.alignment = PP_ALIGN.CENTER

# ==========================================
# 2. STUDENTS & SUPERVISOR SECTION (8.45" - 10.75")
# ==========================================
# Left Card: Students (12.0" wide)
card_stud = add_card(slide, 0.6, 8.45, 12.0, 2.2, bg_col=CARD_BG, border_col=HEADER_BLUE, border_width=1.5)
header_stud = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(8.45), Inches(12.0), Inches(0.55))
header_stud.fill.solid()
header_stud.fill.fore_color.rgb = HEADER_BLUE
header_stud.line.fill.background()

tf_hs = header_stud.text_frame
tf_hs.vertical_anchor = MSO_ANCHOR.MIDDLE
p_hs = tf_hs.paragraphs[0]
p_hs.text = "🎓   Students"
p_hs.font.name = 'Arial'
p_hs.font.size = Pt(13)
p_hs.font.bold = True
p_hs.font.color.rgb = TEXT_WHITE
p_hs.alignment = PP_ALIGN.LEFT
tf_hs.margin_left = Inches(0.3)

# 3 Columns for Students
students = [
    ("Ameer Hamza", "FA22-BSE-030", 0.9),
    ("Babar Hussain", "FA22-BSE-044", 4.8),
    ("Ali Naqi", "FA22-BSE-050", 8.7)
]
for name, roll, left_pos in students:
    tb = slide.shapes.add_textbox(Inches(left_pos), Inches(9.1), Inches(3.6), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    pn = tf.paragraphs[0]
    pn.text = name
    pn.font.name = 'Arial'
    pn.font.size = Pt(13)
    pn.font.bold = True
    pn.font.color.rgb = PILL_BLUE
    pn.alignment = PP_ALIGN.CENTER
    
    pr = tf.add_paragraph()
    pr.text = roll
    pr.font.name = 'Arial'
    pr.font.size = Pt(11.5)
    pr.font.bold = True
    pr.font.color.rgb = TEXT_DARK
    pr.alignment = PP_ALIGN.CENTER

# Right Card: Supervisor (6.2" wide)
card_sup = add_card(slide, 13.2, 8.45, 6.2, 2.2, bg_col=CARD_BG, border_col=HEADER_BLUE, border_width=1.5)
header_sup = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(13.2), Inches(8.45), Inches(6.2), Inches(0.55))
header_sup.fill.solid()
header_sup.fill.fore_color.rgb = HEADER_BLUE
header_sup.line.fill.background()

tf_hsup = header_sup.text_frame
tf_hsup.vertical_anchor = MSO_ANCHOR.MIDDLE
p_hsup = tf_hsup.paragraphs[0]
p_hsup.text = "👤   Supervisor"
p_hsup.font.name = 'Arial'
p_hsup.font.size = Pt(13)
p_hsup.font.bold = True
p_hsup.font.color.rgb = TEXT_WHITE
p_hsup.alignment = PP_ALIGN.LEFT
tf_hsup.margin_left = Inches(0.3)

tb_sup_info = slide.shapes.add_textbox(Inches(13.4), Inches(9.1), Inches(5.8), Inches(1.4))
tf_si = tb_sup_info.text_frame
tf_si.word_wrap = True

psi_n = tf_si.paragraphs[0]
psi_n.text = "Engr. Syeda Iqra Gillani"
psi_n.font.name = 'Arial'
psi_n.font.size = Pt(13.5)
psi_n.font.bold = True
psi_n.font.color.rgb = PILL_BLUE
psi_n.alignment = PP_ALIGN.CENTER

psi_r = tf_si.add_paragraph()
psi_r.text = "Lecturer, Dept of Software Engineering"
psi_r.font.name = 'Calibri'
psi_r.font.size = Pt(11)
psi_r.font.color.rgb = TEXT_BODY
psi_r.alignment = PP_ALIGN.CENTER

# ==========================================
# 3. MAIN 2-COLUMN BODY LAYOUT
# ==========================================
COL1_LEFT = 0.6
COL2_LEFT = 10.3
COL_WIDTH = 9.1

# ------------------------------------------
# CARD 1: 1. INTRODUCTION (Left, 10.9" - 15.3")
# ------------------------------------------
card_intro = add_card(slide, COL1_LEFT, 10.9, COL_WIDTH, 4.4)
add_header_pill(slide, COL1_LEFT, 10.9, COL_WIDTH, 0.6, "📖   1. INTRODUCTION", PILL_BLUE)

tb_intro = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.3), Inches(11.6), Inches(COL_WIDTH - 0.6), Inches(3.5))
tf_in = tb_intro.text_frame
tf_in.word_wrap = True

p_in = tf_in.paragraphs[0]
p_in.text = "Corporate talent acquisition faces a severe hiring bottleneck: recruiters receive 500+ applicants per requisition and spend under 7 seconds per CV. Legacy keyword-based Applicant Tracking Systems (ATS) reject top-tier engineers due to keyword mismatches while rewarding superficial keyword stuffing."
p_in.font.name = 'Calibri'
p_in.font.size = Pt(11.5)
p_in.font.color.rgb = TEXT_BODY
p_in.space_after = Pt(5)

p_in2 = tf_in.add_paragraph()
p_in2.text = "ai_recruit360 is an enterprise-grade autonomous recruitment platform that evaluates candidates across a server-authoritative three-stage pipeline (Resume Screening, Skills Assessment, and Multimodal Interview) to deliver verifiable, bias-free candidate rankings with 90.2% cost reduction."
p_in2.font.name = 'Calibri'
p_in2.font.size = Pt(11.5)
p_in2.font.color.rgb = TEXT_BODY

# ------------------------------------------
# CARD 2: 2. OBJECTIVES (Right, 10.9" - 15.3")
# ------------------------------------------
card_obj = add_card(slide, COL2_LEFT, 10.9, COL_WIDTH, 4.4)
add_header_pill(slide, COL2_LEFT, 10.9, COL_WIDTH, 0.6, "🎯   2. OBJECTIVES", PILL_BLUE)

tb_obj = slide.shapes.add_textbox(Inches(COL2_LEFT + 0.3), Inches(11.55), Inches(COL_WIDTH - 0.6), Inches(3.6))
tf_ob = tb_obj.text_frame
tf_ob.word_wrap = True

objectives = [
    "Develop in-memory stream parser for PDF/DOCX resumes (380ms).",
    "Enforce strict Pydantic JSON schemas to eliminate AI hallucination.",
    "Implement server-authoritative anti-cheat testing with database locks.",
    "Stream real-time WebRTC conversational avatar with sub-1.5s turnaround.",
    "Formulate multi-dimensional 30/30/40 composite candidate scorecard.",
    "Eliminate demographic bias through blind resume redaction.",
    "Slash corporate recruitment operational costs by 90.2%."
]
for idx, obj in enumerate(objectives):
    p = tf_ob.paragraphs[0] if idx == 0 else tf_ob.add_paragraph()
    p.text = f"•  {obj}"
    p.font.name = 'Calibri'
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_BODY
    p.space_after = Pt(3)

# ------------------------------------------
# CARD 3: 3. METHODOLOGY (Left, 15.6" - 24.8")
# ------------------------------------------
card_meth = add_card(slide, COL1_LEFT, 15.6, COL_WIDTH, 9.2)
add_header_pill(slide, COL1_LEFT, 15.6, COL_WIDTH, 0.6, "⚙️   3. METHODOLOGY", PILL_BLUE)

# Vertical Flowchart with 5 steps and down arrows
steps = [
    ("Resume Stream Ingestion", "PDF/DOCX parsed in-memory (380ms) without disk writes", "📥", PILL_BLUE),
    ("Deterministic AI Screening (30%)", "Strict Pydantic JSON schema guarantees zero hallucination", "🧠", HEADER_BLUE),
    ("Anti-Cheat Skills Assessment (30%)", "Server expires_at locks & DOM telemetry tracking", "🛡️", ACCENT_EMERALD),
    ("Multimodal AI Interview (40%)", "Simli WebRTC avatar + OpenAI Whisper STT + OpenAI TTS (Nova)", "🗣️", ACCENT_CORAL),
    ("Composite Scoring & Triage", "0.30·Screen + 0.30·Assess + 0.40·Interview ranking", "📊", PILL_BLUE)
]

step_y = 16.35
for idx, (title, desc, icon, col) in enumerate(steps):
    sc = add_card(slide, COL1_LEFT + 0.3, step_y, COL_WIDTH - 0.6, 1.25, bg_col=PILL_LIGHT, border_col=col, border_width=1.0)
    
    ic = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(COL1_LEFT + 0.5), Inches(step_y + 0.18), Inches(0.9), Inches(0.9))
    ic.fill.solid()
    ic.fill.fore_color.rgb = col
    ic.line.fill.background()
    tf_ic = ic.text_frame
    tf_ic.vertical_anchor = MSO_ANCHOR.MIDDLE
    pic = tf_ic.paragraphs[0]
    pic.text = icon
    pic.font.name = 'Arial'
    pic.font.size = Pt(16)
    pic.alignment = PP_ALIGN.CENTER
    
    tb_st = slide.shapes.add_textbox(Inches(COL1_LEFT + 1.55), Inches(step_y + 0.08), Inches(COL_WIDTH - 1.9), Inches(1.1))
    tf_st = tb_st.text_frame
    tf_st.word_wrap = True
    
    pst_t = tf_st.paragraphs[0]
    pst_t.text = f"{idx+1}. {title}"
    pst_t.font.name = 'Arial'
    pst_t.font.size = Pt(11.5)
    pst_t.font.bold = True
    pst_t.font.color.rgb = col
    
    pst_d = tf_st.add_paragraph()
    pst_d.text = desc
    pst_d.font.name = 'Calibri'
    pst_d.font.size = Pt(10)
    pst_d.font.color.rgb = TEXT_BODY
    
    if idx < len(steps) - 1:
        tb_arr = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.75), Inches(step_y + 1.22), Inches(0.4), Inches(0.4))
        tf_arr = tb_arr.text_frame
        pa = tf_arr.paragraphs[0]
        pa.text = "↓"
        pa.font.name = 'Arial'
        pa.font.size = Pt(13)
        pa.font.bold = True
        pa.font.color.rgb = PILL_BLUE
        pa.alignment = PP_ALIGN.CENTER
    
    step_y += 1.62

# ------------------------------------------
# CARD 4: 4. KEY RESULTS (Right, 15.6" - 23.0")
# ------------------------------------------
card_res = add_card(slide, COL2_LEFT, 15.6, COL_WIDTH, 7.3)
add_header_pill(slide, COL2_LEFT, 15.6, COL_WIDTH, 0.6, "📊   4. KEY RESULTS", PILL_BLUE)

res_grid = [
    ("90.2%", "Cost Reduction", "$146.31/mo for 500 applicants vs $1,500/mo legacy ATS", "👥", ACCENT_CORAL, COL2_LEFT + 0.3, 16.35),
    ("1.41s", "Conversational Latency", "OpenAI Whisper STT (~1.1s) + LLM (400ms) + TTS (480ms)", "⚡", HEADER_BLUE, COL2_LEFT + 4.7, 16.35),
    ("100%", "Test Pass Rate", "32 automated unit, integration & RLS penetration tests", "🛡️", ACCENT_EMERALD, COL2_LEFT + 0.3, 19.55),
    ("Zero", "Cheating & Leakage", "Tamper-proof server locks & PostgreSQL Row-Level Security", "🔒", ACCENT_AMBER, COL2_LEFT + 4.7, 19.55)
]

for val, title, desc, icon, col, rx, ry in res_grid:
    rc = add_card(slide, rx, ry, 4.1, 3.0, bg_col=PILL_LIGHT, border_col=col, border_width=1.0)
    
    tb_rc = slide.shapes.add_textbox(Inches(rx + 0.1), Inches(ry + 0.15), Inches(3.9), Inches(2.7))
    tf_rc = tb_rc.text_frame
    tf_rc.word_wrap = True
    
    pr_ic = tf_rc.paragraphs[0]
    pr_ic.text = icon
    pr_ic.font.name = 'Arial'
    pr_ic.font.size = Pt(18)
    pr_ic.alignment = PP_ALIGN.CENTER
    
    pr_v = tf_rc.add_paragraph()
    pr_v.text = val
    pr_v.font.name = 'Arial'
    pr_v.font.size = Pt(22)
    pr_v.font.bold = True
    pr_v.font.color.rgb = col
    pr_v.alignment = PP_ALIGN.CENTER
    
    pr_t = tf_rc.add_paragraph()
    pr_t.text = title
    pr_t.font.name = 'Arial'
    pr_t.font.size = Pt(10.5)
    pr_t.font.bold = True
    pr_t.font.color.rgb = TEXT_DARK
    pr_t.alignment = PP_ALIGN.CENTER
    
    pr_d = tf_rc.add_paragraph()
    pr_d.text = desc
    pr_d.font.name = 'Calibri'
    pr_d.font.size = Pt(9)
    pr_d.font.color.rgb = TEXT_MUTED
    pr_d.alignment = PP_ALIGN.CENTER

# ------------------------------------------
# CARD 5: 5. SYSTEM FEATURES (Right, 23.2" - 33.7")
# ------------------------------------------
card_feat = add_card(slide, COL2_LEFT, 23.2, COL_WIDTH, 10.5)
add_header_pill(slide, COL2_LEFT, 23.2, COL_WIDTH, 0.6, "⭐   5. SYSTEM FEATURES", PILL_BLUE)

features = [
    ("📄", "Deterministic Resume Extraction", "In-memory byte parsing for PDF/DOCX with Pydantic JSON schemas.", PILL_BLUE),
    ("🛡️", "Server-Authoritative Anti-Cheat", "PostgreSQL database expires_at locks defeat client clock tampering.", ACCENT_EMERALD),
    ("🗣️", "Simli WebRTC Conversational Avatar", "Real-time photorealistic visual interviewer with sub-second lip sync.", ACCENT_CORAL),
    ("🎙️", "OpenAI Whisper (whisper-1) STT", "High-accuracy audio buffer transcription powered by OpenAI Whisper-1.", HEADER_BLUE),
    ("🧠", "Adaptive Follow-Up Probing", "Fast-inference LLM dynamically generates contextual follow-up probes.", PILL_BLUE),
    ("📊", "360° Candidate Evaluation Dossier", "Verbatim audio interview transcripts, skill breakdown, and recruiter override.", ACCENT_AMBER),
    ("🔒", "Multi-Tenant Row-Level Security", "PostgreSQL kernel-level RLS policies isolate organization records.", ACCENT_EMERALD)
]

feat_y = 23.95
for icon, title, desc, col in features:
    cip = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(COL2_LEFT + 0.4), Inches(feat_y + 0.1), Inches(0.65), Inches(0.65))
    cip.fill.solid()
    cip.fill.fore_color.rgb = col
    cip.line.fill.background()
    tf_cip = cip.text_frame
    tf_cip.vertical_anchor = MSO_ANCHOR.MIDDLE
    pcip = tf_cip.paragraphs[0]
    pcip.text = icon
    pcip.font.name = 'Arial'
    pcip.font.size = Pt(11)
    pcip.alignment = PP_ALIGN.CENTER
    
    tb_f = slide.shapes.add_textbox(Inches(COL2_LEFT + 1.2), Inches(feat_y), Inches(COL_WIDTH - 1.5), Inches(1.3))
    tf_f = tb_f.text_frame
    tf_f.word_wrap = True
    
    pf_t = tf_f.paragraphs[0]
    pf_t.text = title
    pf_t.font.name = 'Arial'
    pf_t.font.size = Pt(11)
    pf_t.font.bold = True
    pf_t.font.color.rgb = TEXT_DARK
    
    pf_d = tf_f.add_paragraph()
    pf_d.text = desc
    pf_d.font.name = 'Calibri'
    pf_d.font.size = Pt(9.5)
    pf_d.font.color.rgb = TEXT_MUTED
    
    feat_y += 1.35

# ------------------------------------------
# CARD 6: 6. APPLICATION INTERFACE (Left, 25.1" - 38.6")
# ------------------------------------------
card_ui = add_card(slide, COL1_LEFT, 25.1, COL_WIDTH, 13.5)
add_header_pill(slide, COL1_LEFT, 25.1, COL_WIDTH, 0.6, "💻   6. APPLICATION INTERFACE", PILL_BLUE)

# UI 1: Candidate AI Avatar Interview Room
add_card(slide, COL1_LEFT + 0.3, 25.85, COL_WIDTH - 0.6, 5.8, bg_col=PILL_LIGHT, border_col=ACCENT_CORAL, border_width=1.0)
tb_ui1_h = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.4), Inches(25.9), Inches(COL_WIDTH - 0.8), Inches(0.4))
tf_u1h = tb_ui1_h.text_frame
pu1 = tf_u1h.paragraphs[0]
pu1.text = "CANDIDATE LIVE AVATAR INTERVIEW ROOM (WebRTC)"
pu1.font.name = 'Arial'
pu1.font.size = Pt(10)
pu1.font.bold = True
pu1.font.color.rgb = ACCENT_CORAL

inter_mockup = SCREENS_DIR / "current_interview-layout-1440.png"
if inter_mockup.exists():
    slide.shapes.add_picture(str(inter_mockup), Inches(COL1_LEFT + 0.4), Inches(26.35), width=Inches(COL_WIDTH - 0.8))

tb_ui1_d = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.4), Inches(30.65), Inches(COL_WIDTH - 0.8), Inches(0.9))
tf_u1d = tb_ui1_d.text_frame
tf_u1d.word_wrap = True
pu1d = tf_u1d.paragraphs[0]
pu1d.text = "Photorealistic talking avatar with dynamic audio visualizer and real-time closed captions. Candidate simply speaks into their microphone."
pu1d.font.name = 'Calibri'
pu1d.font.size = Pt(9.5)
pu1d.font.color.rgb = TEXT_BODY

# UI 2: Recruiter 360° Candidate Evaluation Dossier
add_card(slide, COL1_LEFT + 0.3, 31.9, COL_WIDTH - 0.6, 6.4, bg_col=PILL_LIGHT, border_col=HEADER_BLUE, border_width=1.0)
tb_ui2_h = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.4), Inches(31.95), Inches(COL_WIDTH - 0.8), Inches(0.4))
tf_u2h = tb_ui2_h.text_frame
pu2 = tf_u2h.paragraphs[0]
pu2.text = "RECRUITER 360° EVALUATION DOSSIER & AUDIT"
pu2.font.name = 'Arial'
pu2.font.size = Pt(10)
pu2.font.bold = True
pu2.font.color.rgb = HEADER_BLUE

doss_mockup = SCREENS_DIR / "live_candidate-detail-viewport.png"
if not doss_mockup.exists():
    doss_mockup = SCREENS_DIR / "live_dashboard.png"
if doss_mockup.exists():
    slide.shapes.add_picture(str(doss_mockup), Inches(COL1_LEFT + 0.4), Inches(26.35 + 6.05), width=Inches(COL_WIDTH - 0.8))

tb_ui2_d = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.4), Inches(36.75), Inches(COL_WIDTH - 0.8), Inches(1.4))
tf_u2d = tb_ui2_d.text_frame
tf_u2d.word_wrap = True
pu2d = tf_u2d.paragraphs[0]
pu2d.text = "Multi-stage score breakdown, verified skill matches, anti-cheat event telemetry, and full audio interview transcript with recruiter override controls."
pu2d.font.name = 'Calibri'
pu2d.font.size = Pt(9.5)
pu2d.font.color.rgb = TEXT_BODY

# ------------------------------------------
# CARD 8: 8. REFERENCES (Right, 34.0" - 38.6")
# ------------------------------------------
card_ref = add_card(slide, COL2_LEFT, 34.0, COL_WIDTH, 4.6)
add_header_pill(slide, COL2_LEFT, 34.0, COL_WIDTH, 0.6, "📄   8. REFERENCES", PILL_BLUE)

tb_ref = slide.shapes.add_textbox(Inches(COL2_LEFT + 0.3), Inches(34.7), Inches(COL_WIDTH - 0.6), Inches(3.7))
tf_rf = tb_ref.text_frame
tf_rf.word_wrap = True

refs = [
    "IEEE Standard 1016-2009: Standard for Information Technology - Systems Design - Software Design Descriptions.",
    "OpenAI (2024): Robust Speech Recognition (Whisper) and Neural Voice Synthesis (TTS-1).",
    "Simli AI (2024): Real-Time WebRTC Neural Visual Avatar Rendering and Lip-Synchronization Protocols.",
    "PostgreSQL Global Development Group (2024): PostgreSQL Row-Level Security & Multi-Tenant Kernel Isolation."
]
for idx, rf in enumerate(refs):
    p = tf_rf.paragraphs[0] if idx == 0 else tf_rf.add_paragraph()
    p.text = f"{idx+1}.  {rf}"
    p.font.name = 'Calibri'
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED
    p.space_after = Pt(4)

# ------------------------------------------
# CARD 7: 7. CONCLUSION (Left, 38.9" - 43.3")
# ------------------------------------------
card_conc = add_card(slide, COL1_LEFT, 38.9, COL_WIDTH, 4.4)
add_header_pill(slide, COL1_LEFT, 38.9, COL_WIDTH, 0.6, "💡   7. CONCLUSION", PILL_BLUE)

tb_conc = slide.shapes.add_textbox(Inches(COL1_LEFT + 0.3), Inches(39.6), Inches(COL_WIDTH - 0.6), Inches(3.5))
tf_co = tb_conc.text_frame
tf_co.word_wrap = True

p_co = tf_co.paragraphs[0]
p_co.text = "ai_recruit360 demonstrates the transformative potential of artificial intelligence in modernizing talent acquisition. By integrating deterministic schema-constrained resume parsing, server-authoritative anti-cheat testing, and real-time multimodal avatar interviews, the platform delivers an objective, data-driven, and candidate-centric recruitment workflow."
p_co.font.name = 'Calibri'
p_co.font.size = Pt(10.5)
p_co.font.color.rgb = TEXT_BODY
p_co.space_after = Pt(4)

p_co2 = tf_co.add_paragraph()
p_co2.text = "The system successfully achieves a 90.2% cost reduction while safeguarding candidate dignity and algorithmic transparency through human-in-the-loop recruiter governance."
p_co2.font.name = 'Calibri'
p_co2.font.size = Pt(10.5)
p_co2.font.bold = True
p_co2.font.color.rgb = PILL_BLUE

# ------------------------------------------
# CARD 9: SUSTAINABLE DEVELOPMENT GOALS (Right, 38.9" - 43.3")
# ------------------------------------------
card_sdg = add_card(slide, COL2_LEFT, 38.9, COL_WIDTH, 4.4)
add_header_pill(slide, COL2_LEFT, 38.9, COL_WIDTH, 0.6, "🌍   SUSTAINABLE DEVELOPMENT GOALS", PILL_BLUE)

# SDG 8 Card: Decent Work and Economic Growth
sdg8_card = add_card(slide, COL2_LEFT + 0.3, 39.65, 4.1, 3.4, bg_col=RGBColor(162, 25, 66), border_col=None)
tb_s8 = slide.shapes.add_textbox(Inches(COL2_LEFT + 0.4), Inches(39.75), Inches(3.9), Inches(3.1))
tf_s8 = tb_s8.text_frame
tf_s8.word_wrap = True
ps8_n = tf_s8.paragraphs[0]
ps8_n.text = "8   DECENT WORK &"
ps8_n.font.name = 'Arial'
ps8_n.font.size = Pt(13)
ps8_n.font.bold = True
ps8_n.font.color.rgb = TEXT_WHITE

ps8_n2 = tf_s8.add_paragraph()
ps8_n2.text = "ECONOMIC GROWTH"
ps8_n2.font.name = 'Arial'
ps8_n2.font.size = Pt(11)
ps8_n2.font.bold = True
ps8_n2.font.color.rgb = TEXT_WHITE
ps8_n2.space_after = Pt(6)

ps8_d = tf_s8.add_paragraph()
ps8_d.text = "Promoting fair, bias-free, accessible recruitment, eliminating demographic discrimination, and accelerating equitable employment opportunities."
ps8_d.font.name = 'Calibri'
ps8_d.font.size = Pt(9.5)
ps8_d.font.color.rgb = RGBColor(254, 226, 226)

# SDG 9 Card: Industry, Innovation & Infrastructure
sdg9_card = add_card(slide, COL2_LEFT + 4.7, 39.65, 4.1, 3.4, bg_col=RGBColor(243, 109, 37), border_col=None)
tb_s9 = slide.shapes.add_textbox(Inches(COL2_LEFT + 4.8), Inches(39.75), Inches(3.9), Inches(3.1))
tf_s9 = tb_s9.text_frame
tf_s9.word_wrap = True
ps9_n = tf_s9.paragraphs[0]
ps9_n.text = "9   INDUSTRY, INNOVATION"
ps9_n.font.name = 'Arial'
ps9_n.font.size = Pt(11)
ps9_n.font.bold = True
ps9_n.font.color.rgb = TEXT_WHITE

ps9_n2 = tf_s9.add_paragraph()
ps9_n2.text = "& INFRASTRUCTURE"
ps9_n2.font.name = 'Arial'
ps9_n2.font.size = Pt(11)
ps9_n2.font.bold = True
ps9_n2.font.color.rgb = TEXT_WHITE
ps9_n2.space_after = Pt(6)

ps9_d = tf_s9.add_paragraph()
ps9_d.text = "Building modern, resilient AI cloud infrastructure utilizing real-time WebRTC, neural streaming speech, and server-authoritative computing."
ps9_d.font.name = 'Calibri'
ps9_d.font.size = Pt(9.5)
ps9_d.font.color.rgb = RGBColor(254, 243, 199)

# ==========================================
# 4. FOOTER BANNER (43.6" - 50.0")
# ==========================================
card_foot = add_card(slide, 0.6, 43.6, 18.8, 5.0, bg_col=CARD_BG, border_col=HEADER_BLUE, border_width=1.5)

# MUST Crest Logo on Left
crest_foot = ART_DIR / "university-logo.png"
if crest_foot.exists():
    slide.shapes.add_picture(str(crest_foot), Inches(1.2), Inches(44.0), width=Inches(2.5))

# University & Department Info in Center
tb_fi = slide.shapes.add_textbox(Inches(4.2), Inches(44.0), Inches(10.5), Inches(2.6))
tf_fi = tb_fi.text_frame
tf_fi.word_wrap = True

pfi_u = tf_fi.paragraphs[0]
pfi_u.text = "Mirpur University of Science and Technology (MUST), Mirpur-10250"
pfi_u.font.name = 'Arial'
pfi_u.font.size = Pt(15)
pfi_u.font.bold = True
pfi_u.font.color.rgb = PILL_BLUE

pfi_d = tf_fi.add_paragraph()
pfi_d.text = "DEPARTMENT OF SOFTWARE ENGINEERING"
pfi_d.font.name = 'Arial'
pfi_d.font.size = Pt(13)
pfi_d.font.bold = True
pfi_d.font.color.rgb = TEXT_DARK

pfi_f = tf_fi.add_paragraph()
pfi_f.text = "Faculty of Engineering & Technology | Session 2022-2026"
pfi_f.font.name = 'Calibri'
pfi_f.font.size = Pt(11.5)
pfi_f.font.color.rgb = TEXT_MUTED

# QR Code on Right
qr_foot = ART_DIR / "project-qr.png"
if qr_foot.exists():
    slide.shapes.add_picture(str(qr_foot), Inches(15.4), Inches(43.85), width=Inches(2.4))

tb_qr_lbl = slide.shapes.add_textbox(Inches(14.8), Inches(46.35), Inches(3.6), Inches(1.0))
tf_ql = tb_qr_lbl.text_frame
tf_ql.word_wrap = True
pql = tf_ql.paragraphs[0]
pql.text = "SCAN FOR LIVE DEMO"
pql.font.name = 'Arial'
pql.font.size = Pt(9.5)
pql.font.bold = True
pql.font.color.rgb = PILL_BLUE
pql.alignment = PP_ALIGN.CENTER

pql2 = tf_ql.add_paragraph()
pql2.text = "https://ai-recruit360.vercel.app"
pql2.font.name = 'Calibri'
pql2.font.size = Pt(8.5)
pql2.font.color.rgb = TEXT_MUTED
pql2.alignment = PP_ALIGN.CENTER

# Bottom Blue Slogan Ribbon (Matching Reference)
bot_slogan = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(48.8), SLIDE_WIDTH, Inches(1.2))
bot_slogan.fill.solid()
bot_slogan.fill.fore_color.rgb = PILL_BLUE
bot_slogan.line.fill.background()

tb_slog = slide.shapes.add_textbox(0, Inches(48.85), SLIDE_WIDTH, Inches(1.1))
tf_sl = tb_slog.text_frame
tf_sl.word_wrap = True
psl = tf_sl.paragraphs[0]
psl.text = "INNOVATING TALENT ACQUISITION THROUGH OBJECTIVE AI EVALUATION"
psl.font.name = 'Arial'
psl.font.size = Pt(15)
psl.font.bold = True
psl.font.color.rgb = TEXT_WHITE
psl.alignment = PP_ALIGN.CENTER

# Save PowerPoint Presentation
prs.save(str(TARGET_PPTX))
print(f"Successfully generated Standee Poster PPTX: {TARGET_PPTX}")

# Export to PDF and High-Resolution PNG via PowerPoint COM
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
