<script setup lang="ts">
import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue'
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import VPNavScreenMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue'
import VPNavScreenMenuGroupLink from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue'
import { useData } from 'vitepress'
import { computed } from 'vue'
import {
  currentVersionLabel,
  parseDocPath,
  withLocalePrefix,
} from '../version-locale.js'

const props = defineProps<{
  screenMenu?: boolean
  latestLabel: string
  latestLink: string
  olderVersions?: Array<{ label: string; link: string }>
}>()

const { page, site } = useData()

const localeKeys = computed(() => Object.keys(site.value.locales ?? {}))

const localePrefix = computed(() =>
  parseDocPath(page.value.relativePath, localeKeys.value).localePrefix,
)

const items = computed(() => [
  {
    text: `${props.latestLabel} (latest)`,
    link: withLocalePrefix(props.latestLink, localePrefix.value),
  },
  ...(props.olderVersions ?? []).map((v) => ({
    text: v.label,
    link: withLocalePrefix(v.link, localePrefix.value),
  })),
])

const buttonLabel = computed(() =>
  currentVersionLabel(page.value.relativePath, props.latestLabel, props.olderVersions),
)
</script>

<template>
  <VPFlyout
    v-if="!screenMenu"
    :button="buttonLabel"
    class="nav-versions-flyout"
  >
    <div class="items">
      <VPLink
        v-for="item of items"
        :key="item.link"
        :href="item.link"
        class="item"
      >
        {{ item.text }}
      </VPLink>
    </div>
  </VPFlyout>
  <VPNavScreenMenuGroup v-else :text="buttonLabel">
    <VPNavScreenMenuGroupLink
      v-for="item of items"
      :key="item.link"
      :href="item.link"
      :text="item.text"
    />
  </VPNavScreenMenuGroup>
</template>

<style scoped>
.nav-versions-flyout .button {
  height: auto;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: none;
  box-shadow: 0 0 5px var(--vp-c-brand-2);
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: rgba(255, 255, 255, 0.98);
  font-weight: 600;
  font-size: 12px;
  transition: opacity 0.25s;
}

.nav-versions-flyout .button:hover {
  opacity: 0.9;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
}

.item {
  display: block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  transition: background-color 0.25s;
  text-decoration: none;
}

.item:hover {
  background-color: var(--vp-c-default-soft);
}
</style>
