import { defineConfig } from 'docusite';

export default defineConfig({
  title: 'Docusite Playground',
  description: 'Test playground for docusite',
  colors: {
    light: ['#646cff', '#ff6466', '#21ffc7'],
    dark: ['#535bf2', '#ff6466', '#21ffc7'],
  },
  nav: [
    { text: 'Guide', link: '/introduction/getting-started' },
    { text: 'API', link: '/api/overview' },
  ],
  runtimeScript: () => {
    console.log('runtime script!');
  },
  sidebar: {
    '/v1/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/v1/introduction/getting-started' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/v1/api/overview' },
        ],
      },
    ],
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: '<ReactMark /> Hooks', link: '/api/react-hooks' },
        ],
      },
    ],
  },
  changelog: { src: 'CHANGELOG.md' },
  search: 'local',
  llms: true,
  versions: {
    latest: '2.0.0',
    older: [
      { label: 'v1.x.x', link: '/v1/introduction/getting-started' },
    ],
    oldVersionBanner: {
      message: 'message',
      show: true,
    }
  },
  github: 'https://github.com/user/docusite',
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
    { key: 'api', value: { baseUrl: 'https://api.example.com' } },
  ],
  sourceLinks: {
    target: 'https://github.com/user/docusite/tree/master/src',
  },
})
