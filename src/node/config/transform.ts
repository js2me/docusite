import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteConfig, DocusiteContentInjection, DocusiteLocale, DocusiteNav, DocusiteSearch, DocusiteSitemapOptions, DocusiteVersions } from '../../shared/types.js'
import { prepareContentInjections } from './content-injections.js'
import { resolveRuntimeScriptCode } from './runtime-script.js'
import { generateBrandCSS, generateBaseCSS } from '../theme/css.js'

// ---------------------------------------------------------------------------
// ReactMark SVG (shared between component and sidebar text transform)
// ---------------------------------------------------------------------------

const REACT_LOGO_SVG = '<svg class="vp-sidebar-react-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" aria-hidden="true"><circle cx="0" cy="0" r="2.05" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>'

/** Replace `<ReactMark />` placeholder in text with inline SVG HTML */
function replaceReactMark(text: string): string {
  return text.replace(
    /<ReactMark\s*\/>/g,
    `<span class="vp-sidebar-react-mark">${REACT_LOGO_SVG}</span>`,
  )
}

/** Recursively walk nav items and transform `<ReactMark />` in text fields */
function transformNav(items: DefaultTheme.NavItem[]): void {
  for (const item of items) {
    if ('text' in item && typeof item.text === 'string') {
      item.text = replaceReactMark(item.text)
    }
    if ('items' in item && Array.isArray(item.items)) {
      transformNav(item.items as DefaultTheme.NavItem[])
    }
  }
}

/** Recursively walk sidebar items and transform `<ReactMark />` in text fields */
function transformSidebar(sidebar: DefaultTheme.Sidebar): void {
  if (Array.isArray(sidebar)) {
    transformSidebarGroups(sidebar)
  } else {
    for (const groups of Object.values(sidebar)) {
      transformSidebarGroups(groups)
    }
  }
}

function transformSidebarGroups(groups: DefaultTheme.SidebarItem[]): void {
  for (const group of groups) {
    if ('text' in group && typeof group.text === 'string') {
      group.text = replaceReactMark(group.text)
    }
    if ('items' in group && Array.isArray(group.items)) {
      transformSidebarGroups(group.items as DefaultTheme.SidebarItem[])
    }
  }
}

// ---------------------------------------------------------------------------
// Transform DocusiteConfig → VitePress UserConfig
// ---------------------------------------------------------------------------

export interface TransformResult {
  config: UserConfig<DefaultTheme.Config>
  versions?: DocusiteVersions
  versionsLatestLink?: string
  changelogSrc?: string
  contentInjections?: DocusiteContentInjection[]
  runtimeScriptCode?: string
  hasPathKeyedNav?: boolean
}

