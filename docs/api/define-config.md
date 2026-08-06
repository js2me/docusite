# API: defineConfig

`defineConfig` — вспомогательная функция для типизированной конфигурации docusite.

## Использование

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  colors: { light: '#646cff', dark: '#535bf2' },
})
```

Функция является type-identity — она просто возвращает переданный объект, но обеспечивает полную типизацию и автодополнение в IDE.

## Типы

### DocusiteConfig

Основной интерфейс конфигурации:

```ts
interface DocusiteConfig {
  /** Путь к директории с документацией (по умолчанию: './docs') */
  docsDir?: string

  /** Базовый URL развёртывания (VitePress `base`, по умолчанию: '/') */
  base?: string

  /** Заголовок сайта */
  title?: string
  /** Описание сайта */
  description?: string
  /** Логотипы сайта — путь относительно docs, с `public/`
   *  (файл `docs/public/logo.svg` → `'/public/logo.svg'`).
   *  `main` — в шапке слева от названия;
   *  `hero` — на главной (`layout: home`); если не указан — берётся `main`;
   *  `favicon` — иконка вкладки; если не указан — берётся `main`;
   *  `banner` — картинка для Open Graph / Twitter Cards (например `'/public/banner.png'`) */
  logos?: {
    main?: string
    hero?: string
    favicon?: string
    banner?: string
  }

  /** Фирменные цвета — автогенерация CSS-переменных VitePress */
  colors?: DocusiteColors

  /** Навигация */
  nav?: DefaultTheme.NavItem[]
  /** Сайдбар */
  sidebar?: DefaultTheme.Sidebar

  /** Локали для i18n */
  locales?: Record<string, DocusiteLocale>

  /** Селектор версий — добавляет NavVersionsFlyout в навигацию */
  versions?: DocusiteVersions

  /** Глобальные баннеры-объявления, ограниченные префиксом пути (см. [Баннеры](/guide/banners)) */
  banners?: DocusiteScopedBanner[]

  /** Ссылка на CHANGELOG в навигации. Массив задаёт changelog-файлы пакетов монорепозитория. */
  changelog?: boolean | string | DocusiteChangelog | DocusiteChangelogPackage[]

  /** Провайдер поиска (по умолчанию: 'local') */
  search?: DocusiteSearch

  /** Включить генерацию llms.txt / llms-full.txt (по умолчанию: true) */
  llms?: boolean | DocusiteLlmsOptions

  /** Дополнительные теги <head> */
  head?: HeadConfig[]

  /** Ссылки на соцсети в навигации */
  socialLinks?: DefaultTheme.SocialLink[]

  /** Пользовательские CSS-файлы */
  customCss?: string[]

  /** Шаблонные переменные для markdown — используйте @{key.path} для подстановки.
   *  Встроенная переменная `packageJson` подставляется автоматически из package.json проекта. */
  contentInjections?: DocusiteContentInjection[]

  /** Клиентский скрипт — выполняется только в браузере (не при SSR) */
  runtimeScript?: () => void

  /** Переопределения темы VitePress (применяются последними) */
  themeConfigOverrides?: Partial<DefaultTheme.Config>

