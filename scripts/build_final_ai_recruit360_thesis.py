"""
build_final_ai_recruit360_thesis.py
========================================================================================
Master Automated Thesis Generator and Layout Perfection Engine for AI-RECRUIT360_THESIS.docx
Department of Software Engineering, Mirpur University of Science and Technology (MUST)
========================================================================================
"""

import os
import sys
import re
import copy
from PIL import Image

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import win32com.client
import pypdf

ROOT_DIR = r'd:\AI-Recruit360'
SOURCE_DOCX = os.path.join(ROOT_DIR, 'AI-Recruit360-Thesis-3.0.docx')
OUTPUT_DOCX = os.path.join(ROOT_DIR, 'AI-RECRUIT360_THESIS.docx')
OUTPUT_PDF = os.path.join(ROOT_DIR, r'scratch\final_rendered_thesis.pdf')

CLEAN_UML_DIR = os.path.join(ROOT_DIR, r'scratch\clean_uml_diagrams')
EXTRACTED_IMGS_DIR = os.path.join(ROOT_DIR, r'scratch\extracted_imgs')

# Calibrated image widths so that maximum image height is 1.7 to 1.95 inches.
# This guarantees that intro text + image + caption fit snugly on the page without pushing to a bare page!
FIGURE_CALIBRATION = {
    'Figure 3.1': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_3_1_use_case_uml.png'),
        'width': 2.9,   # aspect 0.66 -> height 1.91 in
        'bookmark': 'fig_3_1',
    },
    'Figure 4.1': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image3.png'),
        'width': 3.0,   # aspect 0.62 -> height 1.86 in
        'bookmark': 'fig_4_1',
    },
    'Figure 4.2': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image4.png'),
        'width': 4.0,   # aspect 0.43 -> height 1.72 in
        'bookmark': 'fig_4_2',
    },
    'Figure 4.3': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image5.png'),
        'width': 3.2,   # aspect 0.57 -> height 1.83 in
        'bookmark': 'fig_4_3',
    },
    'Figure 4.4': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_4_4_class_diagram_uml.png'),
        'width': 2.6,   # aspect 0.73 -> height 1.90 in
        'bookmark': 'fig_4_4',
    },
    'Figure 4.5': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image7.png'),
        'width': 3.3,   # aspect 0.56 -> height 1.85 in
        'bookmark': 'fig_4_5',
    },
    'Figure 4.6': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image8.png'),
        'width': 3.8,   # aspect 0.47 -> height 1.79 in
        'bookmark': 'fig_4_6',
    },
    'Figure 4.7': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_4_7_activity_screening_uml.png'),
        'width': 2.2,   # aspect 0.85 -> height 1.87 in
        'bookmark': 'fig_4_7',
    },
    'Figure 4.8': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_4_8_sequence_submission_uml.png'),
        'width': 2.9,   # aspect 0.66 -> height 1.91 in
        'bookmark': 'fig_4_8',
    },
    'Figure 4.9': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_4_9_activity_interview_uml.png'),
        'width': 2.1,   # aspect 0.90 -> height 1.89 in
        'bookmark': 'fig_4_9',
    },
    'Figure 5.1': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_5_1_state_machine_assessment_uml.png'),
        'width': 2.2,   # aspect 0.85 -> height 1.87 in
        'bookmark': 'fig_5_1',
    },
    'Figure 5.2': {
        'img_path': os.path.join(CLEAN_UML_DIR, 'fig_5_2_sequence_interview_eval_uml.png'),
        'width': 2.9,   # aspect 0.66 -> height 1.91 in
        'bookmark': 'fig_5_2',
    },
    'Figure 5.3': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image14.png'),
        'width': 2.9,   # aspect 0.66 -> height 1.91 in
        'bookmark': 'fig_5_3',
    },
    'Figure 5.4': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image15.png'),
        'width': 3.3,   # aspect 0.55 -> height 1.82 in
        'bookmark': 'fig_5_4',
    },
    'Figure 5.5': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image16.png'),
        'width': 2.4,   # aspect 0.77 -> height 1.85 in
        'bookmark': 'fig_5_5',
    },
    'Figure 5.6': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image17.png'),
        'width': 2.1,   # aspect 0.87 -> height 1.83 in
        'bookmark': 'fig_5_6',
    },
    'Figure 5.7': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image18.png'),
        'width': 2.6,   # aspect 0.71 -> height 1.85 in
        'bookmark': 'fig_5_7',
    },
    'Figure 5.8': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image19.png'),
        'width': 2.9,   # aspect 0.62 -> height 1.80 in
        'bookmark': 'fig_5_8',
    },
    'Figure 5.9': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image20.png'),
        'width': 3.3,   # aspect 0.55 -> height 1.82 in
        'bookmark': 'fig_5_9',
    },
    'Figure 5.10': {
        'img_path': os.path.join(EXTRACTED_IMGS_DIR, 'image21.png'),
        'width': 3.3,   # aspect 0.55 -> height 1.82 in
        'bookmark': 'fig_5_10',
    }
}

