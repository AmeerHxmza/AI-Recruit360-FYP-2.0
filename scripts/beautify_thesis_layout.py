import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import win32com.client
import os
import re

def beautify_document():
    doc_path = os.path.abspath("FYP-Thesis-AIRecruit360.docx")
    print(f"Loading {doc_path} for layout optimization...")
    doc = docx.Document(doc_path)

    # 1. REMOVE CONSECUTIVE EMPTY PARAGRAPHS
    print("Step 1: Removing blank/orphan paragraphs...")
    body = doc._body._body
    paragraphs_to_remove = []
    
    empty_streak = 0
    for i, p in enumerate(doc.paragraphs):
        # Don't delete title page spacing (first 25 paragraphs)
        if i <= 25:
            continue
        
        has_image = len(p._p.xpath('.//a:blip')) > 0
        has_page_break = len(p._p.xpath('.//w:br[@w:type="page"]')) > 0
        txt = p.text.strip()

        if not txt and not has_image and not has_page_break:
            paragraphs_to_remove.append(p)

    for p in paragraphs_to_remove:
        p_elem = p._p
        if p_elem.getparent() is not None:
            p_elem.getparent().remove(p_elem)

    print(f"Removed {len(paragraphs_to_remove)} blank/empty paragraphs.")

    # 2. OPTIMIZE DIAGRAM & IMAGE SIZES (PREVENT OVERSIZED IMAGES & PAGE OVERFLOW)
    print("Step 2: Resizing and optimizing all diagrams & figures...")
    image_count = 0
    for p in doc.paragraphs:
        blips = p._p.xpath('.//a:blip')
        if len(blips) > 0:
            image_count += 1
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True # Keep image with its caption!

            extents = p._p.xpath('.//wp:extent')
            for ext in extents:
                cx = int(ext.get('cx', '0'))
                cy = int(ext.get('cy', '0'))
                if cx <= 0 or cy <= 0:
                    continue

                w_in = cx / 914400.0
                h_in = cy / 914400.0
                ratio = w_in / h_in

                # University logo on title page
                if image_count == 1:
                    new_w = 1.55
                    new_h = 1.55
                # Square diagrams (UML Use Case, Architecture, ERD, Activities, Sequences):
                elif 0.90 <= ratio <= 1.10:
                    # Scale to 3.6" x 3.6" so it fits alongside text on the page!
                    new_w = 3.60
                    new_h = 3.60
                # Rectangular screenshots (Appendix C UI captures, 1440x1000):
                elif ratio > 1.25:
                    # Scale to 4.5" width, ~3.1" height
                    new_w = 4.50
                    new_h = 4.50 / ratio
                    if new_h > 3.20:
                        new_h = 3.20
                        new_w = 3.20 * ratio
                # Other diagrams
                else:
                    new_w = min(4.50, w_in)
                    new_h = new_w / ratio
                    if new_h > 3.40:
                        new_h = 3.40
                        new_w = 3.40 * ratio

                ext.set('cx', str(int(new_w * 914400)))
                ext.set('cy', str(int(new_h * 914400)))

    print(f"Resized and optimized {image_count} images.")

    # 3. FIX BULLETS, LISTS, AND INDENTATION
    print("Step 3: Harmonizing bullet lists with clean hanging indents and spacing...")
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        p_style = p.style.name if p.style else ""

        is_list = (p_style == 'List Paragraph' or 
                   txt.startswith('•') or 
                   txt.startswith('- ') or 
                   bool(re.match(r'^[0-9]+\.\s+', txt) and len(txt) > 3 and i > 50 and not txt.startswith('1.1') and not txt.startswith('1.2') and not txt.startswith('2.1') and not txt.startswith('3.1') and not txt.startswith('4.1') and not txt.startswith('5.1') and not txt.startswith('6.1') and not txt.startswith('7.1')))

        if is_list and i > 25:
            # Clean up bullet character
            # If starts with bullet glyph or hyphen
            if txt.startswith('•') or txt.startswith('-'):
                # Replace leading symbol and spaces with a clean bullet + tab
                clean_text = re.sub(r'^[•\-\*]\s*', '', txt)
                p.text = f"•\t{clean_text}"
            elif p_style == 'List Paragraph' and not txt.startswith('•') and not re.match(r'^[0-9]+\.', txt):
                p.text = f"•\t{txt}"

            # Set hanging indent formatting
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.left_indent = Inches(0.40)
            p.paragraph_format.first_line_indent = Inches(-0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2.5)
            p.paragraph_format.line_spacing = 1.15

            # Set Times New Roman 12pt on all runs
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.color.rgb = RGBColor(0, 0, 0)

    # 4. ENFORCE KEEP-WITH-NEXT ON ALL HEADINGS AND CAPTIONS
    print("Step 4: Applying keep_with_next on headings and captions to prevent orphan headings...")
    for p in doc.paragraphs:
        txt = p.text.strip()
        p_style = p.style.name if p.style else ""

        is_heading = (p_style in ['Chapter Title', 'Heading 2', 'Heading 3', 'Front Matter Heading'] or
                      txt.startswith('CHAPTER') or
                      bool(re.match(r'^[1-7]\.[0-9]+', txt)) or
                      bool(re.match(r'^[A-C]\.[0-9]+', txt)))

        is_caption = (p_style == 'Caption' or txt.startswith('Figure ') or txt.startswith('Table '))

        if is_heading:
            p.paragraph_format.keep_with_next = True
            if p_style == 'Heading 2':
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(4)
            elif p_style == 'Heading 3':
                p.paragraph_format.space_before = Pt(8)
                p.paragraph_format.space_after = Pt(3)

        if is_caption:
            p.paragraph_format.keep_with_next = False
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(10)

    # 5. BODY PARAGRAPHS SPACING (1.5 line spacing, 5pt space after)
    print("Step 5: Enforcing uniform body paragraph spacing...")
    for i, p in enumerate(doc.paragraphs):
        if i <= 25:
            continue
        txt = p.text.strip()
        p_style = p.style.name if p.style else ""

        is_special = (p_style in ['Chapter Title', 'Heading 2', 'Heading 3', 'Front Matter Heading', 'Caption', 'List Paragraph'] or
                      txt.startswith('CHAPTER') or
                      txt.startswith('Figure ') or
                      txt.startswith('Table ') or
                      txt.startswith('•') or
                      len(p._p.xpath('.//a:blip')) > 0)

        if not is_special and txt:
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(5)
            p.paragraph_format.left_indent = Inches(0)
            p.paragraph_format.first_line_indent = Inches(0)
            for r in p.runs:
                r.font.name = "Times New Roman"
                r.font.size = Pt(12)
                r.font.color.rgb = RGBColor(0, 0, 0)

    print(f"Saving optimized document to {doc_path}...")
    doc.save(doc_path)
    print("Document successfully optimized!")

if __name__ == "__main__":
    beautify_document()
