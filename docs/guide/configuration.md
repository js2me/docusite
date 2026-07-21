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
| `logos` | `{ main?: string; hero?: string; favicon?: string; banner?: string }` | — | Логотипы (`/public/...`): `main` — шапка, `hero` — главная (иначе `main`), `favicon` — вкладка (иначе `main`), `banner` — OG/Twitter-картинка |
| `colors` | `DocusiteColors` | — | Фирменные цвета ([подробнее](/guide/brand-colors)) |
| `nav` | `NavItem[]` | — | Навигация в шапке сайта |
| `sidebar` | `Sidebar` | — | Боковое меню |
| `locales` | `Record<string, DocusiteLocale>` | — | Локали для i18n ([подробнее](/guide/i18n)) |
| `versions` | `DocusiteVersions` | — | Версионирование документации ([подробнее](/guide/versioning)) |
| `changelog` | `boolean \| string \| DocusiteChangelog` | — | Ссылка на changelog ([подробнее](/guide/changelog)) |
| `search` | `DocusiteSearch` | `'local'` | Поиск ([подробнее](/guide/search)) |
| `llms` | `boolean \| DocusiteLlmsOptions` | `true` | Генерация llms.txt ([подробнее](/guide/llms)) |
| `sitemap` | `boolean \| DocusiteSitemapOptions` | `true` при наличии `github` | Генерация sitemap.xml |
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
    banner: '/public/banner.png',
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
  github: 'https://github.com/user/repo',
  contentInjections: [
    { key: 'version', value: { major: 2, minor: 0, full: '2.0.0' } },
  ],
})
```

## Sitemap

Docusite автоматически генерирует `sitemap.xml` при помощи встроенной функции VitePress. Если задана опция `github`, hostname для sitemap автоматически выводится из URL репозитория:

- `github: 'https://github.com/js2me/docusite'` → `hostname: 'https://js2me.github.io/docusite'`

```ts
export default defineConfig({
  github: 'https://github.com/js2me/docusite',
  // sitemap включён автоматически
})
```

Явное указание hostname:

```ts
export default defineConfig({
  sitemap: {
    hostname: 'https://myproject.dev',
  },
})
```

Отключение sitemap:

```ts
export default defineConfig({
  sitemap: false,
})
```

## Open Graph и Twitter Cards

Если известен hostname сайта (из `github` или `sitemap.hostname`), docusite автоматически добавляет в `<head>` теги для шаринга в соцсетях:

- `link[rel=canonical]`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `og:site_name`
- Twitter Card: `twitter:card` (`summary_large_image`), `twitter:site`, `twitter:title`, `twitter:description`

`title` и `description` берутся из конфига. Локаль — из `locales.root.lang` (по умолчанию `'en'`).

### Картинка для превью

Теги `og:image` / `twitter:image` добавляются **только** если задан `logos.banner`:

```ts
export default defineConfig({
  title: 'My Project',
  description: 'Документация моего проекта',
  github: 'https://github.com/user/repo',
  logos: {
    main: '/public/logo.svg',
    banner: '/public/banner.png', // → https://user.github.io/repo/banner.png
  },
})
```

Положите файл в `docs/public/` (например `docs/public/banner.png`). Для соцсетей лучше PNG или JPG, не SVG.

Hostname для абсолютных URL тот же, что и у sitemap:

- `github: 'https://github.com/user/repo'` → `https://user.github.io/repo`
- или явный `sitemap.hostname`

Если тег уже задан вручную в `head`, docusite его не дублирует.