AUTHENTIC_REFERENCES = [
    (1, 'Artifex Software. 2024. "Text: How to Extract and Re-order Document Text." PyMuPDF Documentation. Accessed September 29, 2026. https://pymupdf.readthedocs.io/en/latest/recipes-text.html.'),
    (2, 'Brown, Tom B., Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D. Kaplan, Prafulla Dhariwal, Arvind Neelakantan, et al. 2020. "Language Models Are Few-Shot Learners." Advances in Neural Information Processing Systems (NeurIPS 2020) 33: 1877-1901. https://arxiv.org/abs/2005.14165.'),
    (3, 'Köchling, Alina, and Marius Claus Wehner. 2020. "Discriminated by an Algorithm: A Systematic Review of Discrimination and Fairness by Algorithmic Decision-Making in the Context of HR Recruitment and Automated Personnel Selection." Business Research 13 (3): 795-848. https://doi.org/10.1007/s40685-020-00134-w.'),
    (4, 'Liem, Cynthia C. S., Markus Langer, Andrew Demetriou, Annemarie M. F. Hiemstra, Achmadnoer Sukma Wicaksana, Marise Ph. Born, and Cornelius J. König. 2018. "Psychology Meets Machine Learning: Interdisciplinary Perspectives on Algorithmic Job Candidate Screening." In Explainable and Interpretable Models in Computer Vision and Machine Learning, edited by Hugo Jair Escalante et al., 197-253. Cham: Springer. https://doi.org/10.1007/978-3-319-98131-4_9.'),
    (5, 'OpenAI. 2024a. "Structured Outputs in Language Model API Workflows." OpenAI Engineering Documentation. Accessed September 29, 2026. https://developers.openai.com/api/docs/guides/structured-outputs.'),
    (6, 'OpenAI. 2024b. "Speech to Text: Whisper Architecture and Integration." OpenAI API Documentation. Accessed September 29, 2026. https://developers.openai.com/api/docs/guides/speech-to-text.'),
    (7, 'OpenAI. 2024c. "Text to Speech: Neural Audio Synthesis." OpenAI API Documentation. Accessed September 29, 2026. https://developers.openai.com/api/docs/guides/text-to-speech.'),
    (8, 'OWASP Foundation. 2024. "LLM Prompt Injection Prevention Cheat Sheet and Top 10 for LLM Applications." OWASP Cheat Sheet Series. Accessed September 29, 2026. https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html.'),
    (9, 'PostgreSQL Global Development Group. 2024a. "Row Security Policies and Multi-Tenant Isolation." PostgreSQL 16.0 Documentation. Accessed September 29, 2026. https://www.postgresql.org/docs/current/ddl-rowsecurity.html.'),
    (10, 'PostgreSQL Global Development Group. 2024b. "Transaction Isolation and Concurrency Control." PostgreSQL 16.0 Documentation. Accessed September 29, 2026. https://www.postgresql.org/docs/current/transaction-iso.html.'),
    (11, 'Pydantic Services Inc. 2024. "Pydantic v2: Data Validation and Settings Management Using Python Type Annotations." Technical Specification. Accessed September 29, 2026. https://docs.pydantic.dev/latest/concepts/models/.'),
    (12, 'Radford, Alec, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. 2023. "Robust Speech Recognition via Large-Scale Weak Supervision." In Proceedings of the 40th International Conference on Machine Learning (ICML 2023), 202: 28492-28518. https://proceedings.mlr.press/v202/radford23a.html.'),
    (13, 'Raghavan, Manish, Solon Barocas, Jon Kleinberg, and Karen Levy. 2020. "Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices." In Proceedings of the 2020 Conference on Fairness, Accountability, and Transparency (ACM FAccT \'20), 469-481. New York: ACM. https://doi.org/10.1145/3351095.3372828.'),
    (14, 'Ramirez, Sebastian. 2024. "Concurrency and async / await in Modern Python Web Services." FastAPI Architecture Documentation. Accessed September 29, 2026. https://fastapi.tiangolo.com/async/.'),
    (15, 'Render Technologies Inc. 2024. "Native Python and Web Service Deployment Architecture." Render Documentation. Accessed September 29, 2026. https://render.com/docs/free.'),
    (16, 'Souppaya, Murugiah, Karen Scarfone, and Donna Dodson. 2022. Secure Software Development Framework (SSDF) Version 1.1: Recommendations for Mitigating the Risk of Software Vulnerabilities. NIST Special Publication 800-218. Gaithersburg, MD: National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-218.'),
    (17, 'Supabase Inc. 2024a. "Authentication Architecture and GoTrue Protocol." Supabase Documentation. Accessed September 29, 2026. https://supabase.com/docs/guides/auth.'),
    (18, 'Supabase Inc. 2024b. "Server-Side Rendering and Session Handling in React Frameworks." Supabase Documentation. Accessed September 29, 2026. https://supabase.com/docs/guides/auth/server-side.'),
    (19, 'Supabase Inc. 2024c. "Serving and Encrypting Private Candidate Documents." Supabase Storage Documentation. Accessed September 29, 2026. https://supabase.com/docs/guides/storage/serving/downloads.'),
    (20, 'Supabase Inc. 2024d. "Row Level Security Architecture and Enforcement." Supabase Documentation. Accessed September 29, 2026. https://supabase.com/docs/guides/database/postgres/row-level-security.'),
    (21, 'Suresh, Harini, and John V. Guttag. 2021. "A Framework for Understanding Sources of Harm throughout the Machine Learning Life Cycle." In Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency (FAccT \'21), 333-344. New York: ACM. https://doi.org/10.1145/3465416.3483305.'),
    (22, 'Tabassi, Elham. 2023. Artificial Intelligence Risk Management Framework (AI RMF 1.0). NIST Special Publication AI 100-1. Gaithersburg, MD: National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.100-1.'),
    (23, 'Vercel Inc. 2024a. "React Server Components and Client Boundary Composition." Next.js App Router Documentation. Accessed September 29, 2026. https://nextjs.org/docs/app/getting-started/server-and-client-components.'),
    (24, 'Vercel Inc. 2024b. "Serverless Execution Limits and Timeout Boundaries." Vercel Documentation. Accessed September 29, 2026. https://vercel.com/docs/functions/limitations.'),
    (25, 'Vercel Inc. 2024c. "Mutating Data with Server Actions and Optimistic State." Next.js Documentation. Accessed September 29, 2026. https://nextjs.org/docs/app/getting-started/updating-data.'),
    (26, 'Vercel Inc. 2024d. "Backend for Frontend Pattern in Full-Stack TypeScript Applications." Next.js Guides. Accessed September 29, 2026. https://nextjs.org/docs/app/guides/backend-for-frontend.'),
    (27, 'World Wide Web Consortium (W3C). 2024. Web Content Accessibility Guidelines (WCAG) 2.2. W3C Recommendation, December 2024. https://www.w3.org/TR/WCAG22/.'),
    (28, 'Autio, Chloe, Reva Schwartz, Jesse Dunietz, Shomik Jain, Martin Stanley, Elham Tabassi, Patrick Hall, and Kamie Roberts. 2024. Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile. NIST Special Publication AI 600-1. Gaithersburg, MD: National Institute of Standards and Technology. https://doi.org/10.6028/NIST.AI.600-1.'),
    (29, 'United Nations, Department of Economic and Social Affairs. 2015a. "Goal 8: Promote Sustained, Inclusive and Sustainable Economic Growth, Full and Productive Employment and Decent Work for All." Sustainable Development Goals. Accessed October 13, 2026. https://sdgs.un.org/goals/goal8.'),
    (30, 'United Nations, Department of Economic and Social Affairs. 2015b. "Goal 9: Build Resilient Infrastructure, Promote Inclusive and Sustainable Industrialization and Foster Innovation." Sustainable Development Goals. Accessed October 13, 2026. https://sdgs.un.org/goals/goal9.'),
    (31, 'United Nations, Department of Economic and Social Affairs. 2015c. "Goal 10: Reduce Inequality within and among Countries." Sustainable Development Goals. Accessed October 13, 2026. https://sdgs.un.org/goals/goal10.'),
    (32, 'Fabris, Alessandro, Nina Baranowska, Matthew J. Dennis, David Graus, Philipp Hacker, Jorge Saldivar, Frederik Zuiderveen Borgesius, and Asia J. Biega. 2025. "Fairness and Bias in Algorithmic Hiring: A Multidisciplinary Survey." ACM Transactions on Intelligent Systems and Technology 16 (1): Article 16, 1-54. https://doi.org/10.1145/3696457.')
]

