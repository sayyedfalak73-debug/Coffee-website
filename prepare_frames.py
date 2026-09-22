import os
import sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

SRC_DIR = "/Users/falaknaz/Downloads/ezgif-7946d8b137e886bf-png-split"
OUT_DIR = "/Users/falaknaz/animated website /frames"

def convert_frame(filename):
    if not filename.endswith(".png"):
        return None
    src_path = os.path.join(SRC_DIR, filename)
    out_name = os.path.splitext(filename)[0] + ".webp"
    out_path = os.path.join(OUT_DIR, out_name)
    
    if os.path.exists(out_path):
        return out_name
    
    try:
        with Image.open(src_path) as img:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.save(out_path, "WEBP", quality=88, method=4)
        return out_name
    except Exception as e:
        print(f"Error converting {filename}: {e}", file=sys.stderr)
        return None

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted([f for f in os.listdir(SRC_DIR) if f.startswith("ezgif-frame-") and f.endswith(".png")])
    print(f"Found {len(files)} frames to process.")
    
    with ProcessPoolExecutor(max_workers=6) as executor:
        results = list(executor.map(convert_frame, files))
        
    converted = [r for r in results if r]
    print(f"Successfully converted {len(converted)} frames to WebP in {OUT_DIR}.")
    
    total_size = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in converted)
    print(f"Total optimized size: {total_size / (1024 * 1024):.2f} MB")

if __name__ == "__main__":
    main()
