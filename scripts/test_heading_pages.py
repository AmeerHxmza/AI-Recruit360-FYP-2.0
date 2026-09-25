import win32com.client
import os

docx_path = os.path.abspath("FYP-Thesis-AIRecruit360.docx")
word = win32com.client.Dispatch("Word.Application")
try:
    word.Visible = False
    doc = word.Documents.Open(docx_path)
    
    # wdActiveEndPageNumber = 3
    print("Testing heading page extraction...")
    for p in doc.Paragraphs:
        txt = p.Range.Text.strip()
        if txt.startswith("CHAPTER") or (len(txt) > 3 and txt[:3] in ["1.1", "1.2", "2.1", "3.1", "4.1", "5.1", "6.1", "7.1"]):
            pg = p.Range.Information(3)
            print(f"Page {pg}: {txt[:50]}")
    doc.Close(False)
finally:
    word.Quit()