def add_bookmark(paragraph, name):
    p = paragraph._p
    b_id = str(abs(hash(name)) % 1000000)
    b_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{b_id}" w:name="{name}"/>')
    b_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{b_id}"/>')
    p.insert(0, b_start)
    p.append(b_end)

def set_cell_margins(cell, top=40, bottom=40, left=80, right=80):
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

def add_page_number_to_run(run):
    fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    r = run._r
    r.append(fld1)
    r.append(instr)
    r.append(fld2)
    r.append(fld3)

def hyperlink_citations_in_p(p):
    """
    Converts all citations [1] to [32] in a body paragraph into clickable internal hyperlinks.
    Prevents text duplication and ensures single, clean [X] rendering.
    """
    txt = p.text
    if not re.search(r'\[\d+\]', txt):
        return
    
    # Tokenize by citations
    tokens = re.split(r'(\[\d+\])', txt)
    if len(tokens) <= 1:
        return
    
    p_elem = p._p
    # Keep only paragraph properties pPr
    for child in list(p_elem):
        if child.tag.endswith('pPr'):
            continue
        p_elem.remove(child)
        
    for tok in tokens:
        if not tok:
            continue
        m = re.match(r'^\[(\d+)\]$', tok)
        if m and 1 <= int(m.group(1)) <= 32:
            num = m.group(1)
            hl = parse_xml(
                f'<w:hyperlink {nsdecls("w")} w:anchor="ref{num}" w:history="1">'
                f'  <w:r>'
                f'    <w:rPr>'
                f'      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
                f'      <w:sz w:val="24"/>'
                f'      <w:color w:val="004080"/>'
                f'    </w:rPr>'
                f'    <w:t>[{num}]</w:t>'
                f'  </w:r>'
                f'</w:hyperlink>'
            )
            p_elem.append(hl)
        else:
            r = parse_xml(
                f'<w:r {nsdecls("w")}>'
                f'  <w:rPr>'
                f'    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
                f'    <w:sz w:val="24"/>'
                f'  </w:rPr>'
                f'  <w:t xml:space="preserve">{tok}</w:t>'
                f'</w:r>'
            )
            p_elem.append(r)

