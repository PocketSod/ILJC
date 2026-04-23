# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Project Structure
Static site for Center for Language Justice, deployed to GitHub Pages at `https://PocketSod.github.io/CLJ/`.

- `index.html`, `landing-2.html`, `landing-3.html`, `landing-4.html` — four landing page variants
- All pages share a nav toggle widget (`<div class="page-toggle">`) linking between the four variants; keep all four toggle buttons present and consistent across pages
- All styles are inline `<style>` blocks — no external CSS files, no build step
- `serve.mjs` — local dev server (port 3000)
- `screenshot.mjs` — takes screenshots via WSL2 + Windows Edge headless (see below)
- `screenshot-scroll.mjs` — variant for scrolled positions

## Brand Assets
- Folder: `brand-assets/`
- Primary logo: `brand-assets/logo.png` — use this in nav and hero
- Never use `mix-blend-mode: multiply` on logos placed on dark backgrounds — it makes them invisible
- Always use real assets; do not use `placehold.co` where actual brand files exist

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL
- Start: `node serve.mjs` (background) — serves project root at `http://localhost:3000`
- Do not start a second instance if already running

## Screenshot Workflow
- `screenshot.mjs` uses **WSL2 + Windows Edge headless** (`/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) — must be run from WSL2, not native Windows shell
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots saved to `./temporary screenshots/screenshot-N.png` (auto-incremented)
- Optional label: `node screenshot.mjs http://localhost:3000 label` → `screenshot-N-label.png`
- After screenshotting, read the PNG with the Read tool to visually analyze it
- Compare precisely: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing
- Do at least 2 comparison rounds; stop only when no visible differences remain or user says so

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).

## Output Defaults
- Single `.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images (only when no real asset exists): `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Color Palette (landing-2 reference)
```
--brown:        #3D2810
--brown-2:      #2A1A08  (page background)
--amber:        #C9922A  (primary accent)
--amber-light:  #E0B050
--copper:       #B07840
--cream:        #F5EDD8
```

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Derive from the brand palette above.
- **Shadows:** Use layered, color-tinted shadows with low opacity — not flat `shadow-md`.
- **Typography:** Different fonts for headings and body. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states.
- **Depth:** Surfaces should have a layering system (base → elevated → floating).

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