  /** Переопределения конфигурации сайта VitePress (применяются последними) */
  siteConfigOverrides?: Record<string, unknown>
}
```

### DocusiteColors

```ts
interface DocusiteColors {
  /** Цвет(а) для светлой темы — hex или кортеж из 3 цветов для градиента */
  light?: string | [string, string, string]
  /** Цвет(а) для тёмной темы — hex или кортеж из 3 цветов для градиента */
  dark?: string | [string, string, string]
}
```

### DocusiteLocale

```ts
interface DocusiteLocale {
  /** Отображаемое название, например 'English' */
  label: string
  /** HTML-атрибут lang, например 'en' */
  lang: string
  /** Префикс пути (обязателен для не-root локалей), например '/ru/' */
  link?: string
  /** Навигация для данной локали */
  nav?: DefaultTheme.NavItem[]
  /** Сайдбар для данной локали */
  sidebar?: DefaultTheme.Sidebar
}
```

### DocusiteBannerType

```ts
type DocusiteBannerType = 'info' | 'warning' | 'tip'
```

### DocusiteBanner

```ts
interface DocusiteBanner {
  /** Текст баннера. Поддерживает плейсхолдеры {latestLink}, {latestLabel}, {versionLabel} */
  message: string
  /** Кнопка-ссылка (call-to-action). href поддерживает те же плейсхолдеры */
  link?: { text: string; href: string }
  /** Визуальный стиль (по умолчанию: 'warning' для версионных, 'info' для глобальных) */
  type?: DocusiteBannerType
  /** Разрешить закрыть баннер (сохраняется в localStorage) */
  dismissible?: boolean
  /** Ключ localStorage для запоминания закрытия. Генерируется автоматически, если не задан */
  dismissKey?: string
}
```

### DocusiteScopedBanner

Расширяет `DocusiteBanner` ограничением по пути (для глобальных баннеров):

```ts
interface DocusiteScopedBanner extends DocusiteBanner {
  /** Префикс(ы) пути, где показывается баннер. '/' — все doc-страницы */
  paths: string | string[]
}
```

### DocusiteVersion

```ts
interface DocusiteVersion {
  /** Отображаемое название версии, например 'v6.x.x' */
  label: string
  /** Ссылка на стартовую страницу версии */
  link: string
  /** Баннер для этой версии. false — явно отключить */
  banner?: DocusiteBanner | false
}
```

### DocusiteVersions

```ts
interface DocusiteVersions {
  /** Метка актуальной версии, например '7.2.1' */
  latest: string
  /** Старые версии */
  older?: DocusiteVersion[]
  /** Баннер на страницах актуальной версии */
  latestBanner?: DocusiteBanner | false
  /** ⚠️ deprecated. Fallback-баннер для старых версий без своего banner */
  oldVersionBanner?: { show?: boolean; message?: string }
}
```

Подробности и примеры — в разделе [Баннеры](/guide/banners).

### DocusiteSearch

```ts
type DocusiteSearch =
  | 'local'
  | { provider: 'algolia'; options: DocusiteAlgoliaOptions }
```

### DocusiteAlgoliaOptions

```ts
interface DocusiteAlgoliaOptions {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: Record<string, unknown>
}
```

### DocusiteLlmsOptions

```ts
interface DocusiteLlmsOptions {
  /** Генерировать llms.txt (по умолчанию: true) */
  llmsTxt?: boolean
  /** Генерировать llms-full.txt (по умолчанию: true) */
  llmsFullTxt?: boolean
  /** Глоб-шаблоны для исключения файлов */
  ignoreFiles?: string[]
  /** Удалять frontmatter из вывода (по умолчанию: true) */
  ignoreFrontmatter?: boolean
  /** Описание проекта для llms.txt */
  description?: string
}
```

### DocusiteChangelog

```ts
interface DocusiteChangelog {
  /** Путь к CHANGELOG.md (относительно корня проекта) */
  src: string
  /** Кастомный путь ссылки (по умолчанию: '/changelog') */
  link?: string
}

interface DocusiteChangelogPackage {
  /** Имя пакета в навигации */
  name: string
  /** Путь к CHANGELOG.md (относительно корня проекта) */
  path: string
}
```

### DocusiteContentInjection

```ts
interface DocusiteContentInjection {
  /** Имя переменной — используется как @{key} или @{key.path} */
  key: string
  /** Любое JSON-сериализуемое значение */
  value: unknown
}
```

Встроенная переменная `packageJson` добавляется автоматически из `package.json` проекта. Пользовательские `contentInjections` с тем же `key` переопределяют встроенные.

## Импорт типов

Для использования типов в TypeScript:

```ts
import type { DocusiteConfig, DocusiteColors, DocusiteBanner, DocusiteScopedBanner, DocusiteVersions } from 'docusite'
```
