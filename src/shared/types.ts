import type { DefaultTheme, HeadConfig } from 'vitepress'

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export interface DocusiteColors {
  /** Brand color for light theme, e.g. `'#646cff'` */
  light?: string
  /** Brand color for dark theme, e.g. `'#535bf2'` */
  dark?: string
}

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

export interface DocusiteLocale {
  /** Display label, e.g. `'English'` */
  label: string
  /** HTML lang attribute, e.g. `'en'` */
  lang: string
  /** Path prefix (required for non-root locales), e.g. `'/ru/'` */
  link?: string
  /** Per-locale navigation */
  nav?: DefaultTheme.NavItem[]
  /** Per-locale sidebar */
  sidebar?: DefaultTheme.Sidebar
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface DocusiteAlgoliaOptions {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: Record<string, unknown>
}

export type DocusiteSearch =
  | 'local'
  | { provider: 'algolia'; options: DocusiteAlgoliaOptions }

// ---------------------------------------------------------------------------
// llms.txt
// ---------------------------------------------------------------------------

export interface DocusiteLlmsOptions {
  /** Generate llms.txt (default: true) */
  llmsTxt?: boolean
  /** Generate llms-full.txt (default: true) */
  llmsFullTxt?: boolean
  /** Glob patterns to ignore */
  ignoreFiles?: string[]
  /** Strip frontmatter from output (default: true) */
  ignoreFrontmatter?: boolean
  /** Custom description for llms.txt */
  description?: string
}

// ---------------------------------------------------------------------------
// Main config
// ---------------------------------------------------------------------------

export interface DocusiteConfig {
  /** Path to docs directory (default: `'./docs'`) */
  docsDir?: string

  /** Site title */
  title?: string
  /** Site description */
  description?: string
  /** Path to logo image */
  logo?: string

  /** Brand colors — auto-generates VitePress CSS variables */
  colors?: DocusiteColors

  /** Navigation items */
  nav?: DefaultTheme.NavItem[]
  /** Sidebar configuration */
  sidebar?: DefaultTheme.Sidebar

  /** i18n locales */
  locales?: Record<string, DocusiteLocale>

  /** Search provider (default: `'local'`) */
  search?: DocusiteSearch

  /** Enable llms.txt / llms-full.txt generation (default: `true`) */
  llms?: boolean | DocusiteLlmsOptions

  /** Additional `<head>` tags */
  head?: HeadConfig[]

  /** Social links in nav */
  socialLinks?: DefaultTheme.SocialLink[]

  /** Custom CSS file paths to inject */
  customCss?: string[]

  /** Raw VitePress theme config overrides (merged last) */
  themeConfigOverrides?: Partial<DefaultTheme.Config>

  /** Raw VitePress site config overrides (merged last) */
  siteConfigOverrides?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// defineConfig helper
// ---------------------------------------------------------------------------

/**
 * Define docusite configuration with type hints.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'docusite'
 *
 * export default defineConfig({
 *   title: 'My Project',
 *   colors: { light: '#646cff', dark: '#535bf2' },
 * })
 * ```
 */
export function defineConfig(config: DocusiteConfig): DocusiteConfig {
  return config
}
