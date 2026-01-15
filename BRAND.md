# DROPR Brand & Design Specification

---

## Philosophy

**Music-culture authentic. Not tech-startup generic.**

The aesthetic draws from record shop culture, music zines, independent label design (4AD, Warp, Blue Note), and vinyl collecting. Every element should pass the test: *"Does this feel like it was made by people who actually care about music?"*

References: Discogs information density, Bandcamp's restraint, Stamp The Wax editorial, early SoundCloud's community energy, Rough Trade shop aesthetics.

---

## Brand Identity

**Name:** DROPR

**Tagline:** "Drop heat. Prove your taste."

**Philosophy:** "Your taste is valid."

**Positioning:** Not a playlist app—a credential for curators. A timestamp for taste.

---

## The Manifesto

### Tagline
**Drop heat. Prove your taste.**

### Three Pillars

**1. Diagnosis (The Problem)**
> The problem isn't creation. 100,000 tracks upload daily. 45 million have never been played once. Algorithms optimize for engagement, not quality. The people who actually find music first—the ones whose playlists get stolen, whose taste gets mined—get nothing.

**2. Guiding Policy (Our Belief)**
> Human taste is the last scarce resource. In an age of infinite content, curation is creation. Your ear is an instrument. Your judgment has value. The question isn't what to listen to—it's who decides what's worth hearing.

**3. Strategy (What We Build)**
> We're building proof. A timestamp for taste. A record of what you knew before the algorithm caught up. Not another playlist app—a credential for curators. If you're right about music, we'll know. And eventually, so will everyone else.

---

## Who We're For / Not For

### For
- The unpaid A&R of every friend group
- People who found artists before they were artists
- Curators whose playlists get stolen
- Anyone who cringes at "Discover Weekly"

### Not For
- People who let algorithms decide
- Passive listeners
- Anyone satisfied with what's "trending"
- Those who think music is "content"

---

## Signature Phrases

| Context | Copy |
|---------|------|
| **Tagline** | Drop heat. Prove your taste. |
| **Philosophy** | Your taste is valid. |
| **Value Prop** | A timestamp for taste. |
| **CTA Support** | Limited spots. We're building this with the first 1,000. |
| **Confirmation** | Keep finding heat. |

---

## Color System

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Obsidian** | `#0A0A0A` | Primary background |
| **Warm White** | `#E8E4DF` | Primary text |
| **Heat Gold** | `#D4A853` | Accent, CTAs, highlights |

### Secondary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Ash** | `#B8B4AF` | Body text, secondary content |
| **Smoke** | `#666666` | Muted text, labels |
| **Charcoal** | `#333333` | Borders, dividers |
| **Deep Black** | `#1A1A1A` | Subtle borders, separators |
| **Border Faint** | `#1F1F1F` | Section label underlines |
| **Hover Gold** | `#E8B95E` | Button hover state |

### Color Rationale

