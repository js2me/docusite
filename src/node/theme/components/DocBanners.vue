<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import {
  isOldVersionPath,
  isLatestVersionPath,
  extractVersionSegment,
  parseDocPath,
  withLocalePrefix,
} from '../version-locale.js'

interface BannerConfig {
  message: string
  link?: { text: string; href: string }
  type?: 'info' | 'warning' | 'tip'
  dismissible?: boolean
  dismissKey?: string
}

interface ScopedBannerConfig extends BannerConfig {
  paths: string | string[]
}

interface ActiveBanner {
  key: string
  htmlMessage: string
  link?: { text: string; href: string }
  type: 'info' | 'warning' | 'tip'
  dismissible?: boolean
  dismissKey: string
}

const props = defineProps<{
  versionBanners: {
    latest: BannerConfig | null
    older: Record<string, BannerConfig>
  }
  olderVersionLinks: Array<{ link: string }>
  globalBanners: ScopedBannerConfig[]
  latestLabel: string
  latestLink: string
}>()

const { page, site } = useData()

const localeKeys = computed(() => Object.keys(site.value.locales ?? {}))

const localePrefix = computed(() =>
  parseDocPath(page.value.relativePath, localeKeys.value).localePrefix,
)

const localizedLatestLink = computed(() =>
  withLocalePrefix(props.latestLink, localePrefix.value),
)

// -- Dismissible state --

const dismissedKeys = ref<Record<string, boolean>>({})

function isDismissed(key: string): boolean {
  if (typeof window === 'undefined') return false
  if (dismissedKeys.value[key]) return true
  return localStorage.getItem(`docusite-banner-dismissed:${key}`) === '1'
}

function dismiss(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`docusite-banner-dismissed:${key}`, '1')
  }
  dismissedKeys.value = { ...dismissedKeys.value, [key]: true }
}

// -- Template interpolation --

function interpolate(template: string, versionLabel?: string): string {
  return template
    .replace(/\{latestLink\}/g, localizedLatestLink.value)
    .replace(/\{latestLabel\}/g, props.latestLabel)
    .replace(/\{versionLabel\}/g, versionLabel ?? '')
}

// -- Path matching for global banners --

function pathMatches(relPath: string, prefix: string): boolean {
  // Normalize: strip leading slash, strip trailing slash
  const normalized = prefix.replace(/^\//, '').replace(/\/$/, '')
  // '/' or '' matches all doc pages
  if (normalized === '') return true
  // Match: relPath starts with prefix/ or equals prefix
  return relPath.startsWith(`${normalized}/`) || relPath === normalized
}

// -- Resolve active version banner --

const activeVersionBanner = computed<ActiveBanner | null>(() => {
  const relPath = page.value.relativePath

  // Check older versions
  if (Object.keys(props.versionBanners.older).length > 0) {
    const currentVersion = extractVersionSegment(relPath)
    if (currentVersion && props.versionBanners.older[currentVersion]) {
      const banner = props.versionBanners.older[currentVersion]!
      const key = `version-${currentVersion}`
      const dismissKey = banner.dismissKey ?? key
      if (banner.dismissible && isDismissed(dismissKey)) return null
      return {
        key,
        htmlMessage: interpolate(banner.message, currentVersion),
        link: banner.link
          ? { text: banner.link.text, href: interpolate(banner.link.href, currentVersion) }
          : undefined,
        type: banner.type ?? 'warning',
        dismissible: banner.dismissible,
        dismissKey,
      }
    }
  }

  // Check latest version
  if (props.versionBanners.latest && isLatestVersionPath(relPath, props.olderVersionLinks)) {
    const banner = props.versionBanners.latest
    const key = 'version-latest'
    const dismissKey = banner.dismissKey ?? key
    if (banner.dismissible && isDismissed(dismissKey)) return null
    return {
      key,
      htmlMessage: interpolate(banner.message, props.latestLabel),
      link: banner.link
        ? { text: banner.link.text, href: interpolate(banner.link.href, props.latestLabel) }
        : undefined,
      type: banner.type ?? 'info',
      dismissible: banner.dismissible,
      dismissKey,
    }
  }

  return null
})

// -- Resolve active global banners --

const activeGlobalBanners = computed<ActiveBanner[]>(() => {
  const relPath = page.value.relativePath
  return props.globalBanners
    .filter((banner) => {
      const prefixes = Array.isArray(banner.paths) ? banner.paths : [banner.paths]
      return prefixes.some((prefix) => pathMatches(relPath, prefix))
    })
    .filter((banner, i) => {
      const dismissKey = banner.dismissKey ?? `global-${i}`
      if (banner.dismissible && isDismissed(dismissKey)) return false
      return true
    })
    .map((banner, i) => {
      const dismissKey = banner.dismissKey ?? `global-${i}`
      return {
        key: `global-${i}`,
        htmlMessage: interpolate(banner.message),
        link: banner.link
          ? { text: banner.link.text, href: interpolate(banner.link.href) }
          : undefined,
        type: banner.type ?? 'info',
        dismissible: banner.dismissible,
        dismissKey,
      }
    })
})

// -- Combined active banners --

const activeBanners = computed<ActiveBanner[]>(() => {
  const result: ActiveBanner[] = []
  if (activeVersionBanner.value) {
    result.push(activeVersionBanner.value)
  }
  result.push(...activeGlobalBanners.value)
  return result
})

// -- Icon by type --

function iconForType(type: 'info' | 'warning' | 'tip'): string {
  switch (type) {
    case 'info': return 'ℹ️'
    case 'warning': return '⚠️'
    case 'tip': return '💡'
  }
}
</script>

<template>
  <div v-if="activeBanners.length" class="docusite-banners">
    <div
      v-for="banner in activeBanners"
      :key="banner.key"
      :class="['docusite-banner', `docusite-banner--${banner.type}`]"
    >
      <span class="icon">{{ iconForType(banner.type) }}</span>
      <span class="text">{{ banner.htmlMessage }}</span>
      <a v-if="banner.link" :href="banner.link.href" class="link">{{ banner.link.text }}</a>
      <button v-if="banner.dismissible" class="dismiss" @click="dismiss(banner.dismissKey)" aria-label="Dismiss banner">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.docusite-banners {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.docusite-banner {
  padding: 12px;
  background: var(--docusite-banner-bg);
  border-radius: 10px;
  font-size: 16px;
  border: 1px solid var(--docusite-banner-border);
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

/* warning — matches existing OldVersionBanner exactly */
.docusite-banner--warning {
  --docusite-banner-bg: #f8f8f873;
  --docusite-banner-border: #f2a6008f;
}
html.dark .docusite-banner--warning {
  --docusite-banner-bg: #2a2a2a73;
  --docusite-banner-border: #f2a6005c;
}

/* info */
.docusite-banner--info {
  --docusite-banner-bg: #f0f6ff73;
  --docusite-banner-border: #3b82f68f;
}
html.dark .docusite-banner--info {
  --docusite-banner-bg: #1e293b73;
  --docusite-banner-border: #3b82f65c;
}

/* tip */
.docusite-banner--tip {
  --docusite-banner-bg: #f0fff473;
  --docusite-banner-border: #22c55e8f;
}
html.dark .docusite-banner--tip {
  --docusite-banner-bg: #1a2e1a73;
  --docusite-banner-border: #22c55e5c;
}

.icon {
  flex-shrink: 0;
}

.text {
  color: var(--vp-c-text-1);
}

.link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.link:hover {
  text-decoration: underline;
}

.dismiss {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.dismiss:hover {
  color: var(--vp-c-text-1);
}
</style>
