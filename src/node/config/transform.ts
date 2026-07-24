import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteConfig, DocusiteContentInjection, DocusiteLocale, DocusiteNav, DocusiteSearch, DocusiteSitemapOptions, DocusiteVersions } from '../../shared/types.js'
import { prepareContentInjections } from './content-injections.js'
import { detectFrameworkMarksInMarkdown, type FrameworkMarkName } from './framework-marks.js'
import { resolveRuntimeScriptCode } from './runtime-script.js'
import { generateBrandCSS, generateBaseCSS } from '../theme/css.js'

// ---------------------------------------------------------------------------
// Framework mark SVGs (shared between components and sidebar text transform)
// ---------------------------------------------------------------------------

const REACT_LOGO_SVG = '<svg class="vp-sidebar-react-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" aria-hidden="true"><circle cx="0" cy="0" r="2.05" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>'

const SOLID_LOGO_SVG = '<svg class="vp-sidebar-solid-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 155.3" aria-hidden="true"><defs><linearGradient id="solid-a" gradientUnits="userSpaceOnUse" x1="27.5" y1="3" x2="152" y2="63.5"><stop offset=".1" stop-color="#76b3e1"/><stop offset=".3" stop-color="#dcf2fd"/><stop offset="1" stop-color="#76b3e1"/></linearGradient><linearGradient id="solid-b" gradientUnits="userSpaceOnUse" x1="95.8" y1="32.6" x2="74" y2="105.2"><stop offset="0" stop-color="#76b3e1"/><stop offset=".5" stop-color="#4377bb"/><stop offset="1" stop-color="#1f3b77"/></linearGradient><linearGradient id="solid-c" gradientUnits="userSpaceOnUse" x1="18.4" y1="64.2" x2="144.3" y2="149.8"><stop offset="0" stop-color="#315aa9"/><stop offset=".5" stop-color="#518ac8"/><stop offset="1" stop-color="#315aa9"/></linearGradient><linearGradient id="solid-d" gradientUnits="userSpaceOnUse" x1="75.2" y1="74.5" x2="24.4" y2="260.8"><stop offset="0" stop-color="#4377bb"/><stop offset=".5" stop-color="#1a336b"/><stop offset="1" stop-color="#1a336b"/></linearGradient></defs><path d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" fill="#76b3e1"/><path d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" opacity=".3" fill="url(#solid-a)"/><path d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" fill="#518ac8"/><path d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" opacity=".3" fill="url(#solid-b)"/><path d="M134 80a45 45 0 00-48-15L24 85 4 120l112 19 20-36c4-7 3-15-2-23z" fill="url(#solid-c)"/><path d="M114 115a45 45 0 00-48-15L4 120s53 40 94 30l3-1c17-5 23-21 13-34z" fill="url(#solid-d)"/></svg>'

const VUE_LOGO_SVG = '<svg class="vp-sidebar-vue-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.76 226.69" aria-hidden="true"><path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" fill="#41b883"/><path d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.532 136.01L209.409.001z" fill="#35495e"/></svg>'

/** Replace framework mark placeholders in text with inline SVG HTML */
function replaceFrameworkMarks(text: string): string {
  return text
    .replace(
      /<ReactMark\s*\/>/g,
      `<span class="vp-sidebar-react-mark">${REACT_LOGO_SVG}</span>`,
    )
    .replace(
      /<SolidMark\s*\/>/g,
      `<span class="vp-sidebar-solid-mark">${SOLID_LOGO_SVG}</span>`,
    )
    .replace(
      /<VueMark\s*\/>/g,
      `<span class="vp-sidebar-vue-mark">${VUE_LOGO_SVG}</span>`,
    )
}

/** Recursively walk nav items and transform framework marks in text fields */
function transformNav(items: DefaultTheme.NavItem[]): void {
  for (const item of items) {
    if ('text' in item && typeof item.text === 'string') {
      item.text = replaceFrameworkMarks(item.text)
    }
    if ('items' in item && Array.isArray(item.items)) {
      transformNav(item.items as DefaultTheme.NavItem[])
    }
  }
}

