import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteConfig, DocusiteLocale, DocusiteSearch } from '../../shared/types.js'
import { generateBrandCSS } from '../theme/css.js'

// ---------------------------------------------------------------------------
// Transform DocusiteConfig → VitePress UserConfig
// ---------------------------------------------------------------------------

export function transformConfig(config: DocusiteConfig, docsDir: string): UserConfig<DefaultTheme.Config> {
  const vpConfig: UserConfig<DefaultTheme.Config> = {}

  // -- Site-level config --
  if (config.title) vpConfig.title = config.title
  if (config.description) vpConfig.description = config.description
  if (config.head) vpConfig.head = [...config.head]

  // -- Theme config --
  const themeConfig: DefaultTheme.Config = {}

  if (config.logo) themeConfig.logo = config.logo
  if (config.nav) themeConfig.nav = config.nav
  if (config.sidebar) themeConfig.sidebar = config.sidebar
  if (config.socialLinks) themeConfig.socialLinks = config.socialLinks

  // -- Colors → CSS injection --
  if (config.colors && (config.colors.light || config.colors.dark)) {
    const css = generateBrandCSS(config.colors)
    vpConfig.head ??= []
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

  // -- llms plugin --
  const llmsEnabled = config.llms !== false
  if (llmsEnabled) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    // Push a marker that the serializer will recognize and replace with llms() call
    const llmsMarker: any = { __docusite_llms: true }
    if (config.llms !== true && config.llms) {
      llmsMarker.__docusite_llms_options = config.llms
    }
    vpConfig.vite.plugins.push(llmsMarker)
  }

  // -- Custom CSS --
  if (config.customCss?.length) {
    vpConfig.vite = vpConfig.vite ?? {}
    vpConfig.vite.plugins = vpConfig.vite.plugins ?? []
    // Push a marker that the serializer will handle
    vpConfig.vite.plugins.push({ __docusite_custom_css: config.customCss })
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

  return vpConfig
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

    // Non-root locales need a `link` prefix
    if (key !== 'root' && locale.link) {
      vpLocale.link = locale.link
    }

    // Per-locale theme config
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
