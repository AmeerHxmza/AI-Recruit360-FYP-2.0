import os
from PIL import Image

diag_dir = ".artifacts/thesis"
for f in sorted(os.listdir(diag_dir)):
    if f.endswith(".png"):
        p = os.path.join(diag_dir, f)
        with Image.open(p) as img:
            w, h = img.size
            ratio = w / h
            # If width was 5.5 inches, what would height be?
            h_at_5_5 = 5.5 / ratio
            # If height was capped at 3.0 inches, what would width be?
            w_at_h3 = 3.0 * ratio
            print(f"{f:<30} {w:>5}x{h:<5} ratio={ratio:.2f} | h@5.5\"={h_at_5_5:.2f}\" | w@h3.0\"={w_at_h3:.2f}\"")
