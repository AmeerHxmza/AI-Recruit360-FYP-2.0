import win32com.client
import os

docx_path = os.path.abspath("FYP-Thesis-AIRecruit360.docx")
word = win32com.client.Dispatch("Word.Application")
try:
    word.Visible = False
    doc = word.Documents.Open(docx_path)
    print("Testing adjusted page numbers (Information(1))...")
    for p in doc.Paragraphs:
        txt = p.Range.Text.strip()
        if txt.startswith("CHAPTER") or (len(txt) > 3 and txt[:3] in ["1.1", "2.1", "3.1", "4.1", "5.1", "6.1", "7.1"]):
            pg_adj = p.Range.Information(1)
            pg_abs = p.Range.Information(3)
            print(f"Adjusted: {pg_adj} | Absolute: {pg_abs} | {txt[:40]}")
    doc.Close(False)
finally:
    word.Quit()
