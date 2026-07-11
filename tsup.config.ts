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
    external: ['vitepress', 'vitepress-plugin-llms'],
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
])