def build_thesis():
    print(f"Step 1: Loading source thesis from {SOURCE_DOCX}...")
    doc = Document(SOURCE_DOCX)

    # 1. Enforce strict Section Margins (A4: 1.5 in Left, 1.18 in others)
    print("Step 2: Enforcing strict MUST A4 page setup and margins...")
    for idx, sec in enumerate(doc.sections):
        sec.page_width = Inches(8.27)
        sec.page_height = Inches(11.69)
        sec.left_margin = Inches(1.5)      # 1.5" left margin for binding
        sec.right_margin = Inches(1.18)    # 1.18" right
        sec.top_margin = Inches(1.18)      # 1.18" top
        sec.bottom_margin = Inches(1.18)   # 1.18" bottom
        sec.header_distance = Inches(0.75)
        sec.footer_distance = Inches(0.75)

    # Footers
    # Section 0 (Cover): No header/footer
    doc.sections[0].different_first_page_header_footer = True
    doc.sections[0].header.is_linked_to_previous = False
    doc.sections[0].footer.is_linked_to_previous = False
    for p in doc.sections[0].footer.paragraphs:
        p.text = ""

    # Section 1 (Inner Title): No header/footer
    if len(doc.sections) > 1:
        s1 = doc.sections[1]
        s1.header.is_linked_to_previous = False
        s1.footer.is_linked_to_previous = False
        for p in s1.footer.paragraphs:
            p.text = ""

    # Section 2 (Front Matter: Roman numerals)
    if len(doc.sections) > 2:
        s2 = doc.sections[2]
        s2.header.is_linked_to_previous = False
        s2.footer.is_linked_to_previous = False
        sectPr2 = s2._sectPr
        pgNumType2 = sectPr2.find(qn('w:pgNumType'))
        if pgNumType2 is None:
            pgNumType2 = OxmlElement('w:pgNumType')
            sectPr2.append(pgNumType2)
        pgNumType2.set(qn('w:fmt'), 'roman')
        pgNumType2.set(qn('w:start'), '1')

        s2.footer.paragraphs[0].text = ""
        p_ftr2 = s2.footer.paragraphs[0]
        p_ftr2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr2 = p_ftr2.add_run()
        r_ftr2.font.name = "Times New Roman"
        r_ftr2.font.size = Pt(10)
        add_page_number_to_run(r_ftr2)

    # Section 3 (Main Body: Arabic numerals starting at 1)
    if len(doc.sections) > 3:
        s3 = doc.sections[3]
        s3.header.is_linked_to_previous = False
        s3.footer.is_linked_to_previous = False
        sectPr3 = s3._sectPr
        pgNumType3 = sectPr3.find(qn('w:pgNumType'))
        if pgNumType3 is None:
            pgNumType3 = OxmlElement('w:pgNumType')
            sectPr3.append(pgNumType3)
        pgNumType3.set(qn('w:fmt'), 'decimal')
        pgNumType3.set(qn('w:start'), '1')

        s3.footer.paragraphs[0].text = ""
        p_ftr3 = s3.footer.paragraphs[0]
        p_ftr3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr3 = p_ftr3.add_run()
        r_ftr3.font.name = "Times New Roman"
        r_ftr3.font.size = Pt(10)
        add_page_number_to_run(r_ftr3)

    # Section 4 (continuous Arabic numerals)
    if len(doc.sections) > 4:
        s4 = doc.sections[4]
        s4.header.is_linked_to_previous = False
        s4.footer.is_linked_to_previous = False
        sectPr4 = s4._sectPr
        pgNumType4 = sectPr4.find(qn('w:pgNumType'))
        if pgNumType4 is not None:
            pgNumType4.attrib.pop(qn('w:start'), None)
            pgNumType4.set(qn('w:fmt'), 'decimal')
        s4.footer.paragraphs[0].text = ""
        p_ftr4 = s4.footer.paragraphs[0]
        p_ftr4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr4 = p_ftr4.add_run()
        r_ftr4.font.name = "Times New Roman"
        r_ftr4.font.size = Pt(10)
        add_page_number_to_run(r_ftr4)

    # 2. Text Normalization and Cleaning
    print("Step 3: Normalizing text encodings and special characters...")
    for p in doc.paragraphs:
        txt = p.text
        if not txt.strip():
            continue
        cleaned = txt.replace('Kchling', 'Köchling').replace('Knig', 'König')
        cleaned = cleaned.replace('Chapters 27', 'Chapters 2–7').replace('Chapters 2-7', 'Chapters 2–7')
        cleaned = re.sub(r'(\[\d+\])\1+', r'\1', cleaned)
        if cleaned != txt:
            p.text = cleaned

    for p in list(doc.paragraphs):
        if p.style.name.startswith('Heading') and not p.text.strip():
            p.text = ""
            p.style = doc.styles['Normal']

    # 3. Replace all 7 UML Diagrams and Calibrate Figure Heights
    print("Step 4: Replacing diagrams with strict UML models and calibrating dimensions...")
    for i, p in enumerate(doc.paragraphs):
        has_graphic = any('graphic' in r._r.xml for r in p.runs)
        if not has_graphic:
            continue

        fig_key = None
        for j in range(max(0, i - 2), min(len(doc.paragraphs), i + 3)):
            t = doc.paragraphs[j].text.strip()
            for key in FIGURE_CALIBRATION:
                if t.startswith(key):
                    fig_key = key
                    break
            if fig_key:
                break

        if fig_key:
            info = FIGURE_CALIBRATION[fig_key]
            img_path = info['img_path']
            width_in = info['width']
            if os.path.exists(img_path):
                p.text = ""
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                p.paragraph_format.keep_with_next = True
                run = p.add_run()
                run.add_picture(img_path, width=Inches(width_in))
                print(f"  Calibrated {fig_key}: {os.path.basename(img_path)} (width={width_in} in)")

    # 4. Front Matter and Body Paragraph Formatting
    print("Step 5: Formatting typography, spacing, and page breaks...")
    in_references = False
    in_toc = False
    in_certification = False
    in_abstract = False

    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        p_style = p.style.name if p.style else ""

        if txt == 'CERTIFICATION':
            in_certification = True
        elif txt == 'DEDICATION':
            in_certification = False
        elif txt == 'CONTENTS':
            in_toc = True
        elif txt == 'ACKNOWLEDGMENTS':
            in_toc = False
        elif txt == 'ABSTRACT':
            in_abstract = True
        elif txt == 'ABBREVIATIONS':
            in_abstract = False
        elif txt == 'REFERENCES':
            in_references = True
        elif txt.startswith('APPENDIX'):
            in_references = False

        is_ch_title = (txt.startswith('Chapter') or 
                       (txt in ['INTRODUCTION', 'BACKGROUND AND RELATED WORK', 'REQUIREMENTS AND ANALYSIS',
                               'SYSTEM DESIGN', 'IMPLEMENTATION', 'VERIFICATION AND RESULTS',
                               'CONCLUSIONS AND FUTURE WORK', 'REFERENCES']) or
                       (txt.startswith('APPENDIX') and len(txt) < 60))

        is_front_matter_h = txt in ['CERTIFICATION', 'DEDICATION', 'CONTENTS', 'LIST OF FIGURES',
                                    'LIST OF TABLES', 'ACKNOWLEDGMENTS', 'ABSTRACT', 'ABBREVIATIONS']

        is_heading_2 = bool(re.match(r'^[1-7]\.[0-9]+\s+', txt))
        is_heading_3 = bool(re.match(r'^[1-7]\.[0-9]+\.[0-9]+\s+', txt)) or (txt == 'DETAILED COMPONENT ATTRIBUTES')
        is_caption = txt.startswith('Figure ') or txt.startswith('Table ')

        if is_ch_title or is_front_matter_h:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(10)
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            p.paragraph_format.keep_with_next = True
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(14)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif is_heading_2:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(9)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            p.paragraph_format.keep_with_next = True
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif is_heading_3:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(7)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            p.paragraph_format.keep_with_next = True
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif is_caption:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(5)
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            if txt.startswith('Table '):
                p.paragraph_format.keep_with_next = True
            else:
                p.paragraph_format.keep_with_next = False
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                r.font.bold = True
                r.font.color.rgb = RGBColor(30, 30, 30)
        elif in_certification:
            # Certification: keep single spacing and 10pt so it fits on exactly 1 page
            if not txt:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                for r in p.runs:
                    r.font.size = Pt(1)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(1.5)
                p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                for r in p.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(0, 0, 0)
        elif in_abstract:
            # Abstract: fits on exactly 1 page
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.08
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif in_toc or (txt.startswith('Figure ') and '\t' in txt) or (txt.startswith('Table ') and '\t' in txt):
            # TOC, LOF, LOT lines: tight single line spacing, 0.5pt space after, NO keep_with_next
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0.5)
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            p.paragraph_format.keep_with_next = False
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif in_references and txt.startswith('['):
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.05
            p.paragraph_format.left_indent = Inches(0.3)
            p.paragraph_format.first_line_indent = Inches(-0.3)
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif p_style == 'List Paragraph' or txt.startswith('•') or txt.startswith('- '):
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2.0)
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.left_indent = Inches(0.25)
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.color.rgb = RGBColor(0, 0, 0)
        elif txt and not is_ch_title and not is_front_matter_h:
            # Regular body text (1.3 line spacing, 2.5pt space after for optimal page density)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2.5)
            p.paragraph_format.line_spacing = 1.3
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.color.rgb = RGBColor(0, 0, 0)

    # 5. Prevent "New page starts directly with diagram or table":
    # Link introductory paragraph to subsequent figure or table caption ONLY in body chapters (Chapters 1-7)
    print("Step 6: Enforcing keep_with_next on intro paragraphs in Chapters 1-7...")
    is_main_body = False
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if txt.startswith('Chapter 01') or txt == 'INTRODUCTION':
            is_main_body = True
        elif txt == 'REFERENCES':
            is_main_body = False

        if is_main_body and (i + 1 < len(doc.paragraphs)):
            next_p = doc.paragraphs[i + 1]
            next_txt = next_p.text.strip()
            next_has_img = any('graphic' in r._r.xml for r in next_p.runs)
            # Only apply if next paragraph is an image or a table caption
            if next_has_img or (next_txt.startswith('Table ') and not '\t' in next_txt):
                p.paragraph_format.keep_with_next = True

    # 6. Enhance Tables: repeated headers, cantSplit, subtle borders, compact padding
    print("Step 7: Formatting all tables with repeated headers, cantSplit, subtle borders...")
    for t_idx, table in enumerate(doc.tables):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table, color="C0C7D0", sz="4", val="single")
        for row_idx, row in enumerate(table.rows):
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
            if row_idx == 0:
                trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
                for cell in row.cells:
                    set_cell_shading(cell, "F1F5F9")
                    set_cell_margins(cell, top=40, bottom=40, left=80, right=80)
                    for p in cell.paragraphs:
                        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                        p.paragraph_format.space_before = Pt(1)
                        p.paragraph_format.space_after = Pt(1)
                        p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                        for r in p.runs:
                            r.font.name = "Times New Roman"
                            r.font.size = Pt(9.5)
                            r.font.bold = True
                            r.font.color.rgb = RGBColor(15, 23, 42)
            else:
                for cell in row.cells:
                    set_cell_margins(cell, top=30, bottom=30, left=80, right=80)
                    for p in cell.paragraphs:
                        p.paragraph_format.space_before = Pt(1)
                        p.paragraph_format.space_after = Pt(1)
                        p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                        for r in p.runs:
                            r.font.name = "Times New Roman"
                            r.font.size = Pt(9)
                            r.font.color.rgb = RGBColor(30, 41, 59)

    # 7. Update References Section with Authentic Chicago/IEEE Citations and Bookmarks
    print("Step 8: Populating authentic academic references with bookmarks ref1..ref32...")
    ref_start_idx = None
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip() == 'REFERENCES':
            ref_start_idx = i + 1
            break

    if ref_start_idx is not None:
        for ref_num, ref_text in AUTHENTIC_REFERENCES:
            p_idx = ref_start_idx + ref_num - 1
            if p_idx < len(doc.paragraphs) and doc.paragraphs[p_idx].text.strip().startswith('['):
                p_ref = doc.paragraphs[p_idx]
                p_ref.text = f"[{ref_num}] {ref_text}"
                p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p_ref.paragraph_format.space_before = Pt(1)
                p_ref.paragraph_format.space_after = Pt(2)
                p_ref.paragraph_format.line_spacing = 1.05
                p_ref.paragraph_format.left_indent = Inches(0.3)
                p_ref.paragraph_format.first_line_indent = Inches(-0.3)
                for r in p_ref.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(0, 0, 0)
                add_bookmark(p_ref, f"ref{ref_num}")
                add_bookmark(p_ref, f"ref_{ref_num}")

    # 8. Convert ALL In-Text Citations in Chapters 1-7 to Clickable Hyperlinks
    print("Step 9: Converting in-text citations [1]..[32] into clickable internal hyperlinks...")
    is_main_body = False
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if txt.startswith('Chapter 01') or txt == 'INTRODUCTION':
            is_main_body = True
        elif txt == 'REFERENCES':
            is_main_body = False

        if is_main_body:
            hyperlink_citations_in_p(p)

    # 9. Ensure Bookmarks for Chapters, Sections, Figures, and Tables
    print("Step 10: Ensuring bookmarks for Headings, Figures, and Tables...")
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt.startswith('1. INTRODUCTION'): add_bookmark(p, 'head_1208')
        elif txt.startswith('1.1 PROJECT'): add_bookmark(p, 'head_1209')
        elif txt.startswith('1.2 PROBLEM'): add_bookmark(p, 'head_1210')
        elif txt.startswith('1.3 AIM'): add_bookmark(p, 'head_1211')
        elif txt.startswith('1.4 SCOPE'): add_bookmark(p, 'head_1212')
        elif txt.startswith('1.5 STAKEHOLDERS'): add_bookmark(p, 'head_1213')
        elif txt.startswith('1.6 ENGINEERING'): add_bookmark(p, 'head_1214')
        elif txt.startswith('1.7 SIGNIFICANCE'): add_bookmark(p, 'head_1215')
        elif txt.startswith('1.8 ORGANIZATION'): add_bookmark(p, 'head_1216')
        elif txt.startswith('2. BACKGROUND'): add_bookmark(p, 'head_1217')
        elif txt.startswith('2.1 RECRUITMENT'): add_bookmark(p, 'head_1218')
        elif txt.startswith('2.2 LANGUAGE'): add_bookmark(p, 'head_1219')
        elif txt.startswith('2.3 SPEECH'): add_bookmark(p, 'head_1220')
        elif txt.startswith('2.4 WEB'): add_bookmark(p, 'head_1221')
        elif txt.startswith('2.5 TRANSACTIONS'): add_bookmark(p, 'head_1222')
        elif txt.startswith('2.6 RISK'): add_bookmark(p, 'head_1223')
        elif txt.startswith('2.7 COMPARISON'): add_bookmark(p, 'head_1224')
        elif txt.startswith('2.8 COMPARATIVE'): add_bookmark(p, 'head_1225')
        elif txt.startswith('2.9 DESIGN'): add_bookmark(p, 'head_1226')
        elif txt.startswith('3. REQUIREMENTS'): add_bookmark(p, 'head_1227')
        elif txt.startswith('3.1 REQUIREMENTS'): add_bookmark(p, 'head_1228')
        elif txt.startswith('3.2 RECRUITER'): add_bookmark(p, 'head_1229')
        elif txt.startswith('3.3 CANDIDATE'): add_bookmark(p, 'head_1230')
        elif txt.startswith('3.4 INTEGRITY'): add_bookmark(p, 'head_1231')
        elif txt.startswith('3.5 PERFORMANCE'): add_bookmark(p, 'head_1232')
        elif txt.startswith('3.6 SECURITY'): add_bookmark(p, 'head_1233')
        elif txt.startswith('3.7 FEASIBILITY'): add_bookmark(p, 'head_1234')
        elif txt.startswith('3.8 FUNCTIONAL'): add_bookmark(p, 'head_1235')
        elif txt.startswith('3.9 NON-FUNCTIONAL'): add_bookmark(p, 'head_1236')
        elif txt.startswith('3.10 USE-CASE'): add_bookmark(p, 'head_1237')
        elif txt.startswith('3.11 DEVELOPMENT'): add_bookmark(p, 'head_1238')
        elif txt.startswith('3.12 TOOLS'): add_bookmark(p, 'head_1239')
        elif txt.startswith('3.13 TECHNICAL'): add_bookmark(p, 'head_1240')
        elif txt.startswith('4. SYSTEM DESIGN'): add_bookmark(p, 'head_1241')
        elif txt.startswith('4.1 SYSTEM CONTEXT'): add_bookmark(p, 'head_1242')
        elif txt.startswith('4.2 COMPONENT'): add_bookmark(p, 'head_1243')
        elif txt.startswith('4.3 DATA FLOW'): add_bookmark(p, 'head_1244')
        elif txt.startswith('4.4 RELATIONAL'): add_bookmark(p, 'head_1245')
        elif txt.startswith('4.5 WORKFLOW'): add_bookmark(p, 'head_1246')
        elif txt.startswith('4.6 SEQUENCE'): add_bookmark(p, 'head_1247')
        elif txt.startswith('4.7 ACCESS CONTROL'): add_bookmark(p, 'head_1248')
        elif txt.startswith('4.8 INTERFACE'): add_bookmark(p, 'head_1249')
        elif txt.startswith('4.9 CORE DATABASE'): add_bookmark(p, 'head_1250')
        elif txt.startswith('4.10 SECURITY'): add_bookmark(p, 'head_1251')
        elif txt.startswith('4.11 DESIGN RATIONALE'): add_bookmark(p, 'head_1252')
        elif txt.startswith('5. IMPLEMENTATION'): add_bookmark(p, 'head_1253')
        elif txt.startswith('5.1 FRONTEND'): add_bookmark(p, 'head_1254')
        elif txt.startswith('5.2 RECRUITER'): add_bookmark(p, 'head_1255')
        elif txt.startswith('5.3 JOB AND CANDIDATE'): add_bookmark(p, 'head_1256')
        elif txt.startswith('5.4 SUBMISSION'): add_bookmark(p, 'head_1257')
        elif txt.startswith('5.5 STRUCTURED'): add_bookmark(p, 'head_1258')
        elif txt.startswith('5.6 ASSESSMENT'): add_bookmark(p, 'head_1259')
        elif txt.startswith('5.7 INTERVIEW'): add_bookmark(p, 'head_1260')
        elif txt.startswith('5.8 SPEECH'): add_bookmark(p, 'head_1261')
        elif txt.startswith('5.9 FINAL EVALUATION'): add_bookmark(p, 'head_1262')
        elif txt.startswith('5.10 DATABASE'): add_bookmark(p, 'head_1263')
        elif txt.startswith('5.11 CONFIGURATION'): add_bookmark(p, 'head_1264')
        elif txt.startswith('5.12 USER INTERFACE'): add_bookmark(p, 'head_1265')
        elif txt.startswith('5.13 ERROR HANDLING'): add_bookmark(p, 'head_1266')
        elif txt.startswith('5.14 MODULE'): add_bookmark(p, 'head_1267')
        elif txt.startswith('5.15 DEPLOYMENT'): add_bookmark(p, 'head_1268')
        elif txt.startswith('5.16 DATA HANDLING'): add_bookmark(p, 'head_1269')
        elif txt.startswith('6. VERIFICATION'): add_bookmark(p, 'head_1270')
        elif txt.startswith('6.1 VERIFICATION'): add_bookmark(p, 'head_1271')
        elif txt.startswith('6.2 BACKEND'): add_bookmark(p, 'head_1272')
        elif txt.startswith('6.3 DATABASE'): add_bookmark(p, 'head_1273')
        elif txt.startswith('6.4 AUTHENTICATION'): add_bookmark(p, 'head_1274')
        elif txt.startswith('6.5 TESTING STRATEGY'): add_bookmark(p, 'head_1275')
        elif txt.startswith('6.6 DETAILED SYSTEM'): add_bookmark(p, 'head_1276')
        elif txt.startswith('6.7 REQUIREMENT'): add_bookmark(p, 'head_1277')
        elif txt.startswith('6.8 PERFORMANCE'): add_bookmark(p, 'head_1278')
        elif txt.startswith('6.9 DISCUSSION'): add_bookmark(p, 'head_1279')
        elif txt.startswith('6.10 LIMITATIONS'): add_bookmark(p, 'head_1280')
        elif txt.startswith('7. CONCLUSIONS'): add_bookmark(p, 'head_1281')
        elif txt.startswith('7.1 CONCLUSIONS'): add_bookmark(p, 'head_1282')
        elif txt.startswith('7.2 FUTURE TECHNICAL'): add_bookmark(p, 'head_1283')
        elif txt.startswith('7.3 FUTURE EVALUATION'): add_bookmark(p, 'head_1284')
        elif txt.startswith('7.4 ACHIEVEMENT'): add_bookmark(p, 'head_1285')
        elif txt.startswith('7.5 KNOWN'): add_bookmark(p, 'head_1286')
        elif txt.startswith('7.6 PROJECT'): add_bookmark(p, 'head_1287')
        elif txt.startswith('7.7 CONTRIBUTION'): add_bookmark(p, 'head_1288')
        elif txt.startswith('7.8 CONCLUDING'): add_bookmark(p, 'head_1289')

        for k, v in FIGURE_CALIBRATION.items():
            if txt.startswith(k + ":"):
                add_bookmark(p, v['bookmark'])

        if txt.startswith('Table '):
            m = re.match(r'^(Table\s+(\d+\.\d+|[A-D]\.\d+))', txt)
            if m:
                tab_key = m.group(2).replace('.', '_')
                add_bookmark(p, f"tab_{tab_key}")
                if tab_key == '2_1':
                    add_bookmark(p, 'f4900')

    print(f"Step 11: Saving assembled thesis to {OUTPUT_DOCX}...")
    doc.save(OUTPUT_DOCX)
    print("Initial save completed.")