export function transformConfig(config: DocusiteConfig, docsDir: string, cwd = process.cwd()): TransformResult {
  const vpConfig: UserConfig<DefaultTheme.Config> = {}
  const contentInjections = prepareContentInjections(config.contentInjections, cwd, config.packageJsonPath)

  // -- Site-level config --
  if (config.base) vpConfig.base = config.base
  if (config.title) vpConfig.title = config.title
  if (config.description) vpConfig.description = config.description
  if (config.head) vpConfig.head = [...config.head]

  // -- Theme config --
  const themeConfig: DefaultTheme.Config = {}

  if (config.logos?.main) {
    themeConfig.logo = resolvePublicAssetPath(config.logos.main)
  }

  // Favicon from logos.favicon (falls back to logos.main). Skip if user set one in `head`.
  // VitePress does not rewrite head href with `base` — do it explicitly.
  const faviconSrc = config.logos?.favicon ?? config.logos?.main
  if (faviconSrc) {
    vpConfig.head ??= []
    if (!hasFavicon(vpConfig.head)) {
      const faviconPath = resolvePublicAssetPath(faviconSrc)
      vpConfig.head.push([
        'link',
        { rel: 'icon', href: withSiteBase(faviconPath, config.base), type: faviconType(faviconPath) },
      ])
    }
  }
  if (config.sidebar) {
    themeConfig.sidebar = config.sidebar
    transformSidebar(themeConfig.sidebar)
  }
  const socialLinks = resolveSocialLinks(config)
  if (socialLinks) themeConfig.socialLinks = socialLinks

  // Include h1–h5 in the "On this page" outline (VitePress default is h2 only)
  themeConfig.outline = {
    level: [1, 5],
  }

  // -- Colors → CSS injection --
  vpConfig.head ??= []

  // Always inject docusite base CSS (navbar fixes)
  const baseCSS = generateBaseCSS()
  vpConfig.head.push(['style', {}, baseCSS])

  // Inject brand color variables if configured
  if (config.colors && (config.colors.light || config.colors.dark)) {
    const css = generateBrandCSS(config.colors)
    vpConfig.head.push(['style', {}, css])
  }

  // -- Search --
  if (config.search) {
    themeConfig.search = resolveSearch(config.search)
  }

  // -- Locales --
  if (config.locales) {
    vpConfig.locales = resolveLocales(config.locales)
  }

  // -- Build auto-appended nav items (versions flyout, changelog, llms) --
  const autoNavItems: DefaultTheme.NavItem[] = []
  let changelogSrc: string | undefined

  if (config.versions) {
    const v = config.versions
    const latestLabel = v.latest.startsWith('v') ? v.latest : `v${v.latest}`
    const latestLink = findFirstLink(config.sidebar)
    autoNavItems.push({
      component: 'NavVersionsFlyout',
      props: {
        latestLabel,
        latestLink: latestLink || '/',
        olderVersions: v.older,
      },
    } as any)
  }

  if (config.changelog !== false) {
    if (typeof config.changelog === 'object') {
      changelogSrc = config.changelog.src
      const changelogLink = config.changelog.link ?? '/changelog'
      autoNavItems.push({ text: 'CHANGELOG', link: changelogLink })
    } else {
      const changelogLink = typeof config.changelog === 'string' ? config.changelog : '/changelog'
      autoNavItems.push({ text: 'CHANGELOG', link: changelogLink })
    }
  }

  const llmsEnabled = config.llms !== false
  if (llmsEnabled) {
    const basePrefix = (config.base ?? '/').replace(/\/$/, '')
    autoNavItems.push({ text: 'LLM, AI docs 🤖', link: `${basePrefix}/llms.txt` })

    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    const llmsMarker: any = { __docusite_llms: true }
    if (config.llms !== true && config.llms) {
      llmsMarker.__docusite_llms_options = config.llms
    }
    vpConfig.vite.plugins.push(llmsMarker)

    // Dev middleware for serving llms.txt in dev mode
    vpConfig.vite.plugins.push({
      __docusite_llms_dev: true,
      __docusite_llms_dev_docsDir: docsDir,
      __docusite_llms_dev_base: config.base ?? '/',
    } as any)
  }

  // -- Nav: flat array or path-keyed --
  let hasPathKeyedNav = false

  if (isPathKeyedNav(config.nav)) {
    // Path-keyed nav: each path prefix gets its own nav via VitePress locales
    const rootNav = config.nav['/'] ?? []
    themeConfig.nav = [...rootNav, ...autoNavItems]
    transformNav(themeConfig.nav)

    const navLocaleEntries = resolveNavLocales(
      config.nav,
      autoNavItems,
      deriveRootLabel(config),
      deriveRootLang(config),
    )

    if (navLocaleEntries.length > 0) {
      vpConfig.locales ??= {}
      for (const entry of navLocaleEntries) {
        vpConfig.locales[entry.key] = entry.vpLocale
      }
      hasPathKeyedNav = true
    }
  } else if (config.nav) {
    // Flat nav (existing behavior)
    themeConfig.nav = [...config.nav, ...autoNavItems]
    transformNav(themeConfig.nav)
  } else {
    // No user nav — only auto-appended items
    if (autoNavItems.length > 0) {
      themeConfig.nav = [...autoNavItems]
      transformNav(themeConfig.nav)
    }
  }

  // Ensure locale keys are ordered longest-first for correct prefix matching
  if (vpConfig.locales) {
    vpConfig.locales = sortLocaleKeys(vpConfig.locales)
  }

  // -- UnoCSS icons (i-logos:*, etc.) --
  vpConfig.vite = vpConfig.vite ?? {}
  vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
  vpConfig.vite.plugins.push({ __docusite_unocss: true, __docusite_unocss_docsDir: docsDir } as any)

  // -- Custom CSS --
  if (config.customCss?.length) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    vpConfig.vite.plugins.push({ __docusite_custom_css: config.customCss })
  }

  // -- Content injections → add Vite transform plugin marker --
  if (contentInjections?.length) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    vpConfig.vite.plugins.push({ __docusite_content_injections: true, __docusite_content_injections_data: contentInjections } as any)
  }

  // -- Source links → rewrite (/src/...) markdown links to GitHub URLs --
  if (config.sourceLinks) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    vpConfig.vite.plugins.push({ __docusite_source_links: true, __docusite_source_links_options: config.sourceLinks } as any)
  }

  // -- logos.hero → inject hero.image into home layout markdown (falls back to logos.main) --
  const heroLogo = config.logos?.hero ?? config.logos?.main
  if (heroLogo) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    vpConfig.vite.plugins.push({
      __docusite_logos_hero: true,
      __docusite_logos_hero_src: resolvePublicAssetPath(heroLogo),
    } as any)
  }

  // -- Sitemap (enabled by default when `github` is set) --
  const sitemapResolved = resolveSitemap(config.sitemap, config.github)
  if (sitemapResolved) {
    vpConfig.sitemap = sitemapResolved
  }

  // -- Theme config overrides (applied last, take priority) --
  if (config.themeConfigOverrides) {
    Object.assign(themeConfig, config.themeConfigOverrides)
  }

  vpConfig.themeConfig = themeConfig

  // -- Site config overrides (applied last, take priority) --
  if (config.siteConfigOverrides) {
    Object.assign(vpConfig, config.siteConfigOverrides)
  }

  return {
    config: vpConfig,
    versions: config.versions,
    versionsLatestLink: config.versions ? (findFirstLink(config.sidebar) || '/') : undefined,
    changelogSrc,
    contentInjections,
    runtimeScriptCode: resolveRuntimeScriptCode(config.runtimeScript, cwd, docsDir),
    hasPathKeyedNav,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Config paths use docs-dir form including `public/` (e.g. `/public/logo.svg`).
 * VitePress serves `docs/public/` at site root, so strip the `public/` segment.
 */
function resolvePublicAssetPath(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const withoutPublic = normalized.replace(/^(?:\/)?public\//, '/')
  return withoutPublic.startsWith('/') ? withoutPublic : `/${withoutPublic}`
}

/** Prefix a root-absolute asset path with VitePress `base` (e.g. `/docusite` + `/logo.svg`). */
function withSiteBase(path: string, base = '/'): string {
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!normalizedBase || normalizedBase === '') return normalizedPath
  return `${normalizedBase}${normalizedPath}`
}

function faviconType(href: string): string {
  const ext = href.split('?')[0].split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'svg': return 'image/svg+xml'
    case 'png': return 'image/png'
    case 'ico': return 'image/x-icon'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    default: return 'image/png'
  }
}

