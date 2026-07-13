<script setup lang="ts">
import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue'
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import VPNavScreenMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue'
import VPNavScreenMenuGroupLink from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue'
import { useData } from 'vitepress'
import { computed } from 'vue'

const props = defineProps<{
  screenMenu?: boolean
  latestLabel: string
  latestLink: string
  olderVersions?: Array<{ label: string; link: string }>
}>()

const { page } = useData()

const items = computed(() => [
  { text: `${props.latestLabel} (latest)`, link: props.latestLink },
  ...(props.olderVersions ?? []).map(v => ({ text: v.label, link: v.link })),
])

const buttonLabel = computed(() => {
  const rel = page.value.relativePath
  for (const v of props.olderVersions ?? []) {
    // Extract the version prefix from the link, e.g. "/v6/" from "/v6/intro"
    const match = v.link.match(/^\/(v\d+)\//)
    if (match && rel.startsWith(match[1] + '/')) return v.label
  }
  return props.latestLabel
})
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
