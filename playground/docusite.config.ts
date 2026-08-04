import { defineConfig } from 'docusite';

export default defineConfig({
  title: 'Docusite Playground',
  description: 'Test playground for docusite',
  logos: {
    main: '/public/logo.svg',
    hero: '/public/logo.svg',
  },
  colors: {
    light: ['#646cff', '#ff6466', '#21ffc7'],
    dark: ['#535bf2', '#ff6466', '#21ffc7'],
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
    },
  },
  nav: {
    '/': [
      { text: 'Guide', link: '/introduction/getting-started' },
      { text: 'API', link: '/api/overview' },
    ],
    '/v1/': [
      { text: 'Guide', link: '/v1/introduction/getting-started' },
      { text: 'API', link: '/v1/api/overview' },
      { text: 'Examples', link: '/v1/introduction/markdown-examples' },
    ],
    '/v0/': [
      { text: 'Guide', link: '/v0/introduction/getting-started' },
      { text: 'API', link: '/v0/api/overview' },
      { text: 'Examples', link: '/v0/introduction/markdown-examples' },
    ],
    '/ru/': [
      { text: 'Гайд', link: '/ru/introduction/getting-started' },
      { text: 'API', link: '/ru/api/overview' },
    ],
    '/ru/v1/': [
      { text: 'Гайд', link: '/ru/v1/introduction/getting-started' },
      { text: 'API', link: '/ru/v1/api/overview' },
      { text: 'Примеры', link: '/ru/v1/introduction/markdown-examples' },
    ],
    '/ru/v0/': [
      { text: 'Гайд', link: '/ru/v0/introduction/getting-started' },
      { text: 'API', link: '/ru/v0/api/overview' },
      { text: 'Примеры', link: '/ru/v0/introduction/markdown-examples' },
    ],
  },
  runtimeScript: () => {
    console.log('runtime script!');
  },
  sidebar: {
    '/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started' },
          { text: 'Markdown Examples', link: '/introduction/markdown-examples' },
          { text: 'Long Outline', link: '/introduction/long-outline' },
          ...Array.from({ length: 40 }, (_, i) => {
            const n = String(i + 1).padStart(2, '0')
            return { text: `Section ${i + 1}`, link: `/introduction/section-${n}` }
          }),
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
    '/v1/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/v1/introduction/getting-started' },
          { text: 'Markdown Examples', link: '/v1/introduction/markdown-examples' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/v1/api/overview' },
          { text: '<ReactMark /> Hooks', link: '/v1/api/react-hooks' },
        ],
      },
    ],
    '/v0/': [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/v0/introduction/getting-started' },
          { text: 'Markdown Examples', link: '/v0/introduction/markdown-examples' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/v0/api/overview' },
          { text: '<ReactMark /> Hooks', link: '/v0/api/react-hooks' },
        ],
      },
    ],
    '/ru/': [
      {
        text: 'Введение',
        items: [
          { text: 'Быстрый старт', link: '/ru/introduction/getting-started' },
          { text: 'Примеры Markdown', link: '/ru/introduction/markdown-examples' },
        ],
      },
      {
        text: 'Справочник API',
        items: [
          { text: 'Обзор', link: '/ru/api/overview' },
          { text: '<ReactMark /> Хуки', link: '/ru/api/react-hooks' },
        ],
      },
    ],
    '/ru/v1/': [
      {
        text: 'Введение',
        items: [
          { text: 'Быстрый старт', link: '/ru/v1/introduction/getting-started' },
          { text: 'Примеры Markdown', link: '/ru/v1/introduction/markdown-examples' },
        ],
      },
      {
        text: 'Справочник API',
        items: [
          { text: 'Обзор', link: '/ru/v1/api/overview' },
          { text: '<ReactMark /> Хуки', link: '/ru/v1/api/react-hooks' },
        ],
      },
    ],
    '/ru/v0/': [
      {
        text: 'Введение',
        items: [
          { text: 'Быстрый старт', link: '/ru/v0/introduction/getting-started' },
          { text: 'Примеры Markdown', link: '/ru/v0/introduction/markdown-examples' },
        ],
      },
      {
        text: 'Справочник API',
        items: [
          { text: 'Обзор', link: '/ru/v0/api/overview' },
          { text: '<ReactMark /> Хуки', link: '/ru/v0/api/react-hooks' },
        ],
      },
    ],
  },
  changelog: { src: 'CHANGELOG.md' },
  search: 'local',
  llms: true,
  versions: {
    latest: '2.0.0',
    latestBanner: {
      message: 'You are viewing the latest version ({versionLabel}).',
      type: 'info',
      dismissible: true,
    },
    older: [
      {
        label: 'v1.x.x',
        link: '/v1/introduction/getting-started',
        banner: {
          message: 'You are viewing an older version ({versionLabel}). Switch to the latest version.',
          link: { text: 'View latest →', href: '{latestLink}' },
          type: 'warning',
        },
      },
      {
        // v0 has no `banner` — falls back to `oldVersionBanner` below (deprecated API)
        label: 'v0.x.x',
        link: '/v0/introduction/getting-started',
      },
    ],
    // Deprecated: fallback for older versions without their own `banner` (v0 here)
    oldVersionBanner: {
      message: 'You are viewing a very old version. Switch to {latestLabel}.',
      show: true,
    },
  },
  banners: [
    { paths: '/', message: 'Welcome to the Docusite playground!', type: 'tip', dismissible: true },
  ],
  github: 'https://github.com/user/docusite',
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
    { key: 'api', value: { baseUrl: 'https://api.example.com' } },
  ],
  sourceLinks: {
    target: 'https://github.com/user/docusite/tree/master/src',
  },
})
