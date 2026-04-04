# Style Transfer Prompt — BotnariCreative Design System

Paste the block below into a new Claude conversation when building a related product that should match the visual identity of botnaricreative.com.

---

## PROMPT (copy everything below this line)

I'm building a project that must match the visual identity of an existing portfolio site (botnaricreative.com). Apply the design system below to everything you build — do not deviate unless I explicitly ask.

---

### Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4 — theme tokens declared inline via `@theme` in `globals.css`, no `tailwind.config.*` file
- GSAP for all animations (use `useGSAP` hook, register plugins explicitly)
- Framer Motion is NOT used — keep all motion in GSAP

---

### Color palette

```css
--background: #050505;   /* near-black page background */
--foreground: #f5f5f5;   /* near-white base text */
```

All UI layering is done with white-opacity utilities. The hierarchy from lowest to highest prominence:

| Role | Value |
|---|---|
| Faint dividers / disabled | `rgba(255,255,255,0.06)` – `white/[0.06]` |
| Borders | `border-white/10` → `border-white/20` |
| Muted labels / metadata | `text-white/25` – `text-white/40` |
| Secondary text | `text-white/50` – `text-white/65` |
| Body text | `text-white/75` – `text-white/85` |
| High-emphasis text | `text-white/90`, `text-[#f5f5f5]`, `#f5f5f5` |
| Full-emphasis / headings | `text-white`, `color: #f5f5f5` |

Never use any other colour. The only allowed accent is pure white (`#ffffff`) used as a full-contrast CTA background (e.g. a submit button with white bg + black text).

Text selection: `selection:bg-white selection:text-black`

---

### Typography

Three fonts — load all three:

1. **Geist Sans** — primary UI font (`--font-geist-sans`). Load via `next/font/google`.
2. **Geist Mono** — code / monospace (`--font-geist-mono`). Load via `next/font/google`.
3. **LIQUIDASI** — display-only font for hero titles and the wordmark (`--font-liquidasi`). Load via `next/font/local` from `/public/Fonts/LIQUIDASI.woff2`.

Apply fonts to `<body>` as CSS variables: `${geistSans.variable} ${geistMono.variable} ${liquidasi.variable} antialiased`.

**Type scale and treatment:**

- Page-level eyebrow labels (e.g. "WORK", "REACH OUT"): `text-xs tracking-[0.35em] text-white/70 uppercase mb-4`
- Page-level headings (h1): `text-4xl sm:text-6xl font-black tracking-tight` — use LIQUIDASI for hero/brand headings only
- Section headings (h2): `text-xl sm:text-2xl font-bold tracking-tight text-white/90`
- List item titles: `text-2xl sm:text-4xl font-black tracking-tight`
- Small metadata / dates: `text-xs tracking-[0.28em] text-white/65 uppercase`
- Form labels: `text-[10px] font-bold tracking-[0.2em] text-white/45 uppercase`
- Tags / pills: `text-xs text-white/40 border border-white/10 rounded-full px-3 py-0.5`
- Nav links: `text-[0.8rem] font-semibold uppercase tracking-widest text-white/75`

Heading letter-spacing is always `tracking-tight` (`letter-spacing: -0.02em` to `-0.03em` for large sizes).

---

### Navigation / Header

Fixed top bar, full-width container, pinned to viewport top:

```
fixed inset-x-0 top-0 z-40 px-4
```

Inner pill:

```
mx-auto mt-4 w-full max-w-5xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md
```

Logo wordmark: LIQUIDASI font, `text-xs tracking-[0.15em] text-white/90`.
Nav links: `uppercase tracking-widest text-white/75`, hover adds a border + `text-white` transition.

---

### Card / Panel surface

All surface panels share this base:

```
rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md
```

Always layer a grain texture SVG inside every panel (positioned `absolute inset-0`, `pointer-events-none`, `opacity-[0.18]–[0.22]`, `mixBlendMode: "overlay"`):

```jsx
<svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.20]"
  style={{ mixBlendMode: "overlay" }} xmlns="http://www.w3.org/2000/svg">
  <filter id="grain-[unique-id]">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#grain-[unique-id])" />
</svg>
```

Use a unique `id` per panel to avoid SVG filter conflicts.

---

### List items (cases / blog rows)

Border-divided rows, no card boxes:

```
border-b border-white/10 py-6 (or py-8)
```

On hover: `border-white/25` transition. Each row slides `x: 12` on mouse enter via GSAP (duration 0.24, ease `power2.out`), returns on leave (duration 0.28).

A GSAP-animated "selector" overlay tracks the hovered row — four corner-bracket spans positioned absolutely:

```jsx
<span className="absolute left-1.5 top-1.5 h-2 w-2 border-[1.5px] border-r-0 border-b-0 border-white/40" />
<span className="absolute right-1.5 top-1.5 h-2 w-2 border-[1.5px] border-l-0 border-b-0 border-white/40" />
<span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-[1.5px] border-r-0 border-t-0 border-white/40" />
<span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-[1.5px] border-l-0 border-t-0 border-white/40" />
```

