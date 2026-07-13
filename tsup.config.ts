import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/node/cli.ts'],
    format: ['esm'],
    target: 'node20',
    outDir: 'dist/node',
    banner: {
      js: `import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);`,
    },
    external: ['vitepress', 'vitepress-plugin-llms', 'unocss', 'unocss/vite'],
    clean: true,
  },
  {
    entry: ['src/shared/types.ts'],
    format: ['esm'],
    target: 'node20',
    outDir: 'dist/shared',
    dts: true,
    clean: false,
  },
  // Copy Vue components as-is (not compiled by tsup)
  {
    entry: ['src/node/theme/components/NavVersionsFlyout.vue', 'src/node/theme/components/OldVersionBanner.vue', 'src/node/theme/components/ReactMark.vue'],
    outDir: 'dist/node/theme/components',
    loader: {
      '.vue': 'copy',
    },
    clean: false,
  },
])
