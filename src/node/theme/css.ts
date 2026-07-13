/**
 * Auto-generate VitePress brand CSS variables from hex color(s).
 *
 * Single color:
 *   --vp-c-brand-1     = base color
 *   --vp-c-brand-2     = lighten 10%
 *   --vp-c-brand-3     = lighten 20%
 *   --vp-c-brand-soft  = base @ 14% opacity
 *   --vp-c-brand-dark  = darken 10%
 *   --vp-c-brand-dimm  = base @ 8% opacity
 *
 * 3-color tuple [c1, c2, c3]:
 *   --vp-c-brand-1/2/3 = provided colors directly (for gradient animation)
 *   soft/dark/dimm      = derived from the first color
 */

import type { DocusiteColors } from '../../shared/types.js';

// ---------------------------------------------------------------------------
// Color math helpers
// ---------------------------------------------------------------------------

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '')
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
}

function toRgbaString(r: number, g: number, b: number, a: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${a.toFixed(2)})`
}

/** Mix color with white (0 = no change, 1 = pure white) */
function lighten(r: number, g: number, b: number, amount: number) {
  return {
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  }
}

/** Mix color with black (0 = no change, 1 = pure black) */
function darken(r: number, g: number, b: number, amount: number) {
  return {
    r: r * (1 - amount),
    g: g * (1 - amount),
    b: b * (1 - amount),
  }
}

// ---------------------------------------------------------------------------
// CSS variable generation
// ---------------------------------------------------------------------------

interface BrandVars {
  '--vp-c-brand-1': string
  '--vp-c-brand-2': string
  '--vp-c-brand-3': string
  '--vp-c-brand-soft': string
  '--vp-c-brand-dark': string
  '--vp-c-brand-dimm': string
}

function generateVars(
  hex: string | [string, string, string],
): BrandVars {
  if (Array.isArray(hex)) {
    // 3 brand colors provided — use them directly, derive soft/dark/dimm from the first
    const c0 = parseHex(hex[0])
    const c1 = parseHex(hex[1])
    const c2 = parseHex(hex[2])
    const d10 = darken(c0.r, c0.g, c0.b, 0.10)
    return {
      '--vp-c-brand-1': toHex(c0.r, c0.g, c0.b),
      '--vp-c-brand-2': toHex(c1.r, c1.g, c1.b),
      '--vp-c-brand-3': toHex(c2.r, c2.g, c2.b),
      '--vp-c-brand-soft': toRgbaString(c0.r, c0.g, c0.b, 0.14),
      '--vp-c-brand-dark': toHex(d10.r, d10.g, d10.b),
      '--vp-c-brand-dimm': toRgbaString(c0.r, c0.g, c0.b, 0.08),
    }
  }

  // Single color — derive brand-2/3 by lightening
  const { r, g, b } = parseHex(hex)
  const l10 = lighten(r, g, b, 0.10)
  const l20 = lighten(r, g, b, 0.20)
  const d10 = darken(r, g, b, 0.10)

  return {
    '--vp-c-brand-1': toHex(r, g, b),
    '--vp-c-brand-2': toHex(l10.r, l10.g, l10.b),
    '--vp-c-brand-3': toHex(l20.r, l20.g, l20.b),
    '--vp-c-brand-soft': toRgbaString(r, g, b, 0.14),
    '--vp-c-brand-dark': toHex(d10.r, d10.g, d10.b),
    '--vp-c-brand-dimm': toRgbaString(r, g, b, 0.08),
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Docusite base CSS — always injected.
 * Includes: navbar fix, home page animations, feature cards, layout.
 */
export function generateBaseCSS(): string {
  return `
/* ── Navbar ── */
.VPNav { box-shadow: none !important; border-bottom: none !important; }

.VPNavBar {
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

:root {
  --vp-nav-bg-color: #ffffff00;
}
html.dark {
  --vp-nav-bg-color: #11111100;
}

@media (min-width: 960px) {
  .Layout .VPNavBar.has-sidebar .title {
    background: var(--vp-sidebar-bg-color);
  }
}

.VPNavBar.has-sidebar .divider {
  display: none;
}

/* ── Home hero: animated gradient name ── */
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, var(--vp-c-brand-1), var(--vp-c-brand-2), var(--vp-c-brand-3));
}

#VPContent span.name.clip {
  text-shadow: 30px 30px 256px var(--vp-c-brand-2), -30px -30px 256px var(--vp-c-brand-1);
}

