from PIL import Image
import os

IMG_PATH = "/Users/falaknaz/.gemini/antigravity-ide/brain/471533fa-ee00-46bc-8ebf-b2146fce2f3e/.user_uploaded/media_1790067194767.png"
OUT_DIR = "/Users/falaknaz/animated website /assets"

img = Image.open(IMG_PATH)
os.makedirs(OUT_DIR, exist_ok=True)

# 4 card images
crops = {
    "menu_espresso.png": (106, 283, 234, 397),
    "menu_latte.png": (247, 283, 372, 397),
    "menu_coldbrew.png": (385, 283, 508, 397),
    "menu_coffee.png": (523, 283, 645, 397)
}

for name, box in crops.items():
    cropped = img.crop(box)
    # Enhance resolution for crisp display
    cropped = cropped.resize((cropped.width * 2, cropped.height * 2), Image.Resampling.LANCZOS)
    out_path = os.path.join(OUT_DIR, name)
    cropped.save(out_path)
    print(f"Saved {out_path} ({cropped.size})")

print("All card images cropped and saved successfully!")
