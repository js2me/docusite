import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteConfig, DocusiteContentInjection, DocusiteLocale, DocusiteSearch, DocusiteVersions } from '../../shared/types.js'
import { prepareContentInjections } from './content-injections.js'
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
}

export function transformConfig(config: DocusiteConfig, docsDir: string, cwd = process.cwd()): TransformResult {
  const vpConfig: UserConfig<DefaultTheme.Config> = {}
  const contentInjections = prepareContentInjections(config.contentInjections, cwd)

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
  if (config.nav) {
    themeConfig.nav = [...config.nav]
    transformNav(themeConfig.nav)
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

  // -- Versioning → add NavVersionsFlyout to nav --
  if (config.versions) {
    themeConfig.nav ??= []
    const v = config.versions
    const latestLabel = v.latest.startsWith('v') ? v.latest : `v${v.latest}`
    // Find the first page link to use as the latest version link
    const latestLink = findFirstLink(config.sidebar)
    themeConfig.nav.push({
      component: 'NavVersionsFlyout',
      props: {
        latestLabel,
        latestLink: latestLink || '/',
        olderVersions: v.older,
      },
    } as any)
  }

  // -- Changelog → add CHANGELOG link to nav (default: true) --
  let changelogSrc: string | undefined
  if (config.changelog !== false) {
    themeConfig.nav ??= []
    if (typeof config.changelog === 'object') {
      // { src: string, link?: string }
      changelogSrc = config.changelog.src
      const changelogLink = config.changelog.link ?? '/changelog'
      themeConfig.nav.push({ text: 'CHANGELOG', link: changelogLink })
    } else {
      const changelogLink = typeof config.changelog === 'string' ? config.changelog : '/changelog'
      themeConfig.nav.push({ text: 'CHANGELOG', link: changelogLink })
    }
  }

  // -- llms plugin → add LLM docs link to nav --
  // VitePress skips withBase for non-HTML assets (.txt) in nav links, so base must be inlined.
  const llmsEnabled = config.llms !== false
  if (llmsEnabled) {
    themeConfig.nav ??= []
    const basePrefix = (config.base ?? '/').replace(/\/$/, '')
    themeConfig.nav.push({ text: 'LLM, AI docs 🤖', link: `${basePrefix}/llms-full.txt` })

    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    const llmsMarker: any = { __docusite_llms: true }
    if (config.llms !== true && config.llms) {
      llmsMarker.__docusite_llms_options = config.llms
    }
    vpConfig.vite.plugins.push(llmsMarker)

    // Dev middleware for serving llms-full.txt in dev mode
    vpConfig.vite.plugins.push({
      __docusite_llms_dev: true,
      __docusite_llms_dev_docsDir: docsDir,
      __docusite_llms_dev_base: config.base ?? '/',
    } as any)
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
    runtimeScriptCode: config.runtimeScript?.toString(),
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
