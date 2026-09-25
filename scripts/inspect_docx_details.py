import docx

doc = docx.Document('FYP-Thesis-AIRecruit360.docx')
print('Total Paragraphs:', len(doc.paragraphs))
print('Total Tables:', len(doc.tables))

for i in [12, 13, 14, 50, 51, 52, 100, 101, 102]:
    if i < len(doc.paragraphs):
        p = doc.paragraphs[i]
        print(f"P{i}: text='{p.text[:60]}'")
        print(f"   align: {p.alignment}, style: {p.style.name}")
        xml = p._p.xml
        print(f"   xml snippet: {xml[:250]}\n")

# Check tables text alignment and cell widths
print("Checking first 5 tables:")
for t_idx, table in enumerate(doc.tables[:5]):
    print(f"\nTable {t_idx}: rows={len(table.rows)}, cols={len(table.columns)}")
    for r_idx, row in enumerate(table.rows[:2]):
        row_str = " | ".join([c.text.strip().replace('\n', ' ')[:25] for c in row.cells])
        print(f"  R{r_idx}: {row_str}")
