import type { DefaultTheme, HeadConfig } from 'vitepress'

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

export interface DocusiteColors {
  /**
   * Brand color(s) for light theme.
   * A single hex for a monochrome palette, or 3 colors for gradient animation.
   * Interactive elements always use the first color; hover/active are lightened from it.
   * With 3 colors, the full tuple drives home hero + doc title gradients.
   * @example `'#646cff'`
   * @example `['#646cff', '#ff6466', '#21ffc7']`
   */
  light?: string | [string, string, string]
  /**
   * Brand color(s) for dark theme.
   * A single hex for a monochrome palette, or 3 colors for gradient animation.
   * Interactive elements always use the first color; hover/active are lightened from it.
   * With 3 colors, the full tuple drives home hero + doc title gradients.
   * @example `'#535bf2'`
   * @example `['#535bf2', '#ff6466', '#21ffc7']`
   */
  dark?: string | [string, string, string]
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** Navigation items, either a flat array or path-keyed map (like sidebar) */
export type DocusiteNav = DefaultTheme.NavItem[] | Record<string, DefaultTheme.NavItem[]>

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
// Banner
// ---------------------------------------------------------------------------

/** Visual style for a doc banner. */
export type DocusiteBannerType = 'info' | 'warning' | 'tip'

/** A single banner configuration. */
export interface DocusiteBanner {
  /** Banner message. Supports template variables:
   *  - `{latestLink}` — link to latest version entry page
   *  - `{latestLabel}` — label like "v3.0.0"
   *  - `{versionLabel}` — the current version's label (per-version banners only)
   */
  message: string
  /** Link text + URL for a call-to-action. If omitted, no link is shown. */
  link?: {
    /** Link label, e.g. `'View latest →'` */
    text: string
    /** Link URL. Supports the same template variables as `message`. */
    href: string
  }
  /** Visual style (default: `'warning'` for version banners, `'info'` for global) */
  type?: DocusiteBannerType
  /** Allow users to dismiss the banner (persisted in localStorage). */
  dismissible?: boolean
  /** localStorage key suffix for dismiss persistence. Auto-generated if not set when `dismissible` is true. */
  dismissKey?: string
}

/** A global/announcement banner scoped by path prefix. */
export interface DocusiteScopedBanner extends DocusiteBanner {
  /**
   * Path prefix(es) where this banner shows.
   * Use `'/'` for all doc pages. Use `'/v2/'` for v2 pages only.
   * String for one prefix, array for multiple.
   */
  paths: string | string[]
}

// ---------------------------------------------------------------------------
// Versioning
// ---------------------------------------------------------------------------

export interface DocusiteVersion {
  /** Display label, e.g. `'v6.x.x'` */
  label: string
  /** Link to the version's entry page, e.g. `'/v6/introduction/getting-started'` */
  link: string
  /** Banner shown on pages within this older version. Set to `false` to explicitly disable. */
  banner?: DocusiteBanner | false
}

export interface DocusiteVersions {
  /** Current (latest) version label, e.g. `'7.2.1'` or `'v3.0.0'` */
  latest: string
  /** Older versions */
  older?: DocusiteVersion[]
  /**
   * Banner shown on latest version pages.
   * @example `{ message: 'You are viewing the latest stable documentation.', type: 'info' }`
   */
  latestBanner?: DocusiteBanner | false
  /**
   * @deprecated Use per-version `banner` on `older[]` items and `latestBanner` instead.
   * If set, applies as the default banner for all older versions that don't have their own `banner`.
   */
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

/** A changelog source for one package in a monorepo. */
export interface DocusiteChangelogPackage {
  /** Package name displayed in the navigation. */
  name: string
  /** Path to the package's CHANGELOG.md, relative to the project root. */
  path: string
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
// Sitemap
// ---------------------------------------------------------------------------

export interface DocusiteSitemapOptions {
  /**
   * Site hostname for sitemap URLs, e.g. `'https://myproject.dev'`.
   * When `github` is set, auto-derived from the GitHub URL (e.g. `'https://js2me.github.io/docusite'`).
   * Set explicitly to override the auto-derived value.
   */
  hostname?: string
  /** Include only the date (not time) in `<lastmod>` tags (default: `false`) */
  lastmodDateOnly?: boolean
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
   * Supports `@{key.path}` template syntax, e.g. `` `/@{packageJson.description}/` ``
   */
  base?: string

  /** Site title. Supports `@{key.path}` template syntax, e.g. `'@{packageJson.name}'` */
  title?: string
  /** Site description. Supports `@{key.path}` template syntax, e.g. `'@{packageJson.description}'` */
  description?: string
  /**
   * Site logos — paths relative to the docs directory, including `public/`.
   * Example: `'/public/logo.svg'` (file at `docs/public/logo.svg`).
   * - `main` — navbar logo next to the site title
   * - `hero` — home page hero image (`layout: home`); falls back to `main` if omitted
   * - `favicon` — browser tab icon; falls back to `main` if omitted
   * - `banner` — Open Graph / Twitter card image (e.g. `'/public/banner.png'`)
   */
  logos?: {
    main?: string
    hero?: string
    favicon?: string
    banner?: string
  }

  /** Brand colors — auto-generates VitePress CSS variables */
  colors?: DocusiteColors

  /** Navigation items (flat array) or path-keyed per-section navigation (like sidebar) */
  nav?: DocusiteNav
  /** Sidebar configuration */
  sidebar?: DefaultTheme.Sidebar

  /** i18n locales */
  locales?: Record<string, DocusiteLocale>

  /** Version selector — adds a NavVersionsFlyout to the navbar */
  versions?: DocusiteVersions

  /** Global/announcement banners, scoped by path prefix.
   *  Show on doc pages whose relativePath matches the `paths` prefix.
   *  @example
   *  ```ts
   *  banners: [
   *    { paths: '/', message: 'We are hiring!', type: 'info', dismissible: true },
   *    { paths: '/beta/', message: 'This is beta documentation.', type: 'warning' },
   *  ]
   *  ```
   */
  banners?: DocusiteScopedBanner[]

  /** Show CHANGELOG link in the navbar. An array configures changelogs for monorepo packages. */
  changelog?: boolean | string | DocusiteChangelog | DocusiteChangelogPackage[]

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

  /** Custom path to package.json (relative to the project root).
   *  By default, docusite reads `package.json` from the project root (`cwd`).
   *  Set this to load it from a different location, e.g. `'..'` to read from the parent directory. */
  packageJsonPath?: string

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

  /** Enable sitemap.xml generation (default: `true` when `github` is set).
   *  - `true` — auto-derive hostname from `github` URL
   *  - `false` — disable sitemap
   *  - `{ hostname, lastmodDateOnly }` — explicit options (hostname auto-derived from `github` if omitted)
   */
  sitemap?: boolean | DocusiteSitemapOptions

  /** Raw VitePress site config overrides (merged last) */
  siteConfigOverrides?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// defineConfig helper
// ---------------------------------------------------------------------------

/**
 * Define docusite configuration with type hints.
 *
 * String fields support `@{key.path}` template syntax for referencing
 * content injection values (built-in: `packageJson` from package.json).
 *
 * @example
 * ```ts
 * import { defineConfig } from 'docusite'
 *
 * export default defineConfig({
 *   base: `/@{packageJson.description}/`,
 *   title: '@{packageJson.name}',
 *   description: '@{packageJson.description}',
 *   colors: { light: '#646cff', dark: '#535bf2' },
 * })
 * ```
 */
export function defineConfig(config: DocusiteConfig): DocusiteConfig {
  return config
}
