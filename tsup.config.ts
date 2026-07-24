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
    entry: [
      'src/node/theme/components/NavVersionsFlyout.vue',
      'src/node/theme/components/OldVersionBanner.vue',
      'src/node/theme/components/NavBarTranslations.vue',
      'src/node/theme/components/NavScreenTranslations.vue',
      'src/node/theme/components/ReactMark.vue',
      'src/node/theme/components/SolidMark.vue',
      'src/node/theme/components/VueMark.vue',
    ],
    outDir: 'dist/node/theme/components',
    loader: {
      '.vue': 'copy',
    },
    clean: false,
  },
  // Client theme helpers copied into docs/.vitepress/theme/ at generate time
  {
    entry: [
      'src/node/theme/outline-active-scroll.ts',
      'src/node/theme/sidebar-active-scroll.ts',
      'src/node/theme/version-locale.ts',
      'src/node/theme/docusite-langs.ts',
    ],
    outDir: 'dist/node/theme',
    format: ['esm'],
    target: 'es2020',
    dts: false,
    clean: false,
    splitting: false,
    // Keep VitePress as external — these modules run in the VitePress client bundle
    external: ['vue', 'vitepress'],
  },
])
