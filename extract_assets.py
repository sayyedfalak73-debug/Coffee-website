from PIL import Image
import os

IMG_PATH = "/Users/falaknaz/.gemini/antigravity-ide/brain/471533fa-ee00-46bc-8ebf-b2146fce2f3e/.user_uploaded/media_1790069150589.jpg"
OUT_DIR = "/Users/falaknaz/animated website /assets"

os.makedirs(OUT_DIR, exist_ok=True)
img = Image.open(IMG_PATH)

crops = {
    "drink_espresso.png": (75, 558, 172, 636),
    "drink_iced.png": (188, 558, 284, 636),
    "drink_fav.png": (300, 558, 394, 636),
    "drink_organic.png": (410, 558, 506, 636),
    "promo_banner.png": (0, 750, 578, 868)
}

for name, box in crops.items():
    cropped = img.crop(box)
    cropped = cropped.resize((cropped.width * 2, cropped.height * 2), Image.Resampling.LANCZOS)
    out_path = os.path.join(OUT_DIR, name)
    cropped.save(out_path)
    print(f"Saved {out_path} {cropped.size}")

print("Assets extracted successfully!")
