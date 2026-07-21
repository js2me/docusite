/**
 * Auto-generate VitePress brand CSS variables from hex color(s).
 *
 * Interactive palette (always from the primary color):
 *   --vp-c-brand-1              = base color
 *   --vp-c-brand-2              = lighten 10%  (hover)
 *   --vp-c-brand-3              = lighten 20%  (active)
 *   --vp-button-brand-*-bg      = remapped so buttons brighten on hover/active
 *   --vp-c-brand-soft/dark/dimm = derived from the base color
 *
 * Gradient (hero title / logo glow / doc page h1):
 *   single color  → same as brand-1/2/3
 *   3-color tuple → --docusite-c-gradient-1/2/3 = the provided colors
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
  '--vp-button-brand-bg': string
  '--vp-button-brand-hover-bg': string
  '--vp-button-brand-active-bg': string
  '--docusite-c-gradient-1': string
  '--docusite-c-gradient-2': string
  '--docusite-c-gradient-3': string
}

function generateVars(
  hex: string | [string, string, string],
): BrandVars {
  // Interactive states always derive from the primary color (color[0] for tuples)
  const primary = Array.isArray(hex) ? hex[0] : hex
  const { r, g, b } = parseHex(primary)
  const l10 = lighten(r, g, b, 0.10)
  const l20 = lighten(r, g, b, 0.20)
  const d10 = darken(r, g, b, 0.10)

  const brand1 = toHex(r, g, b)
  const brand2 = toHex(l10.r, l10.g, l10.b)
  const brand3 = toHex(l20.r, l20.g, l20.b)

  // Gradient colors: use the 3-tuple as-is, or fall back to the interactive scale
  let gradient1 = brand1
  let gradient2 = brand2
  let gradient3 = brand3
  if (Array.isArray(hex)) {
    const c0 = parseHex(hex[0])
    const c1 = parseHex(hex[1])
    const c2 = parseHex(hex[2])
    gradient1 = toHex(c0.r, c0.g, c0.b)
    gradient2 = toHex(c1.r, c1.g, c1.b)
    gradient3 = toHex(c2.r, c2.g, c2.b)
  }

  return {
    '--vp-c-brand-1': brand1,
    '--vp-c-brand-2': brand2,
    '--vp-c-brand-3': brand3,
    '--vp-c-brand-soft': toRgbaString(r, g, b, 0.14),
    '--vp-c-brand-dark': toHex(d10.r, d10.g, d10.b),
    '--vp-c-brand-dimm': toRgbaString(r, g, b, 0.08),
    // VitePress defaults map button bg→brand-3, hover→brand-2, active→brand-1
    // (which darkens on hover). Remap so interactive states brighten instead.
    '--vp-button-brand-bg': brand1,
    '--vp-button-brand-hover-bg': brand2,
    '--vp-button-brand-active-bg': brand3,
    '--docusite-c-gradient-1': gradient1,
    '--docusite-c-gradient-2': gradient2,
    '--docusite-c-gradient-3': gradient3,
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

/* Blur content only — full-bar backdrop softens the sidebar edge. */
.VPNavBar .content-body {
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* Logo left of site title; VitePress default gap is 8px */
.VPNavBarTitle a.title .logo {
  margin-right: 8px;
}

:root {
  --vp-nav-bg-color: #ffffff00;
}
html.dark {
  --vp-nav-bg-color: #11111100;
}

.VPSidebar {
  scrollbar-width: thin;
}

.Layout .title {
  transition: background-color 0s;
}

.Layout .outline-link:hover, .Layout .outline-link.active {
  color: var(--vp-c-brand-1);
  transition: color 0.25s, font-weight 0.15s ease;
  font-weight: 600;
}

.Layout .aside-container {
  max-width: 480px;
  width: auto;
  min-width: 224px;
}

/* VitePress 1.x: VPNavBar.has-sidebar appears only after hydration → search CLS.
   Bridge SSR-only state; once .has-sidebar lands, leave layout to VitePress.
   See https://github.com/vuejs/vitepress/issues/4351 */
@media (min-width: 960px) {
  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .wrapper {
    padding: 0;
  }

  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .container {
    max-width: 100%;
  }

  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .title {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    padding: 0 32px;
    width: var(--vp-sidebar-width);
    height: var(--vp-nav-height);
    background: var(--vp-sidebar-bg-color);
  }

  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .content {
    position: relative;
    z-index: 1;
    padding-left: var(--vp-sidebar-width);
    padding-right: 32px;
  }

  .Layout .VPNavBar.has-sidebar .title {
    background: var(--vp-sidebar-bg-color);
  }
}

@media (min-width: 1440px) {
  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .title {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }

  .Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .content {
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2 + 32px);
  }
}

.Layout:has(#VPContent.has-sidebar) .VPNavBar:not(.has-sidebar) .divider,
.VPNavBar.has-sidebar .divider {
  display: none;
}

.VPNavBar.home .divider {
  display: none;
}

.VPNavBar.home.top .content-body {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

@media (max-width: 767px) {
  .VPNavBar.screen-open {
    background-color: var(--vp-c-bg) !important;
  }

  .VPNavBar.screen-open .content-body {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
}

/* ── Home hero: animated gradient name ── */
:root {
  --docusite-c-gradient-1: var(--vp-c-brand-1);
  --docusite-c-gradient-2: var(--vp-c-brand-2);
  --docusite-c-gradient-3: var(--vp-c-brand-3);
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, var(--docusite-c-gradient-1), var(--docusite-c-gradient-2), var(--docusite-c-gradient-3));
}

#VPContent span.name.clip {
  text-shadow: 30px 30px 256px var(--docusite-c-gradient-2), -30px -30px 256px var(--docusite-c-gradient-1);
}

/* ── Home hero: animated logo background ── */
:root {
  --vp-home-hero-image-background-image: linear-gradient(-45deg, var(--docusite-c-gradient-1) 33%, var(--docusite-c-gradient-2) 33% 66%, var(--docusite-c-gradient-3) 66%);
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
  box-shadow: 30px 30px 128px var(--docusite-c-gradient-2), -30px -30px 128px var(--docusite-c-gradient-1);
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

#app .VPFeature .icon [class*="i-"] {
  display: inline-block;
  vertical-align: middle;
  width: 1.2em;
  height: 1.2em;
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

/* ── Doc page: soft brand gradient behind title ── */
.VPDoc .vp-doc h1:first-of-type {
  position: relative;
  isolation: isolate;
  width: fit-content;
  max-width: 100%;
}

.VPDoc .vp-doc h1:first-of-type::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -1.25em -1.5em;
  background: linear-gradient(-45deg, var(--docusite-c-gradient-1) 33%, var(--docusite-c-gradient-2) 33% 66%, var(--docusite-c-gradient-3) 66%);
  filter: blur(72px);
  opacity: 0.32;
  border-radius: 40%;
  pointer-events: none;
  transform: translateY(8px) translateX(-17px);
}

html.dark .VPDoc .vp-doc h1:first-of-type::before {
  opacity: 0.26;
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
