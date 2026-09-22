# Brew Haven — Artisanal Coffee Experience

A modern, immersive artisanal coffee website featuring a high-performance 300-frame canvas scroll animation, dynamic interactive menu, cart drawer, tasting quiz, table reservation system, and location showcase.

---

## ✨ Features

- **300-Frame Canvas Scroll Animation**: Smooth scrubbed canvas rendering synchronized with scrolling.
- **Smart Frame Preloader**: Keyframe pre-caching with batch loading and graceful nearest-frame fallbacks.
- **Interactive Menu & Category Filter**: Filter single origins, espresso, cold brew, and pastries with modal details.
- **Cart & Slide-over Drawer**: Real-time quantity controls, subtotal calculation, and persistence.
- **Interactive Coffee Finder Quiz**: Personalized coffee recommendations based on brew preference and roast profile.
- **Visit Our Spaces**: Location showcase with dual photography cards, hours, directions, and table reservations.
- **Full Responsive Design**: Crafted for mobile, tablet, and desktop viewports.

---

## 🚀 Deploy to Vercel

This repository is pre-configured for **zero-config deployment on Vercel**.

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import `sayyedfalak73-debug/Coffee-website`.
3. Keep default settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: *(leave empty)*
   - **Output Directory**: *(leave empty)*
4. Click **Deploy**. Vercel will build and assign an HTTPS URL instantly.

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy directly from repository root
vercel
```

---

## 💻 Local Development

You can preview the website locally using any static web server:

### Python:
```bash
python3 serve.py
# or
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Node.js:
```bash
npx serve .
```

---

## 📂 Project Structure

```
├── index.html         # Main website markup & Tailwind CSS integration
├── style.css          # Custom styling, scrollbars, and preloader animations
├── app.js             # Canvas animation engine, interactive menu, cart & quiz logic
├── vercel.json        # Vercel deployment configuration & CDN caching headers
├── assets/            # High-resolution imagery, cards, and branding assets
├── frames/            # 300-frame WebP sequence for canvas scroll animation
└── .gitignore         # Ignores OS and temporary files
```
