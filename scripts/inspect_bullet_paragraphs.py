import docx

doc = docx.Document("FYP-Thesis-AIRecruit360.docx")

print("=== SAMPLE BULLET PARAGRAPHS ===")
for i in range(85, 110):
    p = doc.paragraphs[i]
    if p.text.strip():
        print(f"P{i} [{p.style.name}]: text='{p.text[:60]}' | indent={p.paragraph_format.left_indent} | spacing={p.paragraph_format.space_after}")
