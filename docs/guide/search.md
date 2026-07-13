# Поиск

Docusite поддерживает два провайдера поиска: встроенный локальный поиск и Algolia.

## Локальный поиск (по умолчанию)

Локальный поиск работает «из коробки» на базе MiniSearch — никаких дополнительных настроек не требуется:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  search: 'local',
})
```

Если опция `search` не указана, по умолчанию используется `'local'`.

## Algolia

Для подключения Algolia DocSearch укажите конфигурацию провайдера:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    },
  },
})
```

### Поля Algolia

| Поле | Тип | Описание |
|---|---|---|
| `appId` | `string` | Идентификатор приложения Algolia |
| `apiKey` | `string` | API-ключ (только для поиска, публичный) |
| `indexName` | `string` | Название индекса |
| `placeholder` | `string?` | Плейсхолдер поля поиска |
| `searchParameters` | `Record<string, unknown>?` | Дополнительные параметры поиска Algolia |

## Отключение поиска

Чтобы полностью отключить поиск, можно использовать escape hatch:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  themeConfigOverrides: {
    search: {
      provider: 'local',
      options: {
        // настройте или отключите по необходимости
      },
    },
  },
})
```
