import docx

doc = docx.Document('FYP-THESIS.docx')

print("=== CHECKING BULLET CHARACTERS ===")
for i in range(180, 205):
    p = doc.paragraphs[i]
    if p.text.strip():
        first_chars = [f"{c} (U+{ord(c):04X})" for c in p.text[:5]]
        print(f"P{i}: {' '.join(first_chars)} | text='{p.text[:40]}'")
