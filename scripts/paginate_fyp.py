import win32com.client
import os
import sys
import time

t0 = time.time()
docx_path = os.path.abspath("Thesis-FYP.docx")
tmp_path = os.path.abspath("Thesis-FYP_paginated.docx")

print(f"[{time.time()-t0:.1f}s] Starting Word COM pagination on {docx_path}...")
sys.stdout.flush()

word = win32com.client.Dispatch("Word.Application")
try:
    word.Visible = False
    word.DisplayAlerts = 0

    print(f"[{time.time()-t0:.1f}s] Opening document...")
    sys.stdout.flush()
    doc = word.Documents.Open(docx_path, ConfirmConversions=False, ReadOnly=False, AddToRecentFiles=False)

    pages_initial = doc.ComputeStatistics(2)
    print(f"[{time.time()-t0:.1f}s] Document opened! Initial page count: {pages_initial}")
    print(f"[{time.time()-t0:.1f}s] TablesOfContents count: {doc.TablesOfContents.Count}")
    print(f"[{time.time()-t0:.1f}s] TablesOfFigures count: {doc.TablesOfFigures.Count}")
    sys.stdout.flush()

    print(f"[{time.time()-t0:.1f}s] Updating document fields...")
    sys.stdout.flush()
    doc.Fields.Update()

    for i in range(1, doc.TablesOfContents.Count + 1):
        print(f"[{time.time()-t0:.1f}s] Updating TableOfContents({i})...")
        sys.stdout.flush()
        doc.TablesOfContents(i).Update()

    for i in range(1, doc.TablesOfFigures.Count + 1):
        print(f"[{time.time()-t0:.1f}s] Updating TableOfFigures({i})...")
        sys.stdout.flush()
        doc.TablesOfFigures(i).Update()

    pages_final = doc.ComputeStatistics(2)
    print(f"[{time.time()-t0:.1f}s] Recomputed final page count: {pages_final}")
    sys.stdout.flush()

    print(f"[{time.time()-t0:.1f}s] Saving to {tmp_path}...")
    sys.stdout.flush()
    doc.SaveAs2(tmp_path, FileFormat=12) # 12 = wdFormatXMLDocument (.docx)
    print(f"[{time.time()-t0:.1f}s] Saved successfully!")
    sys.stdout.flush()
    doc.Close(False)
finally:
    word.Quit()
    print(f"[{time.time()-t0:.1f}s] Word quit cleanly.")
    sys.stdout.flush()

import shutil
if os.path.exists(tmp_path):
    print(f"Replacing {docx_path} with {tmp_path}...")
    shutil.move(tmp_path, docx_path)
    print("Done! Thesis-FYP.docx is fully paginated and updated.")
