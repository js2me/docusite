import { resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'

const CONFIG_FILES = [
  'docusite.config.ts',
  'docusite.config.mts',
  'docusite.config.js',
  'docusite.config.mjs',
]

const starterConfig = `import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'My project documentation',
  colors: {
    light: '#646cff',
    dark: '#535bf2',
  },
  nav: [
    { text: 'Guide', link: '/introduction/getting-started' },
    { text: 'API', link: '/api/overview' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
  },
  search: 'local',
  github: 'https://github.com/user/repo',
})
`

export async function init() {
  const cwd = process.cwd()

  for (const file of CONFIG_FILES) {
    if (existsSync(resolve(cwd, file))) {
      console.error(`Config file already exists: ${file}`)
      process.exit(1)
    }
  }

  const configPath = resolve(cwd, 'docusite.config.ts')
  writeFileSync(configPath, starterConfig, 'utf-8')
  console.log(`Created ${configPath}`)
}
