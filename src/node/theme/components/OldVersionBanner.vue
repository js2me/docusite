<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import {
  isOldVersionPath,
  parseDocPath,
  withLocalePrefix,
} from '../version-locale.js'

const props = defineProps<{
  latestLabel: string
  latestLink: string
  olderVersions?: Array<{ label: string; link: string }>
  message?: string
}>()

const { page, site } = useData()

const localeKeys = computed(() => Object.keys(site.value.locales ?? {}))

const localePrefix = computed(() =>
  parseDocPath(page.value.relativePath, localeKeys.value).localePrefix,
)

const localizedLatestLink = computed(() =>
  withLocalePrefix(props.latestLink, localePrefix.value),
)

const isOldVersion = computed(() =>
  isOldVersionPath(page.value.relativePath, props.olderVersions),
)

const bannerMessage = computed(() => {
  if (props.message) {
    return props.message
      .replace(/\{latestLink\}/g, localizedLatestLink.value)
      .replace(/\{latestLabel\}/g, props.latestLabel)
  }
  return `You are viewing an older version. Switch to the latest version (${props.latestLabel}).`
})
</script>

<template>
  <div v-if="isOldVersion" class="docusite-old-version-banner">
    <span class="icon">⚠️</span>
    <span class="text">{{ bannerMessage }}</span>
    <a :href="localizedLatestLink" class="link">View latest →</a>
  </div>
</template>

<style scoped>
.docusite-old-version-banner {
  padding: 12px;
  margin-bottom: 16px;
  margin-left: 0;
  background: #f8f8f873;
  border-radius: 10px;
  font-size: 16px;
  border: 1px solid #f2a6008f;
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

html.dark .docusite-old-version-banner {
  background: #2a2a2a73;
  border-color: #f2a6005c;
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
</style>
