import win32com.client
import os
import sys
import time
import shutil

t0 = time.time()
input_path = os.path.abspath("Thesis.docx")
temp_output_path = os.path.abspath("Thesis_updated_tmp.docx")

print(f"[{time.time()-t0:.1f}s] Starting Word COM update on {input_path}...")
sys.stdout.flush()

word = win32com.client.Dispatch("Word.Application")
try:
    word.Visible = False
    word.DisplayAlerts = 0  # wdAlertsNone

    print(f"[{time.time()-t0:.1f}s] Opening document...")
    sys.stdout.flush()
    doc = word.Documents.Open(input_path, ConfirmConversions=False, ReadOnly=False, AddToRecentFiles=False)
    
    print(f"[{time.time()-t0:.1f}s] Document opened! Total pages: {doc.ComputeStatistics(2)}")
    print(f"[{time.time()-t0:.1f}s] TOC count: {doc.TablesOfContents.Count}, TOF count: {doc.TablesOfFigures.Count}")
    sys.stdout.flush()

    # Update all fields in document body
    print(f"[{time.time()-t0:.1f}s] Updating doc.Fields...")
    sys.stdout.flush()
    doc.Fields.Update()

    # Update each TOC
    for i in range(1, doc.TablesOfContents.Count + 1):
        print(f"[{time.time()-t0:.1f}s] Updating TableOfContents({i})...")
        sys.stdout.flush()
        doc.TablesOfContents(i).Update()

    # Update each TOF (Tables of Figures / Tables)
    for i in range(1, doc.TablesOfFigures.Count + 1):
        print(f"[{time.time()-t0:.1f}s] Updating TableOfFigures({i})...")
        sys.stdout.flush()
        doc.TablesOfFigures(i).Update()

    print(f"[{time.time()-t0:.1f}s] Recomputing pages: {doc.ComputeStatistics(2)}")
    print(f"[{time.time()-t0:.1f}s] Saving to {temp_output_path}...")
    sys.stdout.flush()
    doc.SaveAs2(temp_output_path, FileFormat=12) # 12 = wdFormatXMLDocument (.docx)
    print(f"[{time.time()-t0:.1f}s] Saved successfully!")
    sys.stdout.flush()
    doc.Close(False)
finally:
    word.Quit()
    print(f"[{time.time()-t0:.1f}s] Word closed cleanly.")
    sys.stdout.flush()

if os.path.exists(temp_output_path):
    print(f"Replacing {input_path} with {temp_output_path}...")
    shutil.move(temp_output_path, input_path)
    print("Done! Thesis.docx updated with all real page numbers.")
