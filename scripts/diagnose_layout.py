import docx

doc = docx.Document('FYP-Thesis-AIRecruit360.docx')
print('Total paragraphs:', len(doc.paragraphs))
empty_count = sum(1 for p in doc.paragraphs if not p.text.strip() and len(p._p.xpath('.//a:blip')) == 0)
print('Empty paragraphs count:', empty_count)

print('\n=== Consecutive Empty Paragraphs ===')
empty_streak = 0
for i, p in enumerate(doc.paragraphs):
    if not p.text.strip() and len(p._p.xpath('.//a:blip')) == 0:
        empty_streak += 1
        if empty_streak > 1:
            print(f'Empty streak {empty_streak} at P{i}')
    else:
        empty_streak = 0

print('\n=== Image Dimensions (Inches) ===')
for i, p in enumerate(doc.paragraphs):
    blips = p._p.xpath('.//a:blip')
    if len(blips) > 0:
        extents = p._p.xpath('.//wp:extent')
        caption = doc.paragraphs[i+1].text[:60] if i+1 < len(doc.paragraphs) else ''
        for ext in extents:
            cx_in = int(ext.get('cx', '0')) / 914400.0
            cy_in = int(ext.get('cy', '0')) / 914400.0
            print(f'P{i}: w={cx_in:.2f}", h={cy_in:.2f}" | {caption}')

print('\n=== Hard Page Breaks ===')
for i, p in enumerate(doc.paragraphs):
    if 'lastRenderedPageBreak' in p._p.xml or 'w:br w:type="page"' in p._p.xml:
        print(f'P{i}: Page break found! text="{p.text[:40]}"')
