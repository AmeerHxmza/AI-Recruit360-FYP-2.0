import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = docx.Document("FYP-Thesis-AIRecruit360.docx")

# Enforce default Normal style
style_normal = doc.styles['Normal']
style_normal.font.name = 'Times New Roman'
style_normal.font.size = Pt(12)
style_normal.paragraph_format.line_spacing = 1.5
style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
style_normal.paragraph_format.space_after = Pt(6)

# Also ensure on r.font.name across all runs in body paragraphs
for i, p in enumerate(doc.paragraphs):
    if i > 25 and p.text.strip():
        # if normal or list
        if p.style.name in ['Normal', 'List Paragraph', 'normal']:
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            for r in p.runs:
                r.font.name = 'Times New Roman'
                if not r.font.size:
                    r.font.size = Pt(12)

doc.save("FYP-Thesis-AIRecruit360.docx")
print("Enforced Normal style and run fonts on FYP-Thesis-AIRecruit360.docx!")
