import type { DefaultTheme, HeadConfig } from 'vitepress'

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export interface DocusiteColors {
  /**
   * Brand color(s) for light theme.
   * A single hex for a monochrome palette, or 3 colors for gradient animation.
   * @example `'#646cff'`
   * @example `['#646cff', '#ff6466', '#21ffc7']`
   */
  light?: string | [string, string, string]
  /**
   * Brand color(s) for dark theme.
   * A single hex for a monochrome palette, or 3 colors for gradient animation.
   * @example `'#535bf2'`
   * @example `['#535bf2', '#ff6466', '#21ffc7']`
   */
  dark?: string | [string, string, string]
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
// Versioning
// ---------------------------------------------------------------------------

export interface DocusiteVersion {
  /** Display label, e.g. `'v6.x.x'` */
  label: string
  /** Link to the version's entry page, e.g. `'/v6/introduction/getting-started'` */
  link: string
}

export interface DocusiteVersions {
  /** Current (latest) version label, e.g. `'7.2.1'` or `'v3.0.0'` */
  latest: string
  /** Older versions */
  older?: DocusiteVersion[]
  /** Show a warning banner on old version pages */
  oldVersionBanner?: {
    /** Enable the banner (default: `true` when `older` versions exist) */
    show?: boolean
    /** Custom message. Use `{latestLink}` and `{latestLabel}` as placeholders. */
    message?: string
  }
}

// ---------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------

export interface DocusiteChangelog {
  /** Path to the CHANGELOG.md source file (relative to project root), e.g. `'../CHANGELOG.md'` */
  src: string
  /** Custom nav link path (default: `'/changelog'`) */
  link?: string
}

// ---------------------------------------------------------------------------
// Source links (rewrite markdown links to GitHub source)
// ---------------------------------------------------------------------------

export interface DocusiteSourceLinks {
  /**
   * Path prefix in markdown links to replace, e.g. `'/src'`.
   * Matches `(/from/...)` in `.md` files (default: `'/src'`).
   */
  from?: string
  /** Target URL prefix, e.g. `'https://github.com/user/repo/tree/master/src'` */
  target: string
}

// ---------------------------------------------------------------------------
// Content injections (template variables for .md files)
// ---------------------------------------------------------------------------

export interface DocusiteContentInjection {
  /** Variable name, e.g. `'version'` or `'api'` — referenced as `@{key}` or `@{key.path}` in .md */
  key: string
  /** Any JSON-serializable value — string, number, boolean, object, or array */
  value: unknown
}

// ---------------------------------------------------------------------------
// Main config
// ---------------------------------------------------------------------------

export interface DocusiteConfig {
  /** Path to docs directory (default: `'./docs'`) */
  docsDir?: string

  /**
   * Base URL the site will be deployed at (VitePress `base`).
   * Set when deploying under a sub path, e.g. `'/bar/'` for `https://foo.github.io/bar/`.
   * Must start and end with a slash (default: `'/'`).
   */
  base?: string

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

  /** Version selector — adds a NavVersionsFlyout to the navbar */
  versions?: DocusiteVersions

  /** Show CHANGELOG link in the navbar. `true` = default, `false` = hidden, `string` = custom link, `{ src }` = copy file from path */
  changelog?: boolean | string | DocusiteChangelog

  /** Search provider (default: `'local'`) */
  search?: DocusiteSearch

  /** Enable llms.txt / llms-full.txt generation (default: `true`) */
  llms?: boolean | DocusiteLlmsOptions

  /** Additional `<head>` tags */
  head?: HeadConfig[]

  /** GitHub repository URL — adds a GitHub icon button to the navbar when set */
  github?: string

  /** Social links in nav (other than GitHub — use `github` for the GitHub button) */
  socialLinks?: DefaultTheme.SocialLink[]

  /** Custom CSS file paths to inject */
  customCss?: string[]

  /** Rewrite markdown links from a local path prefix to a GitHub (or other) source URL.
   *  e.g. `(/src/foo.ts)` → `(https://github.com/user/repo/tree/master/src/foo.ts)` */
  sourceLinks?: DocusiteSourceLinks

  /** Template variables for .md files — use `@{key.path}` in markdown to inject values.
   *  Built-in: `packageJson` is auto-injected from the project's package.json. */
  contentInjections?: DocusiteContentInjection[]

  /** Client-side runtime script — called only in the browser (not during SSR).
   * The function body is inlined into the generated theme's `enhanceApp()`.
   * Dynamic imports inside are resolved relative to `docs/.vitepress/theme/`.
   * @example
   * ```ts
   * runtimeScript: () => {
   *   void import('my-devtools').then((m) => m.loadDevtools())
   * }
   * ```
   */
  runtimeScript?: () => void

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
 *   colors: { light: ['#646cff', '#ff6466', '#21ffc7'], dark: ['#535bf2', '#ff6466', '#21ffc7'] },
 * })
 * ```
 */
export function defineConfig(config: DocusiteConfig): DocusiteConfig {
  return config
}
