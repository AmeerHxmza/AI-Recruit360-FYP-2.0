import docx

doc = docx.Document('FYP-Thesis-AIRecruit360.docx')
unusual_chars = {}
for p_idx, p in enumerate(doc.paragraphs):
    for ch in p.text:
        code = ord(ch)
        # standard ascii is 32-126, plus newline/tab
        if code not in [9, 10, 13] and not (32 <= code <= 126):
            if code not in unusual_chars:
                unusual_chars[code] = (ch, f"U+{code:04X}", 0, p_idx, p.text[:40])
            else:
                c, u, count, first_p, sample = unusual_chars[code]
                unusual_chars[code] = (c, u, count + 1, first_p, sample)

print(f"Total unusual unicode characters: {len(unusual_chars)}")
for code, (c, u, count, first_p, sample) in sorted(unusual_chars.items()):
    print(f"  {u} ('{c}'): count={count+1}, first in P{first_p}: {repr(sample)}")