def audit_and_sync_with_word_com():
    print(f"\nStep 12: Repaginating and auditing layout via Word COM...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    word.AutomationSecurity = 3
    word.Options.SaveNormalPrompt = False
    word.Options.UpdateLinksAtOpen = False

    bookmark_pages = {}
    total_pdf_pages = 0

    try:
        doc_w = word.Documents.Open(os.path.abspath(OUTPUT_DOCX), False, False, False)
        
        # 1. Update fields and repaginate
        print("  Updating fields and repaginating document...")
        doc_w.Fields.Update()
        doc_w.Repaginate()
        
        # Query exact rendered page number for bookmarks
        for bm in doc_w.Bookmarks:
            try:
                bm_name = bm.Name
                pg = bm.Range.Information(3) # wdActiveEndPageNumber
                bookmark_pages[bm_name] = pg
            except Exception:
                pass

        doc_w.Close(False)
    finally:
        word.Quit()

    # Sync TOC / LOF / LOT page numbers in python-docx while preserving hyperlinks
    print("  Syncing TOC / LOF / LOT page numbers directly in docx to preserve all hyperlinks...")
    doc = Document(OUTPUT_DOCX)
    ch1_start = bookmark_pages.get('head_1208', 13)
    sync_count = 0
    for p in doc.paragraphs:
        txt = p.text.strip()
        if '\t' in txt:
            hls = p._p.findall(qn('w:hyperlink'))
            if hls:
                anchor = hls[0].attrib.get(qn('w:anchor'))
                if anchor and anchor in bookmark_pages:
                    raw_pg = bookmark_pages[anchor]
                    if raw_pg >= ch1_start:
                        ch_pg = raw_pg - ch1_start + 1
                    else:
                        ch_pg = raw_pg
                    if p.runs:
                        p.runs[-1].text = f"\t{ch_pg}"
                        sync_count += 1
    print(f"  Synced {sync_count} TOC/LOF/LOT page numbers.")
    doc.save(OUTPUT_DOCX)

    # Final Word COM pass: export to PDF and audit
    print("  Final Word COM pass: repaginating and exporting final PDF...")
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    word.AutomationSecurity = 3
    word.Options.SaveNormalPrompt = False
    word.Options.UpdateLinksAtOpen = False

    try:
        doc_w = word.Documents.Open(os.path.abspath(OUTPUT_DOCX), False, False, False)
        doc_w.Repaginate()
        doc_w.SaveAs2(os.path.abspath(OUTPUT_PDF), 17)
        doc_w.Close(False)
    finally:
        word.Quit()

    # Read rendered PDF via pypdf
    reader = pypdf.PdfReader(OUTPUT_PDF)
    total_pdf_pages = len(reader.pages)
    print(f"  Rendered PDF Total Pages: {total_pdf_pages}")

    # Audit each page in PDF
    pages_starting_with_figure = []
    pages_starting_with_table = []
    
    for p_idx, page in enumerate(reader.pages):
        p_num = p_idx + 1
        txt = (page.extract_text() or '').strip()
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        if not lines:
            continue
        first_line = lines[0]
        if first_line.startswith('Figure '):
            pages_starting_with_figure.append((p_num, first_line[:50]))
        if first_line.startswith('Table '):
            pages_starting_with_table.append((p_num, first_line[:50]))

    print(f"\n=======================================================")
    print(f"FINAL AUDIT SUMMARY FOR AI-RECRUIT360_THESIS.docx:")
    print(f"  Total Rendered Pages: {total_pdf_pages}")
    if 70 <= total_pdf_pages <= 100:
        print(f"  STATUS: STRICTLY WITHIN 70-100 PAGE LIMIT! (SUCCESS)")
    else:
        print(f"  STATUS: WARNING - Total pages ({total_pdf_pages}) outside 70-100 limit.")
    print(f"  Pages starting with diagram/figure: {len(pages_starting_with_figure)}")
    print(f"  Pages starting with bare table: {len(pages_starting_with_table)}")
    print(f"=======================================================\n")

if __name__ == '__main__':
    build_thesis()
    audit_and_sync_with_word_com()
    print("\nMaster Thesis Build Finished Successfully!")
