# Conquest

A cosmos/galaxy-inspired marketing site for **Conquest**, a web & creative studio.
Carbon-black canvas, mint-green + light-blue glow, a scroll-driven WebGL background
(starfield → spiral galaxy → black hole), and motion-graphics content reveals.

## Stack

- [Vite](https://vitejs.dev/) — dev server + bundler
- [Three.js](https://threejs.org/) — WebGL cosmos background (particles + bloom)
- [GSAP](https://gsap.com/) + [Lenis](https://github.com/darkroomengineering/lenis) — scroll animation & smooth scroll
- `@fontsource` — self-hosted fonts (Space Grotesk, Inter, JetBrains Mono)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/ (self-contained static site)
npm run preview  # preview the production build
```

## Editing content

All copy, packages, prices, and the contact email live in **`src/content.js`** — the
single source of truth. Prices are **placeholders** (marked `isPlaceholderPrice`) and
should be replaced with real figures.

- Contact email: `CONTACT_EMAIL`
- Packages: `PACKAGES` (Base, Premium, Singularity)
- Capabilities constellation nodes: `CAPABILITIES.nodes`

## Structure

```
index.html            # page shell + WebGL canvas + CSS fallback
src/
  main.js             # boot: fonts, DOM, cosmos, scroll, fallbacks
  content.js          # all copy + package/pricing data (edit here)
  styles/             # tokens.css (palette), global.css, sections.css
  cosmos/             # Three.js: Cosmos, Starfield, Galaxy, BlackHole, scroll
  ui/                 # dom.js (markup), reveal.js (GSAP), nav.js
public/               # favicon
```

## Accessibility & performance

- Respects `prefers-reduced-motion` (static cosmos frame, no scroll scrubbing).
- Falls back to a pure-CSS starfield when WebGL is unavailable.
- Caps device pixel ratio and lowers particle counts on mobile; pauses rendering
  when the tab is hidden.