**Heat Gold (#D4A853)** — Evokes warmth of vinyl, amber studio lights, the glow of classic recording equipment. Not tech-blue, not startup-purple. A color that says "taste" and "earned credibility."

**Obsidian (#0A0A0A)** — Near-black but warm. Club interiors, record sleeves, the back room of a shop where the good stuff is kept. Not the cold black of tech interfaces.

---

## Typography

### Primary Typeface — Headlines & Manifesto
**EB Garamond** (Google Fonts)

```css
font-family: "EB Garamond", Georgia, "Times New Roman", serif;
```

- Why: Editorial authority, publishing heritage, anti-tech positioning
- Usage: Taglines, manifesto text, headlines
- Weight: 400 (regular), 500 (medium for emphasis)
- Style: Italic for taglines

### Secondary Typeface — UI & Labels
**DM Mono** (Google Fonts)

```css
font-family: "DM Mono", "SF Mono", Monaco, monospace;
```

- Why: Technical precision, data credibility, record catalog aesthetic
- Usage: Labels, buttons, form inputs, metadata, timestamps
- Weight: 400 (regular)

### Type Scale

| Element | Size | Line Height | Letter Spacing | Weight |
|---------|------|-------------|----------------|--------|
| Hero Tagline | clamp(36px, 7vw, 52px) | 1.15 | -0.02em | 400 italic |
| Section Label | 10px | 1.4 | 0.25em | 400 |
| Wordmark | 12px | 1.0 | 0.4em | 400 |
| Body Text | 17px | 1.75 | 0 | 400 |
| Body Emphasis | 17px | 1.75 | 0 | 500 |
| List Items | 14px | 1.9 | 0 | 400 |
| Button Text | 11px | 1.0 | 0.2em | 400 |
| Micro Text | 12px | 1.5 | 0.02em | 400 |
| Footer | 10px | 1.0 | 0.1em | 400 |

---

## Spacing System

Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 8px | Tight gaps |
| `space-sm` | 12px | Label gaps |
| `space-md` | 16px | Form elements |
| `space-lg` | 24px | Section gaps |
| `space-xl` | 32px | Major sections |
| `space-2xl` | 48px | Column gaps |
| `space-3xl` | 56px | Pre-CTA spacing |
| `space-4xl` | 72px | Section breaks |
| `space-5xl` | 80px | Header margin |
| `space-6xl` | 96px | Page padding |
| `space-7xl` | 120px | Footer margin |

### Page Layout

```css
max-width: 680px;
padding: 64px 32px 96px;
margin: 0 auto;
```

---

## Components

### Primary CTA Button

```css
padding: 16px 32px;
background-color: #D4A853;
color: #0A0A0A;
font-family: "DM Mono", monospace;
font-size: 11px;
letter-spacing: 0.2em;
text-transform: uppercase;
border: none;
cursor: pointer;
transition: all 0.3s ease;

/* Hover */
background-color: #E8B95E;
transform: translateY(-1px);
```

### Form Inputs

```css
width: 100%;
padding: 16px 0;
border: none;
border-bottom: 1px solid #333;
background-color: transparent;
font-family: "DM Mono", monospace;
font-size: 16px;
color: #E8E4DF;
outline: none;
transition: border-color 0.3s ease;

/* Focus */
border-color: #D4A853;
```

### Section Labels

```css
font-size: 10px;
letter-spacing: 0.25em;
font-family: "DM Mono", monospace;
text-transform: uppercase;
color: #666;
margin-bottom: 24px;
padding-bottom: 12px;
border-bottom: 1px solid #1F1F1F;
```

### Dividers

**Accent Divider**
```css
width: 48px;
height: 1px;
background-color: #D4A853;
```

---

## Visual Effects

### Film Grain Overlay

Very subtle noise texture over entire page:
```css
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,..."); /* noise texture */
    opacity: 0.03;
    pointer-events: none;
    z-index: 1;
}
```

### Page Load Animation

```css
opacity: 0 → 1;
transform: translateY(20px) → translateY(0);
transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

Stagger delays: 0.2s, 0.3s, 0.5s, 0.7s, 0.8s, 1s, 1.2s

---

## What to Avoid

### Visual
- Purple gradients, blue tech colors, bright primary colors
- Inter, Roboto, Arial, or any generic sans-serif fonts
- Rounded corners everywhere (use 0 or minimal)
- Stock photography
- Bright white backgrounds
- Excessive shadows or glows
- Gradient buttons
- Icon-heavy designs

### Language
- "Content" (use "music" or "tracks")
- "Users" (use "curators" or "people")
- "Platform" (use "system" or product name)
- "AI-powered" prominently
- "Revolutionary" or "game-changing"
- Comparison to Spotify/Apple Music
- Startup clichés and buzzwords
- Excessive exclamation points
- Emojis in core copy

### Patterns
- Hamburger menus for single-page
- Cookie banners (not needed for waitlist)
- Social proof numbers before launch
- "As seen in" sections
- Testimonial carousels
- Feature grids with icons
- Pricing tables

---

## Page Structure

1. **Header** — Wordmark "DROPR" in gold
2. **Tagline** — "Drop heat. / Prove your taste." (italic, second line gold)
3. **Manifesto** — Three paragraphs with bold thesis statements
4. **Gold Divider** — 48px accent line
5. **For / Not For** — Two-column grid
6. **CTA Section** — Email capture with underline input
7. **Footer** — Copyright + "Your taste is valid."

---

## Implementation Notes

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
```

### CSS Variables
```css
:root {
  /* Colors */
  --color-bg: #0A0A0A;
  --color-text: #E8E4DF;
  --color-accent: #D4A853;
  --color-accent-hover: #E8B95E;
  --color-muted: #B8B4AF;
  --color-subtle: #666666;
  --color-border: #333333;
  --color-border-subtle: #1A1A1A;

  /* Typography */
  --font-serif: "EB Garamond", Georgia, "Times New Roman", serif;
  --font-mono: "DM Mono", "SF Mono", Monaco, monospace;

  /* Spacing */
  --space-unit: 8px;
  --max-width: 680px;

  /* Animation */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --duration-base: 0.3s;
  --duration-slow: 0.8s;
}
```

---

## Competitive Positioning

**We're not a playlist app. We're a validation system.**

While Spotify rewards engagement and streams, DROPR rewards foresight. We're building the first system that creates a permanent, verifiable record of curatorial judgment—proof that you knew before the algorithm did.

DROPR should feel like:
- **Bandcamp** (artist-first, restrained)
- **Discogs** (information density, credibility)
- **Independent labels** (4AD, Warp, Blue Note)
- **Record shop back rooms** (curated, exclusive)

DROPR should NOT feel like:
- **Spotify** (passive consumption, algorithmic)
- **TikTok** (trend-chasing, viral)
- **Generic SaaS** (blue gradients, rounded corners)

---

*Last updated: January 2025*
*Version: 2.0 — Music Culture Authentic*
