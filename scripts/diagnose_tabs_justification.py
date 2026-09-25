import docx

doc = docx.Document('FYP-Thesis-AIRecruit360.docx')

print("Analyzing paragraphs formatting and characters...")
tab_issues = 0
space_issues = 0
for idx, p in enumerate(doc.paragraphs):
    # Check text
    t = p.text
    if '\t' in t:
        tab_issues += 1
        print(f"Tab in P{idx}: {repr(t[:40])}")
    # Check pPr
    pPr = p._p.pPr
    if pPr is not None:
        # Check tabs
        tabs = pPr.xpath('.//w:tabs')
        if tabs:
            print(f"w:tabs in P{idx}")
        # Check indents
        ind = pPr.xpath('.//w:ind')
        if ind:
            w_left = ind[0].get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}left')
            w_hanging = ind[0].get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hanging')
            # if negative or large hanging indent
    for r in p.runs:
        rPr = r._r.rPr
        if rPr is not None:
            # check w:spacing
            sp = rPr.xpath('.//w:spacing')
            if sp:
                val = sp[0].get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                print(f"w:spacing in P{idx}: {val}")
            w_w = rPr.xpath('.//w:w')
            if w_w:
                print(f"w:w (scaling) in P{idx}")
            # check non-breaking spaces
            if '\u00a0' in r.text:
                space_issues += 1

print(f"Total tab issues: {tab_issues}, space issues (nbsp): {space_issues}")
