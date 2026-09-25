import win32com.client
import os

docx_path = os.path.abspath("FYP-Thesis-AIRecruit360.docx")
word = win32com.client.Dispatch("Word.Application")
try:
    word.Visible = False
    doc = word.Documents.Open(docx_path)
    pages = doc.ComputeStatistics(2)
    print(f"Total pages: {pages}")
    print(f"TOC count: {doc.TablesOfContents.Count}")
    print(f"TOF count: {doc.TablesOfFigures.Count}")
    doc.Close(False)
finally:
    word.Quit()
