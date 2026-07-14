# Прямой доступ к VitePress (escape hatches)

Docusite покрывает большинство типичных сценариев документации, но если вам нужен доступ к возможностям VitePress, которые не представлены в конфигурации docusite, используйте escape hatches.

## themeConfigOverrides

Позволяет переопределить любые настройки темы VitePress. Применяется **после** всех вычислений docusite, поэтому имеет наивысший приоритет:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  themeConfigOverrides: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024 My Project',
    },
    outline: {
      level: [2, 3],
      label: 'На этой странице',
    },
    docFooter: {
      prev: 'Предыдущая',
      next: 'Следующая',
    },
  },
})
```

## siteConfigOverrides

Позволяет переопределить настройки сайта VitePress на уровне конфигурации:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  siteConfigOverrides: {
    cleanUrls: true,
    lastUpdated: true,
  },
})
```

## Когда использовать

| Ситуация | Используйте |
|---|---|
| Нужен footer | `themeConfigOverrides.footer` |
| Настроить оглавление | `themeConfigOverrides.outline` |
| Переопределить текст навигации | `themeConfigOverrides.docFooter` |
| Задать базовый URL развёртывания | `base` (или `siteConfigOverrides.base`) |
| Включить чистые URL | `siteConfigOverrides.cleanUrls` |
| Настроить sitemap | `sitemap` (автоматически из `github`) |
| Включить дату обновления | `siteConfigOverrides.lastUpdated` |

::: warning
Escape hatches обходят абстракцию docusite. При обновлении docusite поведение может измениться. Используйте их только если соответствующая опция отсутствует в [`DocusiteConfig`](/api/define-config).
:::
