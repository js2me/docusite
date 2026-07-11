/**
 * Auto-generate VitePress brand CSS variables from a base hex color.
 *
 * Generates:
 *   --vp-c-brand-1     = base color
 *   --vp-c-brand-2     = lighten 10%
 *   --vp-c-brand-3     = lighten 20%
 *   --vp-c-brand-soft  = base @ 14% opacity
 *   --vp-c-brand-dark  = darken 10%
 *   --vp-c-brand-dimm  = base @ 8% opacity
 */

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

function toRgbString(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
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

function generateVars(hex: string): BrandVars {
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

export interface DocusiteColors {
  light?: string
  dark?: string
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
