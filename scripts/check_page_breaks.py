import docx

doc = docx.Document('FYP-THESIS.docx')

print("=== CHECKING ALL PAGE BREAKS IN FYP-THESIS.docx ===")
for i, p in enumerate(doc.paragraphs):
    # Check for <w:br w:type="page"/>
    has_page_br = len(p._p.xpath('.//w:br[@w:type="page"]')) > 0
    # Check paragraph format page_break_before
    pbb = p.paragraph_format.page_break_before
    if has_page_br or pbb:
        print(f"P{i} [pbb={pbb}, has_br={has_page_br}]: '{p.text[:60]}'")
