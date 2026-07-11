import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'Docusite Playground',
  description: 'Test playground for docusite',
  colors: {
    light: '#646cff',
    dark: '#535bf2',
  },
  nav: [
    { text: 'Guide', link: '/guide/' },
    { text: 'API', link: '/api/' },
  ],
  sidebar: {
    '/guide/': [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/intro' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
    ],
    '/api/': [
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
  },
  search: 'local',
  llms: true,
  socialLinks: [
    { icon: 'github', link: 'https://github.com/user/docusite' },
  ],
})
