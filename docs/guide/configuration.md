# Конфигурация

Вся настройка docusite выполняется через файл `docusite.config.ts` в корне проекта. Используйте функцию `defineConfig()` для получения подсказок типов:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
})
```

## Путь к файлу конфигурации

Docusite ищет конфигурацию в следующем порядке:

1. `docusite.config.ts`
2. `docusite.config.mts`
3. `docusite.config.js`
4. `docusite.config.mjs`

## Полный список опций

| Опция | Тип | По умолчанию | Описание |
|---|---|---|---|
| `docsDir` | `string` | `'./docs'` | Путь к директории с документацией |
| `base` | `string` | `'/'` | Базовый URL развёртывания (VitePress `base`) — для деплоя в подкаталог, например `'/bar/'` |
| `title` | `string` | — | Заголовок сайта |
| `description` | `string` | — | Описание сайта |
| `logos` | `{ main?: string; hero?: string; favicon?: string }` | — | Логотипы (`/public/...`): `main` — шапка, `hero` — главная (иначе `main`), `favicon` — вкладка (иначе `main`) |
| `colors` | `DocusiteColors` | — | Фирменные цвета ([подробнее](/guide/brand-colors)) |
| `nav` | `NavItem[]` | — | Навигация в шапке сайта |
| `sidebar` | `Sidebar` | — | Боковое меню |
| `locales` | `Record<string, DocusiteLocale>` | — | Локали для i18n ([подробнее](/guide/i18n)) |
| `changelog` | `boolean \| string \| DocusiteChangelog` | — | Ссылка на changelog ([подробнее](/guide/changelog)) |
| `search` | `DocusiteSearch` | `'local'` | Поиск ([подробнее](/guide/search)) |
| `llms` | `boolean \| DocusiteLlmsOptions` | `true` | Генерация llms.txt ([подробнее](/guide/llms)) |
| `head` | `HeadConfig[]` | — | Дополнительные теги `<head>` |
| `socialLinks` | `SocialLink[]` | — | Ссылки на соцсети |
| `customCss` | `string[]` | — | Пользовательские CSS-файлы ([подробнее](/guide/custom-css)) |
| `contentInjections` | `DocusiteContentInjection[]` | `packageJson` из `package.json` | Шаблонные переменные ([подробнее](/guide/content-injections)) |
| `runtimeScript` | `() => void` | — | Клиентский скрипт ([подробнее](/guide/runtime-scripts)) |
| `themeConfigOverrides` | `Partial<DefaultTheme.Config>` | — | Переопределения темы VitePress ([подробнее](/guide/escape-hatches)) |
| `siteConfigOverrides` | `Record<string, unknown>` | — | Переопределения конфигурации сайта VitePress ([подробнее](/guide/escape-hatches)) |

## Минимальный пример

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  colors: { light: '#646cff', dark: '#535bf2' },
  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
  ],
  sidebar: {
    '/': [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
    ],
  },
})
```

## Полный пример

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
  logos: {
    main: '/public/logo.svg',
    hero: '/public/logo.svg',
  },
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
        ],
      },
    ],
  },
  changelog: { src: '../CHANGELOG.md' },
  search: 'local',
  llms: true,
  socialLinks: [
    { icon: 'github', link: 'https://github.com/user/repo' },
  ],
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
  ],
})
```
