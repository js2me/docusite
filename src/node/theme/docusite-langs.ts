import { computed } from 'vue'
import { useData } from 'vitepress'
import { buildLocaleLink, isVersionLocaleKey } from './version-locale.js'

/**
 * Language switcher that lists only primary i18n locales (not virtual version
 * locales like `v1` / `ru/v1`) and preserves the current version in links.
 */
export function useDocusiteLangs() {
  const { site, localeIndex, page, hash } = useData()

  const localeKeys = computed(() => Object.keys(site.value.locales ?? {}))

  const primaryLocales = computed(() =>
    Object.entries(site.value.locales ?? {}).filter(
      ([key, value]) =>
        !!value?.label && (key === 'root' || !isVersionLocaleKey(key)),
    ),
  )

  const currentPrimaryKey = computed(() => {
    const index = localeIndex.value
    if (index === 'root' || !isVersionLocaleKey(index)) return index
    // `ru/v1` → `ru`, `v1` → `root`
    const parent = index.split('/').slice(0, -1).join('/')
    return parent || 'root'
  })

  const currentLang = computed(() => {
    const key = currentPrimaryKey.value
    const locale = site.value.locales[key] ?? site.value.locales[localeIndex.value]
    return {
      label: locale?.label,
      link: locale?.link || (key === 'root' ? '/' : `/${key}/`),
    }
  })

  const localeLinks = computed(() =>
    primaryLocales.value.flatMap(([key, value]) => {
      if (key === currentPrimaryKey.value) return []
      if (!value.label || value.label === currentLang.value.label) return []

      const link =
        buildLocaleLink(
          page.value.relativePath,
          key,
          localeKeys.value,
          site.value.cleanUrls === true,
        ) + (hash.value || '')

      return [{ text: value.label, link }]
    }),
  )

  return { localeLinks, currentLang }
}