/** Recursively walk sidebar items and transform framework marks in text fields */
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
      group.text = replaceFrameworkMarks(group.text)
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
  /** True when user configured real i18n `locales` (not only virtual version locales). */
  hasI18n?: boolean
  /** Framework mark Vue components used live in markdown (not nav/sidebar placeholders). */
  frameworkMarks?: FrameworkMarkName[]
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
    // Hide stock VitePress language switchers; theme injects version-aware ones.
    vpConfig.head.push([
      'style',
      {},
      '.VPNavBar .VPNavBarTranslations:not(.docusite-translations),' +
        '.VPNavScreen .VPNavScreenTranslations:not(.docusite-translations){' +
        'display:none!important}',
    ])
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

    vpConfig.locales ??= {}
    const applied = applyNavLocales(
      vpConfig.locales,
      config.nav,
      autoNavItems,
      deriveRootLabel(config),
      deriveRootLang(config),
    )
    if (applied) hasPathKeyedNav = true
    if (Object.keys(vpConfig.locales).length === 0) delete vpConfig.locales
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

  // -- Open Graph / Twitter / canonical (when site hostname is known) --
  const siteHostname = resolveSiteHostname(config, sitemapResolved?.hostname)
  if (siteHostname) {
    vpConfig.head ??= []
    appendHeadTags(vpConfig.head, buildOpenGraphHeadTags(config, siteHostname))
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
    hasI18n: !!config.locales,
    frameworkMarks: detectFrameworkMarksInMarkdown(docsDir),
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

/**
 * Resolve absolute site hostname for OG / canonical URLs.
 * Prefers explicit sitemap hostname, then sitemap result, then GitHub Pages derivation.
 */
function resolveSiteHostname(
  config: DocusiteConfig,
  sitemapHostname?: string,
): string | undefined {
  if (typeof config.sitemap === 'object' && config.sitemap.hostname) {
    return config.sitemap.hostname
  }
  if (sitemapHostname) return sitemapHostname
  if (config.github) return deriveSitemapHostname(config.github)
  return undefined
}

// ---------------------------------------------------------------------------
// Open Graph / Twitter
// ---------------------------------------------------------------------------

type HeadTag = NonNullable<UserConfig['head']>[number]

/**
 * Build site-level Open Graph, Twitter Card, and canonical tags
 * (same set as sborshik `defineDocsVitepressConfig`).
 * Image tags are added only when `logos.banner` is set.
 */
function buildOpenGraphHeadTags(config: DocusiteConfig, hostname: string): HeadTag[] {
  const siteRoot = hostname.replace(/\/$/, '')
  const siteUrl = `${siteRoot}/`
  const siteTitle = config.title || 'Documentation'
  const siteDescription =
    config.description || `${siteTitle} documentation website`
  const locale = config.locales?.root?.lang ?? 'en'

  const tags: HeadTag[] = [
    ['link', { rel: 'canonical', href: siteUrl }],
    ['meta', { property: 'og:title', content: siteTitle }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:locale', content: locale }],
    ['meta', { property: 'og:site_name', content: siteTitle }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: siteTitle }],
    ['meta', { name: 'twitter:title', content: siteTitle }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
  ]

  if (config.logos?.banner) {
    const siteBannerUrl = `${siteRoot}${resolvePublicAssetPath(config.logos.banner)}`
    const imageAlt = `${siteTitle} logo`
    tags.push(
      ['meta', { property: 'og:image', content: siteBannerUrl }],
      ['meta', { property: 'og:image:alt', content: imageAlt }],
      ['meta', { name: 'twitter:image', content: siteBannerUrl }],
      ['meta', { name: 'twitter:image:alt', content: imageAlt }],
    )
  }

  return tags
}

/** Append head tags, skipping ones the user already provided. */
function appendHeadTags(head: NonNullable<UserConfig['head']>, tags: HeadTag[]): void {
  for (const tag of tags) {
    if (hasMatchingHeadTag(head, tag)) continue
    head.push(tag)
  }
}

function hasMatchingHeadTag(head: NonNullable<UserConfig['head']>, tag: HeadTag): boolean {
  if (!Array.isArray(tag)) return false
  const [name, attrs] = tag
  if (!attrs || typeof attrs !== 'object') return false

  if (name === 'link' && 'rel' in attrs) {
    return head.some((existing) => {
      if (!Array.isArray(existing) || existing[0] !== 'link') return false
      return (existing[1] as Record<string, string>).rel === (attrs as Record<string, string>).rel
    })
  }

  if (name === 'meta') {
    const key = 'property' in attrs ? 'property' : 'name' in attrs ? 'name' : undefined
    if (!key) return false
    const value = (attrs as Record<string, string>)[key]
    return head.some((existing) => {
      if (!Array.isArray(existing) || existing[0] !== 'meta') return false
      return (existing[1] as Record<string, string>)[key] === value
    })
  }

  return false
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

/**
 * Apply path-keyed nav onto VitePress locales.
 *
 * - Existing i18n locales (e.g. `ru`) keep their label/lang/link; only `themeConfig.nav` is set.
 * - New virtual locales (e.g. `v1`, `ru/v1`) inherit label/lang from the longest parent
 *   i18n locale (or root), so same-language version locales collapse in the language switcher.
 */
function applyNavLocales(
  locales: Record<string, any>,
  pathKeyedNav: Record<string, DefaultTheme.NavItem[]>,
  autoNavItems: DefaultTheme.NavItem[],
  rootLabel: string,
  rootLang: string,
): boolean {
  let applied = false

  for (const [pathPrefix, navItems] of Object.entries(pathKeyedNav)) {
    // The '/' key goes into themeConfig.nav on the main config, not a locale
    if (pathPrefix === '/') continue

    // Strip leading/trailing slashes to create locale key
    // e.g. '/v1/' → 'v1', '/ru/v1/' → 'ru/v1'
    const localeKey = pathPrefix.replace(/^\/|\/$/g, '')
    if (!localeKey) continue

    const fullNav = [...navItems, ...autoNavItems]
    transformNav(fullNav)

    const existing = locales[localeKey]
    if (existing) {
      existing.themeConfig = existing.themeConfig ?? {}
      existing.themeConfig.nav = fullNav
    } else {
      const { label, lang } = findParentLocaleIdentity(locales, localeKey, rootLabel, rootLang)
      locales[localeKey] = {
        label,
        lang,
        themeConfig: { nav: fullNav },
      }
    }
    applied = true
  }

  return applied
}

/** Longest existing locale prefix of `localeKey`, else root label/lang. */
function findParentLocaleIdentity(
  locales: Record<string, any>,
  localeKey: string,
  rootLabel: string,
  rootLang: string,
): { label: string; lang: string } {
  const parts = localeKey.split('/')
  for (let i = parts.length - 1; i >= 1; i--) {
    const parentKey = parts.slice(0, i).join('/')
    const parent = locales[parentKey]
    if (parent?.label != null) {
      return {
        label: parent.label,
        lang: parent.lang ?? rootLang,
      }
    }
  }

  const root = locales.root
  return {
    label: root?.label ?? rootLabel,
    lang: root?.lang ?? rootLang,
  }
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
