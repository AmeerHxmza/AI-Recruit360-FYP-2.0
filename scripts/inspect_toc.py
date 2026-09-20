import docx

doc = docx.Document('Thesis.docx')
for i in range(35, 43):
    p = doc.paragraphs[i]
    print(f"P{i} [{p.style.name}]: text='{p.text}'")
    print(f"XML: {p._p.xml}\n")
