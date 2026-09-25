import docx

doc = docx.Document('FYP-THESIS.docx')
for t_idx, t in enumerate(doc.tables):
    header = ' | '.join(c.text.strip() for c in t.rows[0].cells)
    print(f"Table {t_idx} ({len(t.rows)}x{len(t.columns)}): header='{header[:70]}'")