/* ── Home hero: animated logo background ── */
:root {
  --vp-home-hero-image-background-image: linear-gradient(-45deg, var(--vp-c-brand-1) 33%, var(--vp-c-brand-2) 33% 66%, var(--vp-c-brand-3) 66%);
  --vp-home-hero-image-filter: blur(44px);
}
@media (min-width: 640px) {
  :root { --vp-home-hero-image-filter: blur(56px); }
}
@media (min-width: 960px) {
  :root { --vp-home-hero-image-filter: blur(68px); }
}

@media (min-width: 960px) {
  .VPHero.has-image.VPHomeHero .image-container {
    min-width: 480px;
  }
}

@keyframes docusite-logo-bg {
  0%   { background-position: 0% 0%;   transform: scale(1) translate(-50%, -50%); }
  50%  { background-position: 300% 300%; transform: scale(1.4) translate(-35%, -35%); }
  100% { background-position: 0% 0%;   transform: scale(1) translate(-50%, -50%); }
}
.image-container > .image-bg {
  background-size: 200% 200%;
  animation: docusite-logo-bg 7s linear infinite;
}

@keyframes docusite-logo-float {
  0%   { transform: scale(1) translate(-50%, -50%); }
  50%  { transform: scale(1.05) translate(-48%, -48%); }
  100% { transform: scale(1) translate(-50%, -50%); }
}
.image-container > .image-src {
  animation: docusite-logo-float 10s linear infinite;
}

/* ── Home hero: brand button glow ── */
#VPContent .VPButton.medium.brand {
  box-shadow: 30px 30px 128px var(--vp-c-brand-2), -30px -30px 128px var(--vp-c-brand-1);
}

/* ── Feature cards: glassmorphism ── */
:root {
  --vp-c-bg-feature-soft: #f6f6f76b;
}
html.dark {
  --vp-c-bg-feature-soft: #20212730;
}

#VPContent .VPFeature {
  display: block;
  background-color: var(--vp-c-bg-feature-soft);
  border: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 24px;
}

#app .VPFeature .icon {
  border-radius: 12px;
}

/* ── Home layout: fill page ── */
.VPHome {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0 !important;
}

.VPContent.is-home {
  display: flex;
}

/* ── Doc page: center content when no sidebar ── */
.VPDoc:not(.has-sidebar) .container .content {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.VPHero.has-image.VPHomeHero {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.VPHero.has-image .main {
  position: relative;
}

.VPHero.has-image .container {
  padding-left: 2rem;
  padding-right: 2rem;
  margin-top: auto;
  margin-bottom: auto;
  padding-bottom: 7vh;
}

.main > .heading > .text {
  font-size: 24px;
  line-height: 28px;
  padding-top: 20px;
}

html:has(.VPFeatures.VPHomeFeatures .items > .item) .VPHero.has-image .container {
  margin-bottom: 0;
  margin-top: auto;
}

html:has(.VPFeatures.VPHomeFeatures .items > .item) .VPHero.has-image.VPHomeHero {
  flex: 1;
}

html:has(.VPFeatures.VPHomeFeatures .items > .item) .VPFeatures.VPHomeFeatures {
  margin-bottom: auto;
  flex: 1;
}

html .VPFooter {
  border-top: 0 !important;
}

/* ── ReactMark: inline in prose/headings ── */
.vp-inline-react-mark {
  display: inline-block;
  vertical-align: -0.185em;
  margin-right: 0.2em;
}

.vp-inline-react-mark svg {
  display: block;
  width: 1em;
  height: 1em;
}

/* ── ReactMark: sidebar (from transformed HTML text) ── */
.vp-sidebar-react-mark {
  display: inline;
}

.vp-sidebar-react-icon {
  display: inline-block;
  vertical-align: -0.2em;
}

.vp-sidebar-react-mark .vp-sidebar-react-icon {
  width: 1.05em;
  height: 1.05em;
}

html:not(.dark) .vp-sidebar-react-icon {
  filter: brightness(0.88) saturate(1.05);
}
`.trim()
}

/**
 * Generate a `<style>` block with VitePress brand CSS variables.
 * Returns the raw CSS string ready to inject via `<head>`.
 */
export function generateBrandCSS(colors: DocusiteColors): string {
  const lines: string[] = []

  if (colors.light) {
    const vars = generateVars(colors.light)
    lines.push(':root {')
    for (const [key, value] of Object.entries(vars)) {
      lines.push(`  ${key}: ${value};`)
    }
    lines.push('}')
  }

  if (colors.dark) {
    const vars = generateVars(colors.dark)
    lines.push('.dark {')
    for (const [key, value] of Object.entries(vars)) {
      lines.push(`  ${key}: ${value};`)
    }
    lines.push('}')
  }

  return lines.join('\n')
}
