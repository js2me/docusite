import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'Docusite',
  description: 'Простой инструмент для документации на базе VitePress',
  colors: {
    light: ['#646cff', '#ff6466', '#21ffc7'],
    dark: ['#535bf2', '#ff6466', '#21ffc7'],
  },
  nav: [
    { text: 'Руководство', link: '/introduction/getting-started' },
    { text: 'API', link: '/api/define-config' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Введение',
        items: [
          { text: 'Начало работы', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'Руководство',
        items: [
          { text: 'Конфигурация', link: '/guide/configuration' },
          { text: 'Фирменные цвета', link: '/guide/brand-colors' },
          { text: 'Иконки features', link: '/guide/feature-icons' },
          { text: 'Поиск', link: '/guide/search' },
          { text: 'llms.txt', link: '/guide/llms' },
          { text: 'Changelog', link: '/guide/changelog' },
          { text: 'Подстановка контента', link: '/guide/content-injections' },
          { text: 'Клиентские скрипты', link: '/guide/runtime-scripts' },
          { text: '<ReactMark /> ReactMark', link: '/guide/react-mark' },
          { text: 'Интернационализация', link: '/guide/i18n' },
          { text: 'Пользовательский CSS', link: '/guide/custom-css' },
          { text: 'Прямой доступ к VitePress', link: '/guide/escape-hatches' },
        ],
      },
      {
        text: 'CLI',
        items: [
          { text: 'Команды', link: '/cli/commands' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'defineConfig', link: '/api/define-config' },
        ],
      },
    ],
  },
  changelog: { src: 'CHANGELOG.md' },
  search: 'local',
  llms: true,
  github: 'https://github.com/user/docusite',
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
  ],
})