---

### Buttons

**Primary CTA (only one per page):**

```
w-full rounded-lg bg-white py-3.5 text-sm font-bold tracking-widest text-black
transition-opacity hover:opacity-90 disabled:opacity-40
```

**Ghost / text buttons:**

```
text-xs font-bold tracking-[0.15em] text-white/40 uppercase transition-colors hover:text-white/70
```

No outlined buttons. No coloured buttons. No border-radius larger than `rounded-2xl`.

---

### Form inputs

```
w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3
text-sm text-white outline-none transition-all duration-200
placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.07] focus:ring-0
```

Error state bumps border to `border-white/30`. Error messages: `text-[10px] text-white/40 mt-1.5`.

---

### Sections

Every major section gets `pt-28 pb-16 px-6` (accounting for the fixed header). Max content width is `max-w-6xl mx-auto` for lists/grids, `max-w-xl mx-auto` for prose/reading content.

The About-style section uses a glassmorphism treatment:

```
relative z-10 backdrop-blur-lg px-6 py-24 flex items-center overflow-hidden
```
with:
```css
background-color: rgba(255,255,255,0.06);
border-top: 1px solid rgba(255,255,255,0.18);
box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 -4px 24px rgba(255,255,255,0.02);
```
Plus a top-edge light catch gradient and a grain noise overlay at `opacity: 0.2, mixBlendMode: "overlay"`.

---

### GSAP scroll animations

Paragraphs and content blocks animate in on scroll:

```js
gsap.from(el, {
  y: 24,
  opacity: 0,
  duration: 1.1,
  ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 88%", once: true },
});
```

List items on page load animate in from the right:

```js
gsap.fromTo(items,
  { x: 140, opacity: 0 },
  { x: 0, opacity: 1, duration: 1, ease: "bounce.out", stagger: 0.2 }
);
```

Always use `gsap.context()` scoped to a ref, and revert on cleanup.

---

### Grain / dithering effects

This site uses grain and Bayer-matrix dithering as core visual texture — not just decoration. Apply grain SVG filters to panels (as above). For full-page backgrounds use a CSS SVG data-URI noise overlay:

```css
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
background-size: 300px 300px;
opacity: 0.2;
mix-blend-mode: overlay;
```

---

### Prose / rich content typography

For blog posts or case study body content, use the `.blog-content` / `.case-content` class pattern with these rules:

- `font-size: 1rem; line-height: 1.8; color: rgba(245,245,245,0.8)`
- h1: `2.25rem / 900 / letter-spacing -0.03em`
- h2: `1.5rem / 800 / letter-spacing -0.02em`
- h3: `1.125rem / 700 / letter-spacing -0.01em`
- blockquote: `border-left: 2px solid rgba(245,245,245,0.15); color: rgba(245,245,245,0.45); font-style: italic`
- code: `bg: rgba(245,245,245,0.06); border: 1px solid rgba(245,245,245,0.1); border-radius: 4px`
- pre: `bg: rgba(245,245,245,0.03); border: 1px solid rgba(245,245,245,0.08); border-radius: 10px`
- hr: `border-top: 1px solid rgba(245,245,245,0.08)`
- images/video/iframe: `border-radius: 10px; margin: 1.5em 0`
- links: `color: rgba(245,245,245,0.7); text-decoration-color: rgba(245,245,245,0.25); text-underline-offset: 3px`

---

### What NOT to do

- No light/white backgrounds anywhere except the primary CTA button
- No colour accents (blue, green, red, purple, etc.)
- No box shadows with colour — only white-opacity or transparent shadows
- No border-radius beyond `rounded-2xl` (except `rounded-full` for pills/tags)
- No Framer Motion — GSAP only
- No heavy font weights below `font-bold` (700) for UI text; headings use `font-black` (900)
- No centred body text (only hero/landing headings are centred)
- No card borders thicker than `1px`
- Do not use Tailwind's default config structure — this project uses Tailwind v4 with `@theme inline` in CSS

---

### Checklist before shipping any UI

- [ ] Background is `#050505`, text base is `#f5f5f5`
- [ ] All colours use white-opacity scale, no raw hues
- [ ] Every surface panel has `rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md` + grain SVG
- [ ] Heading eyebrows are `text-xs tracking-[0.35em] uppercase text-white/70`
- [ ] Page heading is `font-black tracking-tight` at `text-4xl sm:text-6xl`
- [ ] List rows use border-b dividers with GSAP hover translation
- [ ] Primary button is white bg / black text
- [ ] Inputs use `bg-white/[0.04]` with focus state `bg-white/[0.07]`
- [ ] All GSAP animations are scoped and reverted on cleanup
- [ ] Grain texture applied to any opaque or semi-opaque panel