function hasFavicon(head: NonNullable<UserConfig['head']>): boolean {
  return head.some((tag) => {
    if (!Array.isArray(tag) || tag[0] !== 'link') return false
    const rel = (tag[1] as Record<string, string>).rel ?? ''
    return /\bicon\b/i.test(rel) || rel === 'shortcut icon' || rel === 'apple-touch-icon'
  })
}

function resolveSocialLinks(config: DocusiteConfig): DefaultTheme.SocialLink[] | undefined {
  const links: DefaultTheme.SocialLink[] = []

  if (config.socialLinks) {
    links.push(...config.socialLinks.filter((link) => link.icon !== 'github'))
  }

  if (config.github) {
    links.push({ icon: 'github', link: config.github })
  }

  return links.length > 0 ? links : undefined
}

/** Find the first item link from the sidebar config to use as latest version link */
function findFirstLink(sidebar?: DefaultTheme.Sidebar): string | undefined {
  if (!sidebar) return undefined
  // Sidebar can be SidebarItem[] or Record<string, SidebarItem[]>
  const groups = Array.isArray(sidebar) ? sidebar : (sidebar as Record<string, any>)['/']
  if (!Array.isArray(groups)) return undefined

  for (const group of groups) {
    if ('items' in group && Array.isArray(group.items)) {
      for (const item of group.items) {
        if ('link' in item && item.link) return item.link
      }
    }
    if ('link' in group && group.link) return group.link
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

function resolveSitemap(
  sitemap: DocusiteConfig['sitemap'],
  github?: string,
): { hostname: string; lastmodDateOnly?: boolean } | undefined {
  // Explicitly disabled
  if (sitemap === false) return undefined

  const autoHostname = github ? deriveSitemapHostname(github) : undefined

  // `true` or omitted — use auto-derived hostname from `github`
  if (sitemap === true || sitemap === undefined) {
    return autoHostname ? { hostname: autoHostname } : undefined
  }

  // Object form — merge auto-derived hostname with explicit options
  return {
    hostname: sitemap.hostname ?? autoHostname ?? '',
    ...(sitemap.lastmodDateOnly !== undefined && { lastmodDateOnly: sitemap.lastmodDateOnly }),
  }
}

/**
 * Derive GitHub Pages hostname from a GitHub repo URL.
 * `https://github.com/js2me/docusite` → `https://js2me.github.io/docusite`
 */
function deriveSitemapHostname(github: string): string | undefined {
  const match = github.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return undefined
  const [, owner, repo] = match
  return `https://${owner}.github.io/${repo}`
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

function resolveSearch(search: DocusiteSearch): DefaultTheme.Config['search'] {
  if (search === 'local') {
    return { provider: 'local' }
  }

  if (search.provider === 'algolia') {
    return {
      provider: 'algolia',
      options: search.options,
    }
  }

  return { provider: 'local' }
}

// ---------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------

function resolveLocales(
  locales: Record<string, DocusiteLocale>,
): Record<string, NonNullable<UserConfig<DefaultTheme.Config>['locales']>[string]> {
  const result: Record<string, any> = {}

  for (const [key, locale] of Object.entries(locales)) {
    const vpLocale: Record<string, any> = {
      label: locale.label,
      lang: locale.lang,
    }

    if (key !== 'root' && locale.link) {
      vpLocale.link = locale.link
    }

    const localeTheme: Record<string, any> = {}
    if (locale.nav) localeTheme.nav = locale.nav
    if (locale.sidebar) localeTheme.sidebar = locale.sidebar
    if (Object.keys(localeTheme).length > 0) {
      vpLocale.themeConfig = localeTheme
    }

    result[key] = vpLocale
  }

  return result
}

// ---------------------------------------------------------------------------
// Path-keyed nav
// ---------------------------------------------------------------------------

/** Type guard: is the nav config a path-keyed Record (not a flat array)? */
function isPathKeyedNav(nav: DocusiteNav | undefined): nav is Record<string, DefaultTheme.NavItem[]> {
  return nav != null && !Array.isArray(nav)
}

/** Derive the label for virtual locales (for language switcher suppression) */
function deriveRootLabel(config: DocusiteConfig): string {
  if (config.locales?.root?.label) return config.locales.root.label
  return config.title || 'Root'
}

/** Derive the lang for virtual locales */
function deriveRootLang(config: DocusiteConfig): string {
  if (config.locales?.root?.lang) return config.locales.root.lang
  return 'en'
}

interface NavLocaleEntry {
  /** VitePress locale key (e.g. 'v1', 'api') */
  key: string
  /** VitePress locale config object */
  vpLocale: NonNullable<UserConfig<DefaultTheme.Config>['locales']>[string]
}

/**
 * Convert a path-keyed nav map into VitePress locale entries.
 * Each non-`/` key becomes a virtual locale with its own `themeConfig.nav`.
 * All virtual locales share the root label/lang so the language switcher
 * is suppressed (VitePress's `useLangs()` filters out same-label locales).
 */
function resolveNavLocales(
  pathKeyedNav: Record<string, DefaultTheme.NavItem[]>,
  autoNavItems: DefaultTheme.NavItem[],
  rootLabel: string,
  rootLang: string,
): NavLocaleEntry[] {
  const entries: NavLocaleEntry[] = []

  for (const [pathPrefix, navItems] of Object.entries(pathKeyedNav)) {
    // The '/' key goes into themeConfig.nav on the main config, not a locale
    if (pathPrefix === '/') continue

    // Strip leading/trailing slashes to create locale key
    // e.g. '/v1/' → 'v1', 'api' → 'api'
    const localeKey = pathPrefix.replace(/^\/|\/$/g, '')
    if (!localeKey) continue

    const fullNav = [...navItems, ...autoNavItems]
    transformNav(fullNav)

    entries.push({
      key: localeKey,
      vpLocale: {
        label: rootLabel,
        lang: rootLang,
        themeConfig: { nav: fullNav },
      },
    })
  }

  return entries
}

/**
 * Sort VitePress locale keys longest-first so `getLocaleForPath()` (which uses
 * `Object.keys().find()`) matches the most specific prefix first.
 * The 'root' key always stays last (it's the fallback).
 */
function sortLocaleKeys(locales: Record<string, any>): Record<string, any> {
  const entries = Object.entries(locales)
  entries.sort((a, b) => {
    if (a[0] === 'root') return 1
    if (b[0] === 'root') return -1
    return b[0].length - a[0].length
  })
  return Object.fromEntries(entries)
}
